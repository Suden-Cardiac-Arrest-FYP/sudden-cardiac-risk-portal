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
import { CommonModule, formatDate } from '@angular/common';
import { PopoverModule } from 'primeng/popover';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { SidebarModule } from 'primeng/sidebar';
import { SelectModule } from 'primeng/select';
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

import { IHoliday, HolidayDto, HolidayResponse } from '../../dto/Holiday.dto';
import { HolidayService } from '../../services/Holiday.service';
import { CreateUpdateHoliday } from './create-update-holiday/create-update-holiday';
import { roleConfig } from '../../app/access-control/roleConfig';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { CalendarModule } from 'primeng/calendar';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  holidays: HolidayDto[];
}

interface CategoryColor {
  background: string;
  border: string;
  text: string;
}

interface CategoryOption {
  label: string;
  value: string;
  color: CategoryColor;
}

@Component({
  standalone: true,
  selector: 'app-Holiday',
  imports: [
    CommonModule,
    ToastModule,
    IconField,
    InputIcon,
    ButtonModule,
    TableModule,
    TooltipModule,
    PopoverModule,
    OverlayBadgeModule,
    AvatarModule,
    DividerModule,
    InputTextModule,
    ConfirmDialog,
    Tooltip,
    FormsModule,
    DropdownModule,
    CalendarModule,
    SidebarModule,
    SelectModule,
  ],
  templateUrl: './Holiday.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././Holiday.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    HolidayService,
  ],
})
export class HolidayComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  
  // Original properties
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  HolidayData: HolidayDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;
  dtoName: string | undefined = 'Holiday';
  
  // Calendar specific properties
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  showHolidayDetailsSidebar: boolean = false;
  selectedHolidayDetails: HolidayDto | null = null;
  selectedCategory: string | null = null;
  
  // Category management
  categoryOptions: CategoryOption[] = [];
  availableCategories: CategoryOption[] = [];
  
  // Default category colors
  private categoryColors: { [key: string]: CategoryColor } = {
    'National': { background: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    'Religious': { background: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
    'Cultural': { background: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
    'International': { background: '#dcfce7', border: '#22c55e', text: '#15803d' },
    'Regional': { background: '#fce7f3', border: '#ec4899', text: '#be185d' },
    'Corporate': { background: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' },
    'Personal': { background: '#fff7ed', border: '#f97316', text: '#c2410c' },
    'Other': { background: '#f1f5f9', border: '#64748b', text: '#334155' }
  };

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private holidayService = inject(HolidayService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  today: Date = new Date();

  ngOnInit() {
    this.initializeCategoryOptions();
    this.findAllHoliday();
    this.generateCalendar();
    
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.searchQuery = searchTerm;
        this.findAllHoliday();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private initializeCategoryOptions(): void {
    this.categoryOptions = Object.keys(this.categoryColors).map(key => ({
      label: key,
      value: key,
      color: this.categoryColors[key]
    }));
  }

  private generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get first day of month and calculate starting date
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayData: CalendarDay = {
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.getTime() === today.getTime(),
        holidays: this.getHolidaysForDate(currentDate)
      };
      
      this.calendarDays.push(dayData);
    }
  }

  private getHolidaysForDate(date: Date): HolidayDto[] {
    const dateStr = formatDate(date, 'yyyy-MM-dd', 'en-US');
    return this.HolidayData.filter(holiday => {
      const holidayDate = formatDate(new Date(holiday.Date!), 'yyyy-MM-dd', 'en-US');
      return holidayDate === dateStr;
    });
  }

  private updateCalendarHolidays(): void {
    this.calendarDays.forEach(day => {
      day.holidays = this.getHolidaysForDate(day.date);
    });
    this.updateAvailableCategories();
  }

  private updateAvailableCategories(): void {
    const categories = new Set<string>();
    this.HolidayData.forEach(holiday => {
      if (holiday.Category) {
        holiday.Category.forEach(cat => categories.add(cat.label));
      }
    });
    
    this.availableCategories = Array.from(categories).map(cat => ({
      label: cat,
      value: cat,
      color: this.categoryColors[cat] || this.categoryColors['Other']
    }));
  }

  // Calendar navigation methods
  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
    this.findAllHoliday();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
    this.findAllHoliday();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
    this.findAllHoliday();
  }

  onDateChange(): void {
    this.generateCalendar();
    this.findAllHoliday();
  }

  // Holiday management methods
  showHolidayDetails(holiday: HolidayDto): void {
    this.selectedHolidayDetails = holiday;
    this.showHolidayDetailsSidebar = true;
  }

  getHolidayCategoryColor(categories: any[]): CategoryColor {
    if (!categories || categories.length === 0) {
      return this.categoryColors['Other'];
    }
    
    const categoryLabel = categories[0].label || categories[0];
    return this.categoryColors[categoryLabel] || this.categoryColors['Other'];
  }

  onCategoryFilter(): void {
    this.findAllHoliday();
  }

  // Track by functions for performance
  trackByDate(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  trackByHoliday(index: number, holiday: HolidayDto): string {
    return holiday.HolidayId!;
  }

  formatted(): string {
    return formatDate(this.currentDate, 'yyyy-MM', 'en-US');
  }

  isPastDate(dateString: string): boolean {
    const holidayDate = new Date(dateString);
    const today = new Date();
    holidayDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return holidayDate < today;
  }

  /**
   * Fetches all Holiday with given parameters
   */
  findAllHoliday(): void {
    this.isDataLoading = true;
    const params = {
      page: '1',
      size: '1000', // Get all holidays for calendar view
      searchTerm: this.searchQuery,
      date: this.formatted(),
      category: this.selectedCategory || ''
    };
    
    this.holidayService
      .findAllHoliday(params)
      .pipe(
        filter((res: HttpResponse<HolidayResponse>) => res.ok),
        map((res: HttpResponse<HolidayResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: HolidayResponse | null) => {
          if (res != null) {
            this.HolidayData = res.Holiday || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.HolidayData = [];
            this.totalRecords = 0;
          }
          this.updateCalendarHolidays();
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all Holiday.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all Holiday', res);
        },
      });
  }

  // Dialog methods
  showCreateHolidayDialog(selectedDate?: Date): void {
    const ref = this.dialogService.open(CreateUpdateHoliday, {
      data: selectedDate ? { selectedDate } : null,
      header: 'Create Holiday',
      width: '40%',
      closable: true,
      modal: true,
    });
    
    ref.onClose.subscribe(() => {
      this.findAllHoliday();
      this.showHolidayDetailsSidebar = false;
    });
  }

  showEditHolidayDialog(holiday: HolidayDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const ref = this.dialogService.open(CreateUpdateHoliday, {
      data: holiday,
      header: 'Update Holiday',
      width: '40%',
      closable: true,
      modal: true,
    });
    
    ref.onClose.subscribe(() => {
      this.findAllHoliday();
      this.showHolidayDetailsSidebar = false;
    });
  }

  // Delete Holiday
  deleteHoliday(holiday: HolidayDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.confirmationService.confirm({
      header: 'Delete Holiday',
      message: `Are you sure you want to delete "${holiday.HolidayName}"?`,
      accept: () => {
        this.confirmDeleteHoliday(holiday);
      },
    });
  }

  confirmDeleteHoliday(holiday: HolidayDto): void {
    this.holidayService
      .deleteHoliday({ holidayId: holiday.HolidayId })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.HolidayData = this.HolidayData.filter(
            (val) => val.HolidayId !== holiday.HolidayId
          );
          this.updateCalendarHolidays();
          this.showHolidayDetailsSidebar = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `Holiday "${holiday.HolidayName}" has been deleted successfully.`,
            life: 3000,
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete holiday.',
            life: 3000,
          });
        }
      });
  }

  // Access control
  hasAccess(dtoId: string, accessType: string): boolean {
    const roleName = localStorage.getItem('roleName');
    if (roleName !== null) {
      const rolePermissions = roleConfig[roleName];
      if (rolePermissions && rolePermissions[dtoId]) {
        if (rolePermissions[dtoId]?.includes(accessType)) {
          return true;
        } else {
          if (accessType == 'DELETE') {
            this.canDelete = false;
          }
          if (accessType == 'UPDATE') {
            this.canUpdate = false;
          }
        }
      }
    }
    return false;
  }

  // Utility methods
  reloadState(): void {
    this.page = 1;
    this.first = 0;
    this.searchQuery = '';
    this.selectedCategory = null;
    this.isDataLoading = true;
    this.findAllHoliday();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  // Legacy methods for backward compatibility
  next(): void {
    this.nextMonth();
  }

  prev(): void {
    this.previousMonth();
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

  // File operations (if needed)
  downloadFile(): void {
    this.holidayService.downloadFile().subscribe(
      (response: HttpResponse<Blob>) => {
        const contentDispositionHeader: string | null = response.headers.get(
          'content-disposition'
        );
        const filename: string = this.getFilenameFromContentDisposition(
          contentDispositionHeader
        );

        if (response.body) {
          const blobUrl: string = window.URL.createObjectURL(response.body);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = blobUrl;
          a.download = filename;
          a.click();

          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Download Successful',
          detail: `Excel successfully downloaded.`,
          life: 3000,
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Download Failed',
          detail: `Failed to download excel.`,
          life: 3000,
        });
      }
    );
  }

  private getFilenameFromContentDisposition(header: string | null): string {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);

    if (!header) {
      return 'Holidays_' + date + '.csv';
    }
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(header);
    if (!matches || !matches[1]) {
      return 'Holidays_' + date + '.csv';
    }
    return matches[1].replace(/['"]/g, '');
  }

  uploadFile(event: any): void {
    const file: File = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', file);

    this.holidayService.uploadFile(formData).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: `File "${file.name}" successfully uploaded.`,
          life: 3000,
        });
        this.findAllHoliday();
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: `Failed to upload file "${file.name}".`,
          life: 3000,
        });
      }
    );
  }
}