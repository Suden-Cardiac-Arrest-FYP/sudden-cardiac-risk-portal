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
  IEvaluationForm,
  EvaluationFormDto,
  EvaluationFormResponse,
} from '../../dto/EvaluationForm.dto';
import { EvaluationFormService } from '../../services/EvaluationForm.service';
import { CreateUpdateEvaluationForm } from './create-update-evaluationForm/create-update-evaluationForm';
import { roleConfig } from '../../app/access-control/roleConfig';
import { AuthService, User } from '@auth0/auth0-angular';

@Component({
  standalone: true,
  selector: 'app-EvaluationForm',
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
  templateUrl: './EvaluationForm.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././EvaluationForm.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    EvaluationFormService,
  ],
})
export class EvaluationFormComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  EvaluationFormData: EvaluationFormDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  dtoName: string | undefined = 'EvaluationForm';
  userRole: string | undefined = '';
  EmployeeId: string | undefined = '';
  user: User | undefined = {};

  private destroy$ = new Subject<void>();
    private authService = inject(AuthService);
    
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private evaluationFormService = inject(EvaluationFormService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {

        this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.userRole = this.user?.['user_metadata']['role'];

        if (this.user?.['user_metadata']['employeeId'] !== undefined) {
          this.EmployeeId = this.user?.['user_metadata']['employeeId'];
        }
      }

    });

    if (this.hasAccess('DTO5530', 'EMPLOYEE')) {
      this.findAllEvaluationFormByEmployeeId();
    } else {
      this.findAllEvaluationForm();
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
        if (this.hasAccess('DTO5530', 'EMPLOYEE')) {
          this.findAllEvaluationFormByEmployeeId();
        } else {
          this.findAllEvaluationForm();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  downloadFile() {
    this.evaluationFormService.downloadFile().subscribe(
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

    this.evaluationFormService.uploadFile(formData).subscribe(
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

  findAllEvaluationForm(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.evaluationFormService
      .findAllEvaluationForm(params)
      .pipe(
        filter((res: HttpResponse<EvaluationFormResponse>) => res.ok),
        map((res: HttpResponse<EvaluationFormResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: EvaluationFormResponse | null) => {
          if (res != null) {
            this.EvaluationFormData = res.EvaluationForm || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.EvaluationFormData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all EvaluationForm.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all EvaluationForm', res);
        },
      });
  }

  findAllEvaluationFormByEmployeeId(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
      employeeId:this.EmployeeId || '',
    };
    this.evaluationFormService
      .findAllEvaluationForm(params)
      .pipe(
        filter((res: HttpResponse<EvaluationFormResponse>) => res.ok),
        map((res: HttpResponse<EvaluationFormResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: EvaluationFormResponse | null) => {
          if (res != null) {
            this.EvaluationFormData = res.EvaluationForm || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.EvaluationFormData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all EvaluationForm.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all EvaluationForm', res);
        },
      });
  }

  showCreateEvaluationFormDialog() {
    this.showCreateEvaluationFormDialogDefault();
  }

  showCreateEvaluationFormDialogDefault() {
    const ref = this.dialogService.open(CreateUpdateEvaluationForm, {
      header: 'Create EvaluationForm',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      if (this.hasAccess('DTO5530', 'EMPLOYEE')) {
        this.findAllEvaluationFormByEmployeeId();
      } else {
        this.findAllEvaluationForm();
      }
    });
  }

  processEvaluationForm(evaluationForm: EvaluationFormDto) {
    this.router.navigate(['/evaluationprogress'], {
      queryParams: {
        evaluationFormId: evaluationForm.EvaluationFormId,
        employeeId: evaluationForm.EmployeeId,
        employeeName: evaluationForm.EmployeeName,
      },
    });
  }

  deleteEvaluationForm(EvaluationForm: EvaluationFormDto) {
    this.confirmationService.confirm({
      header: 'Are you sure ?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.ConfirmDeleteEvaluationForm(EvaluationForm);
        this.messageService.add({
          severity: 'error',
          summary: 'Deleted',
          detail: 'You have deleted ',
        });
      },
    });
  }

  ConfirmDeleteEvaluationForm(EvaluationForm: EvaluationFormDto) {
    this.EvaluationFormData = this.EvaluationFormData.filter(
      (val) => val.EvaluationFormId !== EvaluationForm.EvaluationFormId
    );
    this.evaluationFormService
      .deleteEvaluationForm({
        evaluationFormId: EvaluationForm.EvaluationFormId,
      })
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
    if (this.hasAccess('DTO5530', 'EMPLOYEE')) {
      this.findAllEvaluationFormByEmployeeId();
    } else {
      this.findAllEvaluationForm();
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

    if (this.hasAccess('DTO5530', 'EMPLOYEE')) {
      this.findAllEvaluationFormByEmployeeId();
    } else {
      this.findAllEvaluationForm();
    }
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;

    if (this.hasAccess('DTO5530', 'EMPLOYEE')) {
      this.findAllEvaluationFormByEmployeeId();
    } else {
      this.findAllEvaluationForm();
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
