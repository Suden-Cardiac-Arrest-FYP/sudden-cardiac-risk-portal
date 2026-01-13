import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'primeng/popover';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  filter,
  map,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  Subject,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { getDtoNameById } from '../../app/relationships/reationshipConfig';

import { IReport, ReportDto, ReportResponse } from '../../dto/Report.dto';
import { ReportService } from '../../services/Report.service';
import { CreateUpdateReport } from './create-update-report/create-update-report';
import { roleConfig } from '../../app/access-control/roleConfig';
import { Calendar } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';

interface ReportCard {
  id: number;
  title: string;
  type: 'all' | 'today' | 'daily' | 'timeframe';
  category: 'registered' | 'validated' | 'employee' | 'epf' | 'leave';
  enabled: boolean;
  requiresDate?: boolean;
  requiresDateRange?: boolean;
  description: string;
  icon: string;
  color: string;
  downloadCount?: number;
  lastUpdated?: Date;
}

interface DashboardStats {
  totalReports: number;
  availableReports: number;
  downloadsToday: number;
  lastUpdated: Date;
}

@Component({
  standalone: true,
  selector: 'app-Report',
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    PopoverModule,
    OverlayBadgeModule,
    AvatarModule,
    DividerModule,
    InputTextModule,
    ConfirmDialog,
    Calendar,
    FormsModule,
  ],
  templateUrl: './Report.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: './Report.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    ReportService,
  ],
})
export class ReportComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  // Dashboard statistics
  dashboardStats: DashboardStats = {
    totalReports: 0,
    availableReports: 0,
    downloadsToday: 12, // This would come from API
    lastUpdated: new Date()
  };

  // Enhanced report card configurations
  reportCards: ReportCard[] = [
    {
      id: 1,
      title: 'Employee Details Report',
      type: 'all',
      category: 'employee',
      enabled: true,
      description: 'Comprehensive report containing all employee information including personal details, contact information, and employment status.',
      icon: 'fas fa-users',
      color: 'blue',
      downloadCount: 45,
      lastUpdated: new Date()
    },
    {
      id: 2,
      title: 'EPF Details Report',
      type: 'today',
      category: 'epf',
      enabled: true,
      description: 'Detailed Employee Provident Fund information for all employees including contributions, balances, and fund details.',
      icon: 'fas fa-piggy-bank',
      color: 'green',
      downloadCount: 23,
      lastUpdated: new Date()
    },
    {
      id: 3,
      title: 'Leave Details - Daily',
      type: 'daily',
      category: 'leave',
      enabled: false, // Backend not implemented
      requiresDate: true,
      description: 'Daily leave reports for specific dates including leave types, durations, and approval status.',
      icon: 'fas fa-calendar-day',
      color: 'orange',
      downloadCount: 0
    },
    {
      id: 4,
      title: 'Leave Details - Time Frame',
      type: 'timeframe',
      category: 'leave',
      enabled: true,
      requiresDateRange: true,
      description: 'Generate leave reports for specific date ranges including leave types, durations, and approval status.',
      icon: 'fas fa-calendar-times',
      color: 'purple',
      downloadCount: 18,
      lastUpdated: new Date()
    }
  ];

  // Date tracking for different report types
  dailyDates: { [key: string]: Date | null } = {};
  startDates: { [key: string]: Date | null } = {};
  endDates: { [key: string]: Date | null } = {};

  // Loading states for individual reports
  reportLoadingStates: { [key: number]: boolean } = {};

  // Search and pagination (if needed for future expansion)
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  ReportData: ReportDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  dtoName: string | undefined = 'Report';

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.initializeComponent();
    this.setupSearchSubscription();
    this.calculateDashboardStats();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private initializeComponent(): void {
    // Initialize loading states
    this.reportCards.forEach(card => {
      this.reportLoadingStates[card.id] = false;
    });

    // Set default dates for time frame reports
    this.initializeDateRanges();
  }

  private initializeDateRanges(): void {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    this.reportCards.forEach(card => {
      if (card.requiresDateRange) {
        const key = this.getCardKey(card);
        this.startDates[key] = lastWeek;
        this.endDates[key] = today;
      }
    });
  }

  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.searchQuery = searchTerm;
        this.first = 0;
        this.page = 1;
      });
  }

  private calculateDashboardStats(): void {
    this.dashboardStats = {
      totalReports: this.reportCards.length,
      availableReports: this.reportCards.filter(card => card.enabled).length,
      downloadsToday: this.reportCards.reduce((total, card) => total + (card.downloadCount || 0), 0),
      lastUpdated: new Date()
    };
  }

  downloadReport(card: ReportCard): void {
    if (!card.enabled) {
      this.showFeatureComingSoonMessage(card);
      return;
    }

    // Set loading state
    this.reportLoadingStates[card.id] = true;

    const params = this.buildReportParams(card);
    if (!params) {
      this.reportLoadingStates[card.id] = false;
      return;
    }

    // Show preparing message
    this.showPreparingDownloadMessage(card);

    // Simulate API call - replace with actual service call
    this.simulateDownload(card, params);
  }

  private simulateDownload(card: ReportCard, params: any): void {
    // This is a simulation - replace with actual API call
    setTimeout(() => {
      this.reportLoadingStates[card.id] = false;
      
      // Update download count
      if (card.downloadCount !== undefined) {
        card.downloadCount++;
      }
      
      // Update last updated
      card.lastUpdated = new Date();
      
      // Recalculate stats
      this.calculateDashboardStats();
      
      // Show success message
      this.showDownloadSuccessMessage(card);
    }, 2000);

    // Uncomment and modify this for actual implementation:
    /*
    const downloadMethod = this.getDownloadMethod(card);
    downloadMethod(params).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleDownloadSuccess(response, card);
        this.reportLoadingStates[card.id] = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleDownloadError(error, card);
        this.reportLoadingStates[card.id] = false;
      },
    });
    */
  }

  private getDownloadMethod(card: ReportCard) {
    // switch (card.category) {
    //   case 'employee':
    //     return this.reportService.downloadEmployeeDetails.bind(this.reportService);
    //   case 'epf':
    //     return this.reportService.downloadEPFDetails.bind(this.reportService);
    //   case 'leave':
    //     return this.reportService.downloadLeaveDetails.bind(this.reportService);
    //   default:
    //     return this.reportService.downloadAllCustomers.bind(this.reportService);
    // }
  }

  private buildReportParams(card: ReportCard): any {
    const key = this.getCardKey(card);
    const today = new Date();

    switch (card.type) {
      case 'all':
        return {}; // No date parameters needed for all records

      case 'today':
        const todayStr = this.formatDateForAPI(today);
        return {
          startDate: todayStr,
          endDate: todayStr,
        };

      case 'daily':
        const selectedDate = this.dailyDates[key];
        if (!selectedDate) {
          this.showDateRequiredMessage('Please select a date for the daily report.');
          return null;
        }
        const dateStr = this.formatDateForAPI(selectedDate);
        return {
          startDate: dateStr,
          endDate: dateStr,
        };

      case 'timeframe':
        const startDate = this.startDates[key];
        const endDate = this.endDates[key];
        
        const validation = this.validateDateRange(startDate, endDate);
        if (!validation.isValid) {
          this.showDateRequiredMessage(validation.message);
          return null;
        }
        
        return {
          startDate: this.formatDateForAPI(startDate!),
          endDate: this.formatDateForAPI(endDate!),
        };

      default:
        return {};
    }
  }

  private validateDateRange(startDate: Date | null, endDate: Date | null): { isValid: boolean; message: string } {
    if (!startDate || !endDate) {
      return {
        isValid: false,
        message: 'Please select both start and end dates for the time frame report.'
      };
    }
    
    if (startDate > endDate) {
      return {
        isValid: false,
        message: 'Start date must be before or equal to end date.'
      };
    }
    
    // Check if date range is too large (optional)
    const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDifference > 365) {
      return {
        isValid: false,
        message: 'Date range cannot exceed 365 days.'
      };
    }
    
    return { isValid: true, message: '' };
  }

  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getCardKey(card: ReportCard): string {
    return `${card.category}_${card.type}`;
  }

  isReportLoading(cardId: number): boolean {
    return this.reportLoadingStates[cardId] || false;
  }

  getCardColorClasses(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colorMap[color] || 'from-gray-500 to-gray-600';
  }

  getIconColorClasses(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
      red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    };
    return colorMap[color] || 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
  }

  getButtonColorClasses(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-600 hover:bg-blue-700 border-blue-600',
      green: 'bg-green-600 hover:bg-green-700 border-green-600',
      purple: 'bg-purple-600 hover:bg-purple-700 border-purple-600',
      orange: 'bg-orange-600 hover:bg-orange-700 border-orange-600',
      red: 'bg-red-600 hover:bg-red-700 border-red-600'
    };
    return colorMap[color] || 'bg-gray-600 hover:bg-gray-700 border-gray-600';
  }

  // Message service helpers
  private showFeatureComingSoonMessage(card: ReportCard): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Feature Coming Soon',
      detail: `${card.title} is currently under development and will be available soon.`,
      life: 4000,
    });
  }

  private showPreparingDownloadMessage(card: ReportCard): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Preparing Download',
      detail: `Your ${card.title.toLowerCase()} is being prepared. Please wait...`,
      life: 2000,
    });
  }

  private showDownloadSuccessMessage(card: ReportCard): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Download Complete',
      detail: `${card.title} has been downloaded successfully.`,
      life: 3000,
    });
  }

  private showDateRequiredMessage(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Date Required',
      detail: message,
      life: 3000,
    });
  }

  private handleDownloadSuccess(response: HttpResponse<Blob>, card: ReportCard): void {
    // Handle file download
    const blob = response.body;
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    }

    // Update statistics
    if (card.downloadCount !== undefined) {
      card.downloadCount++;
    }
    card.lastUpdated = new Date();
    this.calculateDashboardStats();

    this.showDownloadSuccessMessage(card);
  }

  private handleDownloadError(error: HttpErrorResponse, card: ReportCard): void {
    console.error('Download error:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: `Failed to download ${card.title}. Please try again.`,
      life: 5000,
    });
  }

  // Access control methods
  hasAccess(dtoId: string, accessType: string): boolean {
    const roleName = localStorage.getItem('roleName');
    if (roleName !== null) {
      const rolePermissions = roleConfig[roleName];
      if (rolePermissions && rolePermissions[dtoId]) {
        if (rolePermissions[dtoId]?.includes(accessType)) {
          return true;
        } else {
          if (accessType === 'DELETE') {
            this.canDelete = false;
          }
          if (accessType === 'UPDATE') {
            this.canUpdate = false;
          }
        }
      }
    }
    return false;
  }

  // Utility methods for future expansion
  reloadState(): void {
    this.page = 1;
    this.first = 0;
    this.isDataLoading = true;
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  // Pagination methods (for future use)
  next(): void {
    this.page++;
    this.first = (this.page - 1) * this.rows;
  }

  prev(): void {
    this.page--;
    this.first = (this.page - 1) * this.rows;
  }

  isLastPage(): boolean {
    return this.totalRecords ? this.first + this.rows >= this.totalRecords : true;
  }

  isFirstPage(): boolean {
    return this.page === 1;
  }

  get currentPage(): number {
    return this.page;
  }

  get totalPages(): number {
    return this.totalRecords ? Math.ceil(this.totalRecords / this.rows) : 0;
  }
}