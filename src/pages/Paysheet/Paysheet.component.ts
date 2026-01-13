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
  finalize,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { getDtoNameById } from '../../app/relationships/reationshipConfig';

import { IPayroll, PayrollDto, PayrollResponse } from '../../dto/Payroll.dto';
import { PayrollService } from '../../services/Payroll.service';
import { roleConfig } from '../../app/access-control/roleConfig';
import { CreateUpdatePaysheet } from './create-update-paysheet/create-update-paysheet';
import { PaysheetDto } from '../../dto/Paysheet.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CanCratePayroll {
  status?: boolean;
  month?: string;
}

@Component({
  standalone: true,
  selector: 'app-Payroll',
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
  ],
  templateUrl: './Paysheet.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././Paysheet.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    PayrollService,
  ],
})
export class PaysheetComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);

  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  PaysheetData: PaysheetDto[] = [];
  isDataLoading: boolean = false;
  isDataLoading1: boolean = false;
  isLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;
  currentStatus: boolean = false;
  currentMonth: string | undefined = '';

  dtoName: string | undefined = 'Payroll';
  payrollForm!: FormGroup;

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private payrollService = inject(PayrollService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    const currentDate = new Date();

    this.payrollForm = this.fb.group({
      PaySheetId: [''],
      Month: ['', Validators.required], // Use Date object
      Year: ['', Validators.required], // Use Date object
      TotalSalaries: [0],
      CostToTheCompany: [0],
      PaySlip: this.fb.array([]),
      EmployeeId: this.fb.array([]),
      Date: [currentDate, Validators.required],
    });

    this.findAllPayroll();
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
        this.findAllPayroll();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  formatYear(dateStr: string): number {
    return new Date(dateStr).getFullYear();
  }

  formatMonth(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'long' });
  }

  formatDay(dateStr: string): string {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  /**
   * Fetches all Payroll with given parameters
   * @param params - Parameters to filter Payroll
   */
  findAllPayroll(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.payrollService
      .findAllPayroll(params)
      .pipe(
        filter((res: HttpResponse<PayrollResponse>) => res.ok),
        map((res: HttpResponse<PayrollResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: PayrollResponse | null) => {
          if (res != null) {
            this.PaysheetData = res.Payroll || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.PaysheetData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all Payroll.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all Payroll', res);
        },
      });
  }

  showCreatePayrollDialog() {
    this.isDataLoading1 = true; // Show loading on button
    this.payrollService
      .CanCreatePaysheet()
      .pipe(
        filter((res: HttpResponse<CanCratePayroll>) => res.ok),
        map((res: HttpResponse<CanCratePayroll>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: CanCratePayroll | null) => {
          this.isDataLoading1 = false;

          if (res && res.status === true) {
            this.currentStatus = true;
            this.currentMonth = res.month || '';

            this.save();
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Not Allowed',
              detail:
                'We can’t create Paysheet today. Please wait until the payroll creation date.',
              life: 6000,
            });

            this.currentStatus = false;
            this.currentMonth = '';
          }
        },
        error: (res: HttpErrorResponse) => {
          this.isDataLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load data for paysheet creation.',
            life: 6000,
          });
        },
      });
  }

  save() {
    this.isLoading = true;

    this.payrollForm.patchValue({
      Month: this.currentMonth,
    });

    const payroll = this.payrollForm.value;

    this.payrollService
      .createPayroll(payroll)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (res) => {
          if (res.body) {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: `Payroll Created Successfully.`,
              life: 3000,
            });
          }
          this.findAllPayroll();
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Create Payroll.`,
            life: 3000,
          });
          this.findAllPayroll();
        }
      );
  }

  //dynamic dialog
  showCreatePayrollDialogDefault() {
    const ref = this.dialogService.open(CreateUpdatePaysheet, {
      header: 'Create Payroll',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllPayroll();
    });
  }

  viewDialog(Payroll: PaysheetDto) {
    if (Payroll?.PaySheetId) {
      this.router.navigate(['/paysheet/payroll'], {
        queryParams: { paysheetId: Payroll.PaySheetId },
      });
    }
  }

  showEditPayrollDialog(Payroll: PayrollDto) {
    const ref = this.dialogService.open(CreateUpdatePaysheet, {
      data: Payroll,
      header: 'Update Payroll',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllPayroll();
    });
  }

  //delete Payroll
  deletePayroll(Payroll: PayrollDto) {
    this.confirmationService.confirm({
      header: 'Are you sure ?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.ConfirmDeletePayroll(Payroll);
        this.messageService.add({
          severity: 'error',
          summary: 'Deleted',
          detail: 'You have deleted ',
        });
      },
    });
  }

  ConfirmDeletePayroll(Payroll: PaysheetDto) {
    this.PaysheetData = this.PaysheetData.filter(
      (val) => val.PaySheetId !== Payroll.PaySheetId
    );
    this.payrollService
      .deletePayroll({ payrollId: Payroll.PaySheetId })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {});
  }

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

  reloadState() {
    this.page = 1;
    this.first = 0;
    this.isDataLoading = true;
    this.findAllPayroll();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    this.page++;
    this.first = (this.page - 1) * this.rows;

    this.findAllPayroll();
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;

    this.findAllPayroll();
  }

  isLastPage(): boolean {
    return this.totalRecords
      ? this.first + this.rows >= this.totalRecords
      : true;
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
