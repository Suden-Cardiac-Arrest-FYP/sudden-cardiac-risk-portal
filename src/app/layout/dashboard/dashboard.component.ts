import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import {
  SuperAdminDashboardDto,
  EmployeeDashboardDto,
  DashboardStatsDto,
  LeaveApprovalStatsDto,
  LeaveStatsDto,
} from '../../../dto/Dashborad.dto';
import { DashboardService } from '../../../services/Dashboard.service';
import { AuthService, User } from '@auth0/auth0-angular';
import { Subject, takeUntil } from 'rxjs';
// Import CountUp
import { CountUp } from 'countup.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChartModule,
    SelectButtonModule,
    FormsModule,
    AvatarModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    MenuModule,
    TagModule,
    DatePickerModule,
    CardModule,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // ViewChild for countup elements
  @ViewChild('departmentCount', { static: false })
  departmentCountRef!: ElementRef;
  @ViewChild('designationCount', { static: false })
  designationCountRef!: ElementRef;
  @ViewChild('employeeCount', { static: false }) employeeCountRef!: ElementRef;
  @ViewChild('holidayCount', { static: false }) holidayCountRef!: ElementRef;
  @ViewChild('approvedCount', { static: false }) approvedCountRef!: ElementRef;
  @ViewChild('pendingCount', { static: false }) pendingCountRef!: ElementRef;
  @ViewChild('rejectedCount', { static: false }) rejectedCountRef!: ElementRef;

  // Role Management
  userRole: string = '';

  // Chart Data
  pieChartData: any;
  pieChartOptions: any;

  // Dashboard Data
  superAdminData: SuperAdminDashboardDto | null = null;
  employeeData: EmployeeDashboardDto | null = null;
  dashboardStats: DashboardStatsDto | null = null;
  leaveApprovalStats: LeaveApprovalStatsDto | null = null;
  employeeLeaveStats: LeaveStatsDto | null = null;

  // UI State
  loading = true;
  menuItems: MenuItem[] = [];
  EmployeeId: string | undefined = '';
  HodId: string | undefined = '';

  user: User | undefined = {};

  // CountUp instances
  private countUpInstances: CountUp[] = [];

  // Inject Dependencies
  private dashboardService = inject(DashboardService);
  private cd = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.userRole = this.user?.['user_metadata']['role'];

        if (this.user?.['user_metadata']['employeeId'] !== undefined) {
          this.EmployeeId = this.user?.['user_metadata']['employeeId'];
        }
        this.initializeMenuItems();
        this.loadDashboardData();
      }
    });
  }

  getPercentage(value: number): number {
    if (!this.leaveApprovalStats) return 0;

    const total =
      this.leaveApprovalStats.approved +
      this.leaveApprovalStats.pending +
      this.leaveApprovalStats.rejected;

    if (total === 0) return 0;

    return Math.round((value / total) * 100);
  }

  /**
   * Get total leave requests
   */
  getTotalLeaveRequests(): number {
    if (!this.leaveApprovalStats) return 0;

    return (
      this.leaveApprovalStats.approved +
      this.leaveApprovalStats.pending +
      this.leaveApprovalStats.rejected
    );
  }

  ngAfterViewInit() {
    // Initialize countup after view is initialized
    setTimeout(() => {
      this.initializeCountUp();
    }, 100);
  }

  private initializeMenuItems() {
    this.menuItems = [
      {
        label: 'Refresh',
        icon: 'pi pi-refresh',
        command: () => this.loadDashboardData(),
      },
      {
        label: 'Export',
        icon: 'pi pi-upload',
      },
    ];
  }

  private loadDashboardData() {
    this.loading = true;

    if (this.userRole != 'Employee') {
      this.loadSuperAdminDashboard();
    } else {
      this.loadEmployeeDashboard();
    }
  }

  private loadSuperAdminDashboard() {
    // Load dashboard stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.cd.markForCheck();
        // Start countup animation after data is loaded
        setTimeout(() => this.startCountUpAnimation(), 100);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        // Fallback to mock data
        this.dashboardStats = this.getMockDashboardStats();
        this.cd.markForCheck();
        setTimeout(() => this.startCountUpAnimation(), 100);
      },
    });

    // Load leave approval stats
    this.dashboardService.getLeaveApprovalStats().subscribe({
      next: (leaveStats) => {
        this.leaveApprovalStats = leaveStats;
        this.initializePieChart();
        this.loading = false;
        this.cd.markForCheck();
        // Start leave stats countup
        setTimeout(() => this.startLeaveStatsCountUp(), 100);
      },
      error: (error) => {
        console.error('Error loading leave approval stats:', error);
        // Fallback to mock data
        this.leaveApprovalStats = this.getMockLeaveApprovalStats();
        this.initializePieChart();
        this.loading = false;
        this.cd.markForCheck();
        setTimeout(() => this.startLeaveStatsCountUp(), 100);
      },
    });
  }

  private loadEmployeeDashboard() {
    this.dashboardService.getEmployeeLeaveStats().subscribe({
      next: (leaveStats) => {
        this.employeeLeaveStats = leaveStats;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (error) => {
        console.error('Error loading employee leave stats:', error);
        // Fallback to mock data
        this.employeeLeaveStats = this.getMockEmployeeLeaveStats();
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  private initializeCountUp() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Clear previous instances
    this.countUpInstances.forEach((instance) => instance.reset());
    this.countUpInstances = [];
  }

  private startCountUpAnimation() {
    if (!isPlatformBrowser(this.platformId) || !this.dashboardStats) {
      return;
    }

    const options = {
      duration: 2,
      enableScrollSpy: false,
      scrollSpyOnce: true,
    };

    try {
      // Department count
      if (this.departmentCountRef?.nativeElement) {
        const departmentCountUp = new CountUp(
          this.departmentCountRef.nativeElement,
          this.dashboardStats.departmentCount,
          options
        );
        departmentCountUp.start();
        this.countUpInstances.push(departmentCountUp);
      }

      // Designation count
      if (this.designationCountRef?.nativeElement) {
        const designationCountUp = new CountUp(
          this.designationCountRef.nativeElement,
          this.dashboardStats.designationCount,
          options
        );
        designationCountUp.start();
        this.countUpInstances.push(designationCountUp);
      }

      // Employee count
      if (this.employeeCountRef?.nativeElement) {
        const employeeCountUp = new CountUp(
          this.employeeCountRef.nativeElement,
          this.dashboardStats.employeeCount,
          options
        );
        employeeCountUp.start();
        this.countUpInstances.push(employeeCountUp);
      }

      // Holiday count
      if (this.holidayCountRef?.nativeElement) {
        const holidayCountUp = new CountUp(
          this.holidayCountRef.nativeElement,
          this.dashboardStats.currentMonthHolidays,
          options
        );
        holidayCountUp.start();
        this.countUpInstances.push(holidayCountUp);
      }
    } catch (error) {
      console.error('Error initializing CountUp:', error);
    }
  }

  private startLeaveStatsCountUp() {
    if (!isPlatformBrowser(this.platformId) || !this.leaveApprovalStats) {
      return;
    }

    const options = {
      duration: 2,
      enableScrollSpy: false,
      scrollSpyOnce: true,
    };

    try {
      // Approved count
      if (this.approvedCountRef?.nativeElement) {
        const approvedCountUp = new CountUp(
          this.approvedCountRef.nativeElement,
          this.leaveApprovalStats.approved,
          options
        );
        approvedCountUp.start();
        this.countUpInstances.push(approvedCountUp);
      }

      // Pending count
      if (this.pendingCountRef?.nativeElement) {
        const pendingCountUp = new CountUp(
          this.pendingCountRef.nativeElement,
          this.leaveApprovalStats.pending,
          options
        );
        pendingCountUp.start();
        this.countUpInstances.push(pendingCountUp);
      }

      // Rejected count
      if (this.rejectedCountRef?.nativeElement) {
        const rejectedCountUp = new CountUp(
          this.rejectedCountRef.nativeElement,
          this.leaveApprovalStats.rejected,
          options
        );
        rejectedCountUp.start();
        this.countUpInstances.push(rejectedCountUp);
      }
    } catch (error) {
      console.error('Error initializing leave stats CountUp:', error);
    }
  }

  private initializePieChart() {
    if (!isPlatformBrowser(this.platformId) || !this.leaveApprovalStats) {
      return;
    }

    const documentStyle = getComputedStyle(document.documentElement);

    this.pieChartData = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [
        {
          data: [
            this.leaveApprovalStats.approved,
            this.leaveApprovalStats.pending,
            this.leaveApprovalStats.rejected,
          ],
          backgroundColor: [
            '#10b981', // Emerald-500
            '#f59e0b', // Amber-500
            '#ef4444', // Red-500
          ],
          hoverBackgroundColor: [
            '#059669', // Emerald-600
            '#d97706', // Amber-600
            '#dc2626', // Red-600
          ],
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4,
          hoverBorderColor: '#ffffff',
        },
      ],
    };

    this.pieChartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            color:
              documentStyle.getPropertyValue('--p-text-color') || '#374151',
            font: {
              size: 12,
              weight: '500',
            },
            padding: 20,
            generateLabels: function (chart: any) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label: string, i: number) => {
                  const dataset = data.datasets[0];
                  const value = dataset.data[i];
                  const total = dataset.data.reduce(
                    (a: number, b: number) => a + b,
                    0
                  );
                  const percentage =
                    total > 0 ? ((value / total) * 100).toFixed(1) : '0';

                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor,
                    lineWidth: dataset.borderWidth,
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context: any) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      radius: '90%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
      },
    };
  }

  // Mock data methods for fallback
  private getMockDashboardStats(): DashboardStatsDto {
    return {
      departmentCount: 8,
      designationCount: 15,
      employeeCount: 125,
      currentMonthHolidays: 3,
    };
  }

  private getMockLeaveApprovalStats(): LeaveApprovalStatsDto {
    return {
      approved: 45,
      pending: 12,
      rejected: 8,
    };
  }

  private getMockEmployeeLeaveStats(): LeaveStatsDto {
    return {
      totalLeaves: 25,
      casualLeaves: 8,
      annualLeaves: 15,
      specialLeaves: 2,
      remainingCasualLeaves: 4,
      remainingAnnualLeaves: 8,
      remainingSpecialLeaves: 2,
    };
  }

  // Utility methods
  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'info';
    }
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up countup instances
    this.countUpInstances.forEach((instance) => {
      if (instance) {
        instance.reset();
      }
    });
  }
}
