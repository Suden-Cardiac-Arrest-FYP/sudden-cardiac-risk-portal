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
import {
  IrregularAttendanceDto,
  IrregularAttendanceResponse,
} from '../../dto/IrregularAttendance.dto';
import { IrregularAttendanceService } from '../../services/IrregularAttendance.service';
import { roleConfig } from '../../app/access-control/roleConfig';
import { ResolveAttendanceComponent } from '../../shared/resolve-attendance/resolve-attendance.component';
import { AuthService, User } from '@auth0/auth0-angular';

@Component({
  standalone: true,
  selector: 'app-IrregularAttendance',
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
  templateUrl: './IrregularAttendance.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././IrregularAttendance.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    IrregularAttendanceService,
  ],
})
export class IrregularAttendanceComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  IrregularAttendanceData: IrregularAttendanceDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  dtoName: string | undefined = 'IrregularAttendance';
  user: User | undefined = {};
  EmployeeId: string | undefined = '';

  private destroyRef = inject(DestroyRef);
  private irregularAttendanceService = inject(IrregularAttendanceService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.user$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        if (user !== null) {
          this.user = user;

          if (this.user?.['user_metadata']['employeeId'] !== undefined) {
            this.EmployeeId = this.user?.['user_metadata']['employeeId'];
          }
        }
      });

    if (this.hasAccess('DTO5532', 'READALL')) {
      this.findAllIrregularAttendanceByEmployeeId();
    } else {
      this.findAllIrregularAttendance();
    }

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
      if (this.hasAccess('DTO5532', 'READALL')) {
      this.findAllIrregularAttendanceByEmployeeId();
    } else {
      this.findAllIrregularAttendance();
    }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Fetches all IrregularAttendance with given parameters
   * @param params - Parameters to filter IrregularAttendance
   */
  findAllIrregularAttendance(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.irregularAttendanceService
      .findAllIrregularAttendance(params)
      .pipe(
        filter((res: HttpResponse<IrregularAttendanceResponse>) => res.ok),
        map((res: HttpResponse<IrregularAttendanceResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: IrregularAttendanceResponse | null) => {
          if (res != null) {
            this.IrregularAttendanceData = res.IrregularAttendance || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.IrregularAttendanceData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all IrregularAttendance.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all IrregularAttendance', res);
        },
      });
  }

  findAllIrregularAttendanceByEmployeeId(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.irregularAttendanceService
      .findAllIrregularAttendanceByEmployeeID(params)
      .pipe(
        filter((res: HttpResponse<IrregularAttendanceResponse>) => res.ok),
        map((res: HttpResponse<IrregularAttendanceResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: IrregularAttendanceResponse | null) => {
          if (res != null) {
            this.IrregularAttendanceData = res.IrregularAttendance || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.IrregularAttendanceData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all IrregularAttendance.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all IrregularAttendance', res);
        },
      });
  }

  showResolveAttendanceDialogDefault(attendance: IrregularAttendanceDto) {
    const ref = this.dialogService.open(ResolveAttendanceComponent, {
      data: attendance,
      header: 'Resolve Attendance',
      width: '30%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
     if (this.hasAccess('DTO5532', 'READALL')) {
      this.findAllIrregularAttendanceByEmployeeId();
    } else {
      this.findAllIrregularAttendance();
    }
    });
  }

  getAttendanceStatusSeverity(attendance: IrregularAttendanceDto): string {
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

  getAttendanceStatusText(attendance: IrregularAttendanceDto): string {
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

  getEmployeeName(employeeId: string): string {
    if (!employeeId) return 'Unknown Employee';
    const empNumber = employeeId.replace('EMP-', '');
    return `Employee ${empNumber}`;
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
    if (this.hasAccess('DTO5532', 'READALL')) {
      this.findAllIrregularAttendanceByEmployeeId();
    } else {
      this.findAllIrregularAttendance();
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

    if (this.hasAccess('DTO5532', 'READALL')) {
      this.findAllIrregularAttendanceByEmployeeId();
    } else {
      this.findAllIrregularAttendance();
    }
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;

    if (this.hasAccess('DTO5532', 'READALL')) {
      this.findAllIrregularAttendanceByEmployeeId();
    } else {
      this.findAllIrregularAttendance();
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
}
