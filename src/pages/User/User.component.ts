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

import { IUser, UserDto, UserResponse } from '../../dto/User.dto';
import { UserService } from '../../services/User.service';
import { CreateUpdateUser } from './create-update-user/create-update-user';
import { roleConfig } from '../../app/access-control/roleConfig';

@Component({
  standalone: true,
  selector: 'app-User',
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
  templateUrl: './User.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././User.component.scss',
  providers: [ConfirmationService, MessageService, DialogService, UserService],
})
export class UserComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  UserData: UserDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  dtoName: string | undefined = 'User';

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.findAllUser();
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
        this.findAllUser();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  downloadFile() {
    this.userService.downloadFile().subscribe(
      (response: HttpResponse<Blob>) => {
        // Extract filename from content-disposition header
        const contentDispositionHeader: string | null = response.headers.get(
          'content-disposition',
        );
        const filename: string = this.getFilenameFromContentDisposition(
          contentDispositionHeader,
        );

        if (response.body) {
          // Create URL for the blob data
          const blobUrl: string = window.URL.createObjectURL(response.body);
          // Create an anchor element and trigger download
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = blobUrl;
          a.download = filename;
          a.click();

          // Clean up
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
      },
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

    this.userService.uploadFile(formData).subscribe(
      (response) => {
        // Handle success
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: `File "${file.name}" successfully uploaded.`,
          life: 3000,
        });
      },
      (error) => {
        // Handle error
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: `Failed to upload file "${file.name}".`,
          life: 3000,
        });
      },
    );
  }

  /**
   * Fetches all User with given parameters
   * @param params - Parameters to filter User
   */
  findAllUser(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.userService
      .findAllUser(params)
      .pipe(
        filter((res: HttpResponse<UserResponse>) => res.ok),
        map((res: HttpResponse<UserResponse>) => res.body),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (res: UserResponse | null) => {
          if (res != null) {
            this.UserData = res.User || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.UserData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all User.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all User', res);
        },
      });
  }

  //dynamic dialog
  showCreateUserDialog() {
    this.showCreateUserDialogDefault();
  }

  //dynamic dialog
  showCreateUserDialogDefault() {
    const ref = this.dialogService.open(CreateUpdateUser, {
      header: 'Create User',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllUser();
    });
  }

  showEditUserDialog(User: UserDto) {
    const ref = this.dialogService.open(CreateUpdateUser, {
      data: User,
      header: 'Update User',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllUser();
    });
  }

  //delete User
  deleteUser(User: UserDto) {
    this.confirmationService.confirm({
      header: 'Are you sure ?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.ConfirmDeleteUser(User);
        this.messageService.add({
          severity: 'error',
          summary: 'Deleted',
          detail: 'You have deleted ',
        });
      },
    });
  }

  ConfirmDeleteUser(User: UserDto) {
    this.UserData = this.UserData.filter((val) => val.UserId !== User.UserId);
    this.userService
      .deleteUser({ userId: User.UserId })
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
    this.findAllUser();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    this.page++;
    this.first = (this.page - 1) * this.rows;

    this.findAllUser();
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;

    this.findAllUser();
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
