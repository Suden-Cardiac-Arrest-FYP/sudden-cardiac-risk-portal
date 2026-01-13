// pre-payslip-review.component.ts
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';
import { roleConfig } from '../../app/access-control/roleConfig';
import { ProgressBarModule } from 'primeng/progressbar';
import { IrregularAttendanceService } from '../../services/IrregularAttendance.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { IIrregularAttendancePayroll, IrregularAttendancePayrollDto, IrregularAttendancePayrollResponse, IrregularAttendanceSummary } from '../../dto/IrregularAttendance-Payroll.dto';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ResolveAttendanceComponent } from '../../shared/resolve-attendance/resolve-attendance.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { RemoveLeaveOrAttendanceComponent } from '../../shared/remove-leave-or-attendance/remove-leave-or-attendance.component';

@Component({
  selector: 'app-pre-payslip-review',
  imports: [
    CommonModule,
    Button,
    TableModule,
    Tooltip,
    Tag,
    CardModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    ToastModule
  ],
  providers: [MessageService, IrregularAttendanceService, ConfirmationService, DialogService],
  templateUrl: './pre-payslip-review.component.html',
  styleUrl: './pre-payslip-review.component.scss'
})
export class PrePayslipReviewComponent implements OnInit {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();

  employeeId: string = '';
  payslipId: string = '';

  first = 0;
  rows = 20;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: IrregularAttendancePayrollDto[] = [];

  @ViewChild('dt') dt!: Table;

  IrregularAttendanceData: IrregularAttendancePayrollDto[] = [];
  isDataLoading: boolean = false;
  isDataloaded: boolean = false;
  isProcessing: boolean = false;

  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  stats = {
    total: 0,
    lateCount: 0,
    missingInCount: 0,
    missingOutCount: 0,
    leaveConflictCount: 0
  };

  private destroyRef = inject(DestroyRef);
  private irregularAttendanceService = inject(IrregularAttendanceService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.employeeId = params['employeeId'];
      this.payslipId = params['paysheetId'];

      this.findAllIrregularAttendance();
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
        this.findAllIrregularAttendance();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Fetches all IrregularAttendance with given parameters
   */
  findAllIrregularAttendance(): void {

    this.isDataLoading = true;

    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
      employeeId: this.employeeId,
      payslipId: this.payslipId
    };

    this.irregularAttendanceService
      .findAllIrregularAttendanceForReveiw(params)
      .pipe(
        filter((res: HttpResponse<IrregularAttendanceSummary>) => res.ok),
        map((res: HttpResponse<IrregularAttendanceSummary>) => res.body),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (res: IrregularAttendanceSummary | null) => {
          if (res != null) {
            this.IrregularAttendanceData = res.records || [];
            this.totalRecords = res.records?.length || 0;
            this.calculateStats(res);
            this.isDataLoading = false;
            this.isDataloaded = true
          } else {
            this.IrregularAttendanceData = [];
            this.totalRecords = 0;
            this.resetStats();
            this.isDataLoading = false;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed to load irregular attendance data.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.error('Error loading irregular attendance:', res);
        },
      });
  }

  calculateStats(res: IrregularAttendanceSummary): void {
    this.stats = {
      total: res.records?.length,
      lateCount: res.lateCount,
      missingInCount: res.missingInCount,
      missingOutCount: res.missingOutCount,
      leaveConflictCount: res.leaveConflictCount
    };
  }

  resetStats(): void {
    this.stats = {
      total: 0,
      lateCount: 0,
      missingInCount: 0,
      missingOutCount: 0,
      leaveConflictCount: 0
    };
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

  getAttendanceStatusSeverity(attendance: IrregularAttendancePayrollDto): string {
    return 'warning';
  }

  getAttendanceStatusText(attendance: IrregularAttendancePayrollDto): string {
    if (attendance.hasLeave) {
      return 'Leave Conflict';
    }
    return 'Missing Check-in / Check-out';
  }

  removeLeaveOrAttendance(attendance: IrregularAttendancePayrollDto): void {
    const ref = this.dialogService.open(RemoveLeaveOrAttendanceComponent, {
      data: attendance,
      header: 'Resolve Attendance',
      width: '60%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllIrregularAttendance();
    });
}

proceedToPayslipGeneration(): void {
  if(this.IrregularAttendanceData.length > 0) {
  this.messageService.add({
    severity: 'warn',
    summary: 'Unresolved Issues',
    detail: 'Please resolve all irregular attendance issues before proceeding',
    life: 5000,
  });
  return;
}
console.log(this.payslipId, this.employeeId)
this.router.navigate(
  ['/paysheet/payslip-generation'],
  {
    queryParams: {
      paysheetId: this.payslipId,
      employeeId: this.employeeId
    }
  }
);
  }

getProgressPercentage(): number {
  if (this.stats.total === 0) return 100;
  return 0;
}

isAllResolved(): boolean {
  return this.IrregularAttendanceData.length === 0;
}

getSeverityClass(severity: string): string {
  switch (severity) {
    case 'danger': return 'p-tag-danger';
    case 'warning': return 'p-tag-warning';
    case 'info': return 'p-tag-info';
    case 'success': return 'p-tag-success';
    default: return 'p-tag-secondary';
  }
}

formatTime(time: string | null): string {
  if (!time) return '—';
  return time;
}

showResolveAttendanceDialogDefault(attendance: IIrregularAttendancePayroll) {
  const ref = this.dialogService.open(ResolveAttendanceComponent, {
    data: attendance,
    header: 'Resolve Attendance',
    width: '30%',
    closable: true,
    modal: true,
  });
  ref.onClose.subscribe(() => {
    this.findAllIrregularAttendance();
  });
}
}