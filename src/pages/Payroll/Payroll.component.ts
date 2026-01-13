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
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
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

// Import your interfaces and services
import { IEmployee, EmployeeResponse } from '../../dto/Employee.dto';
import { IPaySlip, PaySlipDto, PaySlipResponse } from '../../dto/PaySlip.dto';
import { EmployeeService } from '../../services/Employee.service';
import { PaySlipService } from '../../services/PaySlip.service';
import { PayrollService } from '../../services/Payroll.service';

interface PayrollDashboardData {
  totalEmployees: number;
  remainingEmployees: number;
  createdPayslips: number;
  completionPercentage: number;
}

@Component({
  standalone: true,
  selector: 'app-payroll',
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    IconField,
    InputIcon,
    ButtonModule,
    TableModule,
    CardModule,
    TabViewModule,
    ProgressBarModule,
    TagModule,
    TooltipModule,
    InputTextModule,
  ],
  templateUrl: './Payroll.component.html',
  host: {
    class: 'h-full flex-1 flex flex-col overflow-hidden p-6',
  },
  styleUrl: './Payroll.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    PayrollService
  ],
})
export class PayrollComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  private payrollService = inject(PayrollService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  disableGenerate: boolean = true;

  // Dashboard data
  dashboardData: PayrollDashboardData = {
    totalEmployees: 0,
    remainingEmployees: 0,
    createdPayslips: 0,
    completionPercentage: 0,
  };

  // Remaining employees data
  remainingEmployees: IEmployee[] = [];
  remainingEmployeesLoading = false;
  remainingEmployeesFirst = 0;
  remainingEmployeesRows = 10;
  remainingEmployeesPage = 1;
  remainingEmployeesTotalRecords = 0;
  remainingEmployeesSearchQuery = '';
  remainingEmployeesSearchSubject = new Subject<string>();

  // Created payslips data
  createdPayslips: PaySlipDto[] = [];
  createdPayslipsLoading = false;
  createdPayslipsFirst = 0;
  createdPayslipsRows = 10;
  createdPayslipsPage = 1;
  createdPayslipsTotalRecords = 0;
  createdPayslipsSearchQuery = '';
  createdPayslipsSearchSubject = new Subject<string>();

  @ViewChild('remainingTable') remainingTable!: Table;
  @ViewChild('createdTable') createdTable!: Table;
  paysheetId: string | null = '';
  isDataLoading: boolean = false;

  ngOnInit() {
    this.initializeSearchSubscriptions();
    this.loadDashboardData();
    this.route.queryParamMap.subscribe(params => {
      this.paysheetId = params.get('paysheetId');
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private initializeSearchSubscriptions(): void {
    // Remaining employees search
    this.remainingEmployeesSearchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.remainingEmployeesSearchQuery = searchTerm;
        this.remainingEmployeesFirst = 0;
        this.remainingEmployeesPage = 1;
        this.loadRemainingEmployees();
      });

    // Created payslips search
    this.createdPayslipsSearchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.createdPayslipsSearchQuery = searchTerm;
        this.createdPayslipsFirst = 0;
        this.createdPayslipsPage = 1;
        this.loadCreatedPayslips();
      });
  }

  private loadDashboardData(): void {
    this.loadRemainingEmployees();
    this.loadCreatedPayslips();
  }

  private calculateDashboardMetrics(): void {
    this.dashboardData.totalEmployees = this.remainingEmployeesTotalRecords + this.createdPayslipsTotalRecords;
    this.dashboardData.remainingEmployees = this.remainingEmployeesTotalRecords;
    this.dashboardData.createdPayslips = this.createdPayslipsTotalRecords;
    this.dashboardData.completionPercentage = this.dashboardData.totalEmployees > 0
      ? Math.round((this.dashboardData.createdPayslips / this.dashboardData.totalEmployees) * 100)
      : 0;

    if (this.dashboardData.remainingEmployees < 0) {
      this.disableGenerate = false
    }
  }

  loadRemainingEmployees(): void {
    this.remainingEmployeesLoading = true;
    const params = {
      page: this.remainingEmployeesPage.toString(),
      size: this.remainingEmployeesRows.toString(),
      searchTerm: this.remainingEmployeesSearchQuery,
    };

    this.payrollService
      .findAllExcepTempEmployee(params)
      .pipe(
        filter((res: HttpResponse<EmployeeResponse>) => res.ok),
        map((res: HttpResponse<EmployeeResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: EmployeeResponse | null) => {
          if (res != null) {
            this.remainingEmployees = res.Employee || [];
            this.remainingEmployeesTotalRecords = res.Count || 0;
          } else {
            this.remainingEmployees = [];
            this.remainingEmployeesTotalRecords = 0;
            this.disableGenerate = true
          }
          this.remainingEmployeesLoading = false;
          this.calculateDashboardMetrics();
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load remaining employees.',
            life: 6000,
          });
          this.remainingEmployeesLoading = false;
        },
      });
  }

  loadCreatedPayslips(): void {
    this.createdPayslipsLoading = true;
    const params = {
      page: this.createdPayslipsPage.toString(),
      size: this.createdPayslipsRows.toString(),
      searchTerm: this.createdPayslipsSearchQuery,
    };

    this.payrollService
      .findTempAllPaySlip(params)
      .pipe(
        filter((res: HttpResponse<PaySlipResponse>) => res.ok),
        map((res: HttpResponse<PaySlipResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: PaySlipResponse | null) => {
          if (res != null) {
            this.createdPayslips = res.PaySlip || [];
            this.createdPayslipsTotalRecords = res.Count || 0;
          } else {
            this.createdPayslips = [];
            this.createdPayslipsTotalRecords = 0;
          }
          this.createdPayslipsLoading = false;
          this.calculateDashboardMetrics();
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load created payslips.',
            life: 6000,
          });
          this.createdPayslipsLoading = false;
        },
      });
  }

  // Remaining employees pagination
  onRemainingEmployeesNext(): void {
    this.remainingEmployeesPage++;
    this.remainingEmployeesFirst = (this.remainingEmployeesPage - 1) * this.remainingEmployeesRows;
    this.loadRemainingEmployees();
  }

  onRemainingEmployeesPrev(): void {
    this.remainingEmployeesPage--;
    this.remainingEmployeesFirst = (this.remainingEmployeesPage - 1) * this.remainingEmployeesRows;
    this.loadRemainingEmployees();
  }

  isRemainingEmployeesFirstPage(): boolean {
    return this.remainingEmployeesPage === 1;
  }

  isRemainingEmployeesLastPage(): boolean {
    return this.remainingEmployeesTotalRecords
      ? this.remainingEmployeesFirst + this.remainingEmployeesRows >= this.remainingEmployeesTotalRecords
      : true;
  }

  get remainingEmployeesCurrentPage(): number {
    return this.remainingEmployeesPage;
  }

  get remainingEmployeesTotalPages(): number {
    return this.remainingEmployeesTotalRecords
      ? Math.ceil(this.remainingEmployeesTotalRecords / this.remainingEmployeesRows)
      : 0;
  }

  // Created payslips pagination
  onCreatedPayslipsNext(): void {
    this.createdPayslipsPage++;
    this.createdPayslipsFirst = (this.createdPayslipsPage - 1) * this.createdPayslipsRows;
    this.loadCreatedPayslips();
  }

  onCreatedPayslipsPrev(): void {
    this.createdPayslipsPage--;
    this.createdPayslipsFirst = (this.createdPayslipsPage - 1) * this.createdPayslipsRows;
    this.loadCreatedPayslips();
  }

  isCreatedPayslipsFirstPage(): boolean {
    return this.createdPayslipsPage === 1;
  }

  isCreatedPayslipsLastPage(): boolean {
    return this.createdPayslipsTotalRecords
      ? this.createdPayslipsFirst + this.createdPayslipsRows >= this.createdPayslipsTotalRecords
      : true;
  }

  get createdPayslipsCurrentPage(): number {
    return this.createdPayslipsPage;
  }

  get createdPayslipsTotalPages(): number {
    return this.createdPayslipsTotalRecords
      ? Math.ceil(this.createdPayslipsTotalRecords / this.createdPayslipsRows)
      : 0;
  }

  // Search handlers
  onRemainingEmployeesGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.remainingEmployeesSearchQuery = filterValue;
    this.remainingEmployeesSearchSubject.next(filterValue);
  }

  onCreatedPayslipsGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.createdPayslipsSearchQuery = filterValue;
    this.createdPayslipsSearchSubject.next(filterValue);
  }

  // Navigation methods
  navigateToPrePayslipReview(employeeId?: string): void {
    if (!employeeId || !this.paysheetId) {
      return
    }
    this.router.navigate(['paysheet/pre-payslip-review'], { queryParams: { employeeId, paysheetId: this.paysheetId } });
  }

  navigateToPrePayslipReviewForPayslip(employeeId?: string): void {
     this.router.navigate(['paysheet/payslip-generation'], { queryParams: { employeeId, paysheetId: this.paysheetId } });
  }

  // Generate payroll action
  generatePayroll(): void {

    this.isDataLoading = true;
    this.payrollService
      .approvePayslip()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {

          this.messageService.add({
            severity: 'info',
            summary: 'Generating Payroll',
            detail: 'Payroll generation process has been initiated.',
            life: 3000,
          });
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {

          this.messageService.add({
            severity: 'error',
            summary: 'Generating Payroll',
            detail: 'Payroll generation process has been failed.',
            life: 3000,
          });
          this.isDataLoading = false;
          console.error('Error approving payslip:', res);
        },
      });
  }

  // Reload methods
  reloadRemainingEmployees(): void {
    this.remainingEmployeesPage = 1;
    this.remainingEmployeesFirst = 0;
    this.loadRemainingEmployees();
  }

  reloadCreatedPayslips(): void {
    this.createdPayslipsPage = 1;
    this.createdPayslipsFirst = 0;
    this.loadCreatedPayslips();
  }

  // Utility methods
  formatCurrency(value: number): string {
    if (value === null || value === undefined) {
      return 'Rs. 0.00';
    }
    return value.toLocaleString('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    });
  }

  getProgressBarColor(): string {
    if (this.dashboardData.completionPercentage >= 80) return 'success';
    if (this.dashboardData.completionPercentage >= 50) return 'warning';
    return 'danger';
  }
}