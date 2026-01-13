import { Component, OnInit, OnDestroy, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, filter, map, debounceTime, distinctUntilChanged } from 'rxjs';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { BadgeModule } from 'primeng/badge';
import { PayslipService } from './payslip.service';
import { AttendanceDto, AttendanceResponse } from '../../dto/Attendance.dto';
import { AttendanceService } from '../../services/Attendance.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeAdditionDeductionComponent } from '../../shared/employee-addition-deduction/employee-addition-deduction.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from '@angular/router';



export interface PayslipOverview {
  actualWorkedDays: number;
  netWorkingDays: number;
  scheduledShiftDays: number;
  eligibleHolidays: number;
  payrollPeriodHolidays: number;
  fullDayLeaves: number;
  halfDayLeaves: number;
  shortLeaves: number;
  lateArrivalDurationMinutes: number;
  noPayDays: number;
}

export interface Addition {
  Name: string;
  Value: number;
}

export interface Deduction {
  Name: string;
  Value: number;
}

export interface PaySlip {
  PaySlipId: string;
  EmployeeName: string;
  EpFNumber: string;
  Designation: string;
  Month: string;
  Year: number;
  BasicSalary: number;
  ConsolidatedSalary: number;
  Bra01: number;
  Bra02: number;
  EmployeeId: string;
  WorkingDays: number;
  Additions: Addition[];
  Deductions: Deduction[];
  NoPayDays: number;
  WorkedDays: number;
  NoPayAmount: number;
  LateMinutes: number;
  LateMinutesDeduction: number;
  PayCuts: number;
  SalaryForEPF: number;
  GrossSalary: number;
  Epf8Percent: number;
  StampDuty: number;
  PayeTax: number;
  TotalAdditions: number;
  TotalDeductions: number;
  NetSalary: number;
  Etf3Percent: number;
  Epf12Percent: number;
  CostToTheCompany: number;
  Deleted: boolean;
  CreatedAt: string;
}

export interface PayslipResponse {
  overview: PayslipOverview;
  payslip: PaySlip;
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-payslip-view-create',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule,
    DividerModule,
    SkeletonModule,
    PanelModule,
    BadgeModule
  ],
  templateUrl: './payslip-view-create.component.html',
  styleUrl: './payslip-view-create.component.scss',
  providers: [MessageService, AttendanceService, PayslipService, DialogService]
})
export class PayslipViewCreateComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private readonly payslipService = inject(PayslipService);
  private readonly messageService = inject(MessageService);
  private readonly attendanceService = inject(AttendanceService);
  private destroyRef = inject(DestroyRef);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  isDataLoading = false;
  payslipOverview: PayslipOverview | null = null;
  AttendanceData: AttendanceDto[] = [];
  payslipData: PaySlip | null = null;
  employeeId = '';
  selectedRows: any = [];
  paysheetId = '';
  isApproving: boolean = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.employeeId = params['employeeId'];
      this.paysheetId = params['paysheetId'];

      this.loadPayslipData();
      this.findAllAttendance();
    });
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((searchTerm) => {
        this.searchQuery = searchTerm;
        this.first = 0;
        this.page = 1;
        this.findAllAttendance();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  reload() {
    this.loadPayslipData();
    this.findAllAttendance();
  }

  /**
   * Loads payslip data including overview and detailed payslip information
   */
  loadPayslipData(): void {

    this.isDataLoading = true;

    const params = {
      employeeId: this.employeeId,
      payrollId: this.paysheetId
    }

    this.payslipService
      .findPaySlip(params)
      .pipe(
        filter((res: HttpResponse<PayslipResponse>) => res.ok),
        map((res: HttpResponse<PayslipResponse>) => res.body),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (res: PayslipResponse | null) => {
          if (res?.success && res.overview && res.payslip) {
            this.payslipOverview = res.overview;
            this.payslipData = res.payslip;
          } else {
            this.payslipOverview = null;
            this.payslipData = null;
            this.messageService.add({
              severity: 'info',
              summary: 'No Data',
              detail: 'No payslip data found for the selected period.',
              life: 5000,
            });
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load payslip data.',
            life: 6000,
          });
          this.isDataLoading = false;
          console.error('Error loading payslip data:', res);
        },
      });
  }

  /**
   * Approves the payslip
   */
  approvePayslip(): void {
    if (!this.payslipData?.PaySlipId) return;

    const params = {
      employeeId: this.employeeId,
      payrollId: this.paysheetId
    }

    this.isApproving = true;
    this.payslipService
      .approvePayslip(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Payslip approved successfully.',
            life: 5000,
          });
          this.isApproving = false;
          this.router.navigate(
            ['/paysheet/payroll'],
            {
              queryParams: {
                paysheetId: this.paysheetId,
              }
            }
          );
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to approve payslip.',
            life: 6000,
          });
          this.isApproving = false;
          console.error('Error approving payslip:', res);
        },
      });
  }

  /**
   * Formats currency values
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(value);
  }

  /**
   * Gets severity class for attendance metrics
   */
  getMetricSeverity(value: number, type: string): string {
    switch (type) {
      case 'late':
        return value > 0 ? 'danger' : 'success';
      case 'leaves':
        return value > 5 ? 'warning' : value > 0 ? 'info' : 'success';
      default:
        return 'info';
    }
  }

  findAllAttendance(): void {
    this.isDataLoading = true;
    const params = {
      employeeId: this.employeeId,
      paySheetId: this.paysheetId,
      noPagination: true,
    };
    this.attendanceService
      .findAllAttendanceByEmployeeIdPaysheetId(params)
      .pipe(
        filter((res: HttpResponse<AttendanceDto[]>) => res.ok),
        map((res: HttpResponse<AttendanceDto[]>) => res.body),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (res: AttendanceDto[] | null) => {
          if (res != null) {
            this.AttendanceData = res || [];
            this.totalRecords =  0;
          } else {
            this.AttendanceData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all Attendance.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all Attendance', res);
        },
      });
  }

  getEmployeeName(employeeId: string | undefined): string {
    if (!employeeId) return 'N/A';
    const employee = this.payslipData?.EmployeeName
    return employee ? `${employee}` : employeeId;
  }

  openAdditionDeductionDialog(EmployeeId: string, header: string) {
    const ref: DynamicDialogRef = this.dialogService.open(EmployeeAdditionDeductionComponent, {
      header: `Employee ${header}`,
      width: '40%',
      data: {
        employeeId: EmployeeId,
        type: header,
      },
      modal: true,
    });

    ref.onClose.subscribe((data) => {
      if (data) {
        this.reload();
      }
    });
  }
}