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

import {
  IAttendance,
  AttendanceDto,
  AttendanceResponse,
} from '../../dto/Attendance.dto';
import { AttendanceService } from '../../services/Attendance.service';
import { CreateUpdateAttendance } from './create-update-attendance/create-update-attendance';
import { roleConfig } from '../../app/access-control/roleConfig';
import { IEmployee, EmployeeResponse } from '../../dto/Employee.dto';
import { AuthService, User } from '@auth0/auth0-angular';

@Component({
  standalone: true,
  selector: 'app-Attendance',
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
  templateUrl: './Attendance.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: './Attendance.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    AttendanceService,
  ],
})
export class AttendanceComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  private authService = inject(AuthService);

  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  AttendanceData: AttendanceDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;
  employeesMap: Map<string, IEmployee> = new Map();
  user: User | undefined = {};

  dtoName: string | undefined = 'Attendance';
  EmployeeId: string | undefined = '';
  ParamsAttendenceId: string | undefined = '';

  private destroyRef = inject(DestroyRef);
  private attendanceService = inject(AttendanceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.ParamsAttendenceId = params.get('attendanceId') || '';
    });
    if (this.ParamsAttendenceId) {
      this.searchQuery = this.ParamsAttendenceId;
    }

    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;

        if (this.user?.['user_metadata']['employeeId'] !== undefined) {
          this.EmployeeId = this.user?.['user_metadata']['employeeId'];
        }
        if (this.hasAccess('DTO5531', 'READALL')) {
          this.findAllAttendanceByEmployeeId();
        } else {
          this.findAllAttendance();
        }
      }
    });

    this.loadEmployees();

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
        if (this.hasAccess('DTO5531', 'READALL')) {
          this.findAllAttendanceByEmployeeId();
        } else {
          this.findAllAttendance();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Fetches all Attendance with given parameters
   * @param params - Parameters to filter Attendance
   */

  findAllAttendance(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.attendanceService
      .findAllAttendance(params)
      .pipe(
        filter((res: HttpResponse<AttendanceResponse>) => res.ok),
        map((res: HttpResponse<AttendanceResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: AttendanceResponse | null) => {
          if (res != null) {
            this.AttendanceData = res.Attendance || [];
            this.totalRecords = res.Count || 0;
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

  findAllAttendanceByEmployeeId(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
      employeeId: this.EmployeeId,
    };
    this.attendanceService
      .findAllAttendanceByEmployeeId(params)
      .pipe(
        filter((res: HttpResponse<AttendanceResponse>) => res.ok),
        map((res: HttpResponse<AttendanceResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: AttendanceResponse | null) => {
          if (res != null) {
            this.AttendanceData = res.Attendance || [];
            this.totalRecords = res.Count || 0;
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
  //dynamic dialog
  showCreateAttendanceDialog() {
    this.showCreateAttendanceDialogDefault();
  }

  //dynamic dialog
  showCreateAttendanceDialogDefault() {
    const ref = this.dialogService.open(CreateUpdateAttendance, {
      header: 'Create Attendance',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      if (this.hasAccess('DTO5531', 'READALL')) {
        this.findAllAttendanceByEmployeeId();
      } else {
        this.findAllAttendance();
      }
    });
  }

  showEditAttendanceDialog(Attendance: AttendanceDto) {
    const ref = this.dialogService.open(CreateUpdateAttendance, {
      data: Attendance,
      header: 'Update Attendance',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      if (this.hasAccess('DTO5531', 'READALL')) {
        this.findAllAttendanceByEmployeeId();
      } else {
        this.findAllAttendance();
      }
    });
  }

  //delete Attendance
  deleteAttendance(Attendance: AttendanceDto) {
    this.confirmationService.confirm({
      header: 'Are you sure ?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.ConfirmDeleteAttendance(Attendance);
        this.messageService.add({
          severity: 'error',
          summary: 'Deleted',
          detail: 'You have deleted ',
        });
      },
    });
  }

  ConfirmDeleteAttendance(Attendance: AttendanceDto) {
    this.AttendanceData = this.AttendanceData.filter(
      (val) => val.AttendanceId !== Attendance.AttendanceId
    );
    this.attendanceService
      .deleteAttendance({ attendanceId: Attendance.AttendanceId })
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

  getAttendanceStatusSeverity(attendance: AttendanceDto): string {
    if (!attendance.time || attendance.time.length === 0) {
      return 'irregular';
    }

    let hasMissingIn = false;
    let hasMissingOut = false;

    for (const t of attendance.time) {
      if (!t.inTime) {
        hasMissingIn = true;
      }
      if (!t.endTime) {
        hasMissingOut = true;
      }
    }

    if (hasMissingIn && hasMissingOut) {
      return 'irregular';
    }

    if (hasMissingIn || hasMissingOut) {
      return 'partial';
    }

    return 'complete';
  }

  getAttendanceStatusText(attendance: AttendanceDto): string {
    if (!attendance.time || attendance.time.length === 0) {
      return 'Missing Values';
    }

    let missingIn = false;
    let missingOut = false;

    for (const t of attendance.time) {
      if (!t.inTime) {
        missingIn = true;
      }
      if (!t.endTime) {
        missingOut = true;
      }
    }

    if (missingIn && missingOut) {
      return 'Missing In & Out';
    }
    if (missingIn) {
      return 'Missing In';
    }
    if (missingOut) {
      return 'Missing Out';
    }

    return 'Present';
  }

  reloadState() {
    this.page = 1;
    this.first = 0;
    this.isDataLoading = true;
    if (this.hasAccess('DTO5531', 'READALL')) {
      this.findAllAttendanceByEmployeeId();
    } else {
      this.findAllAttendance();
    }
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    this.page++;
    this.first = (this.page - 1) * this.rows;
    if (this.hasAccess('DTO5531', 'READALL')) {
      this.findAllAttendanceByEmployeeId();
    } else {
      this.findAllAttendance();
    }
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;

    if (this.hasAccess('DTO5531', 'READALL')) {
      this.findAllAttendanceByEmployeeId();
    } else {
      this.findAllAttendance();
    }
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

  loadEmployees(): void {
    const params = {
      noPagination: true,
    };

    this.attendanceService
      .findAllEmployee(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          if (response.body && response.body.Employee) {
            response.body.Employee.forEach((employee) => {
              if (employee.EmployeeId) {
                this.employeesMap.set(employee.EmployeeId, employee);
              }
            });
          }
        },
        error: (error) => {
          console.log('Error loading employees for mapping', error);
        },
      });
  }

  getEmployeeName(employeeId: string | undefined): string {
    if (!employeeId) return 'N/A';
    const employee = this.employeesMap.get(employeeId);
    return employee ? `${employee.Name}` : employeeId;
  }
}
