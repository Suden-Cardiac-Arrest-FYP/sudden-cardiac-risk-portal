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
import { CardModule } from 'primeng/card';

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
  forkJoin,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { getDtoNameById } from '../../app/relationships/reationshipConfig';

import { ILeave, LeaveDto, LeaveResponse } from '../../dto/Leave.dto';
import { LeaveService } from '../../services/Leave.service';
import { CreateUpdateLeave } from './create-update-leave/create-update-leave';
import { roleConfig } from '../../app/access-control/roleConfig';
import { AuthService, User } from '@auth0/auth0-angular';

interface LeaveStats {
  totalLeaves: number;
  casualLeaves: number;
  annualLeaves: number;
  specialLeaves: number;
}

@Component({
  standalone: true,
  selector: 'app-Leave',
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
    CardModule,
  ],
  templateUrl: './Leave.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././Leave.component.scss',
  providers: [ConfirmationService, MessageService, DialogService, LeaveService],
})
export class LeaveComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();

  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  LeaveData: LeaveDto[] = [];
  isDataLoading: boolean = false;
  isStatsLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  leaveStats: LeaveStats = {
    totalLeaves: 0,
    casualLeaves: 0,
    annualLeaves: 0,
    specialLeaves: 0,
  };

  dtoName: string | undefined = 'Leave';
  userRole: string | undefined = '';
  EmployeeId: string | undefined = '';
  HodId: string | undefined = '';
  ParamsLeaveId: string = '';
  user: User | undefined = {};

  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private leaveService = inject(LeaveService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.ParamsLeaveId = params.get('leaveId') || '';
    });
    if (this.ParamsLeaveId) {
      this.searchQuery = this.ParamsLeaveId;
    }

    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.userRole = this.user?.['user_metadata']['role'];
        // this.EmployeeId = this.user?.['user_metadata']['employeeId'];

        if (this.user?.['user_metadata']['employeeId'] !== undefined) {
          this.EmployeeId = this.user?.['user_metadata']['employeeId'];
          this.loadInitialData();
        }

        if (this.user?.['user_metadata']['hodId'] !== undefined) {
          this.HodId = this.user?.['user_metadata']['hodId'];
          this.loadInitialData();
        } else {
          this.loadInitialData();
        }
      } else {
        this.userRole = undefined;
      }
    });

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
        this.findAllLeave();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadInitialData(): void {
    forkJoin({
      leaves: this.findAllLeaveData(),
      stats: this.loadLeaveStats(),
    }).subscribe({
      next: (results) => {
        console.log('Initial data loaded successfully');
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
      },
    });
  }

  loadLeaveStats(): any {
    this.isStatsLoading = true;
    const params = {
      page: '1',
      size: '10000',
      searchTerm: '',
      employeeId: this.EmployeeId,
      HodId: this.HodId,
    };

    return this.leaveService
      .findAllLeave(params)
      .pipe(
        filter((res: HttpResponse<LeaveResponse>) => res.ok),
        map((res: HttpResponse<LeaveResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: LeaveResponse | null) => {
          if (res && res.Leave) {
            const leaves = res.Leave;
            this.leaveStats = {
              totalLeaves: leaves.length,
              casualLeaves: leaves.filter(
                (leave) => leave.LeaveType === 'Casual Leave'
              ).length,
              annualLeaves: leaves.filter(
                (leave) => leave.LeaveType === 'Annual Leave'
              ).length,
              specialLeaves: leaves.filter(
                (leave) => leave.LeaveType === 'Special Leave'
              ).length,
            };
          } else {
            this.leaveStats = {
              totalLeaves: 0,
              casualLeaves: 0,
              annualLeaves: 0,
              specialLeaves: 0,
            };
          }
          this.isStatsLoading = false;
        },
        error: (error) => {
          console.error('Error loading leave stats:', error);
          this.isStatsLoading = false;
        },
      });
  }

  downloadFile() {
    this.leaveService.downloadFile().subscribe(
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
          summary: 'Download Successfull',
          detail: ` Excel successfully downloaded.`,
          life: 3000,
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Download Failed',
          detail: ` Failed to download excel.`,
          life: 3000,
        });
      }
    );
  }

  private getFilenameFromContentDisposition(header: string | null): string {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);

    if (!header) {
      return 'Products_' + date + '.csv';
    }
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(header);
    if (!matches || !matches[1]) {
      return 'Products_' + date + '.csv';
    }
    return matches[1].replace(/['"]/g, '');
  }

  uploadFile(event: any) {
    const file: File = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', file);

    this.leaveService.uploadFile(formData).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: `File "${file.name}" successfully uploaded.`,
          life: 3000,
        });
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

  findAllLeaveData(): any {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
      employeeId: this.EmployeeId,
      hodId: this.HodId,
    };
    return this.leaveService
      .findAllLeave(params)
      .pipe(
        filter((res: HttpResponse<LeaveResponse>) => res.ok),
        map((res: HttpResponse<LeaveResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: LeaveResponse | null) => {
          if (res != null) {
            this.LeaveData = res.Leave || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.LeaveData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all Leave.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all Leave', res);
        },
      });
  }

  findAllLeave(): void {
    this.findAllLeaveData();
  }

  showCreateLeaveDialog() {
    this.showCreateLeaveDialogDefault();
  }

  showCreateLeaveDialogDefault() {
    const ref = this.dialogService.open(CreateUpdateLeave, {
      header: 'Create Leave',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllLeave();
      this.loadLeaveStats();
    });
  }

  showEditLeaveDialog(Leave: LeaveDto) {
    const ref = this.dialogService.open(CreateUpdateLeave, {
      data: Leave,
      header: 'Update Leave',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllLeave();
      this.loadLeaveStats();
    });
  }

  deleteLeave(Leave: LeaveDto) {
    this.confirmationService.confirm({
      header: 'Are you sure ?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.ConfirmDeleteLeave(Leave);
        this.messageService.add({
          severity: 'error',
          summary: 'Deleted',
          detail: 'You have deleted ',
        });
      },
    });
  }

  ConfirmDeleteLeave(Leave: LeaveDto) {
    this.LeaveData = this.LeaveData.filter(
      (val) => val.LeaveId !== Leave.LeaveId
    );
    this.leaveService
      .deleteLeave({ leaveId: Leave.LeaveId })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.loadLeaveStats();
      });
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
    this.loadInitialData();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    this.page++;
    this.first = (this.page - 1) * this.rows;
    this.findAllLeave();
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;
    this.findAllLeave();
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
