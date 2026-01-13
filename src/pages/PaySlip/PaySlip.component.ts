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
import { ToggleButton } from 'primeng/togglebutton';

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

import { IPaySlip, PaySlipDto, PaySlipResponse } from '../../dto/PaySlip.dto';
import { PaySlipService } from '../../services/PaySlip.service';
import { CreateUpdatePaySlip } from './create-update-paySlip/create-update-paySlip';
import { roleConfig } from '../../app/access-control/roleConfig';

@Component({
  standalone: true,
  selector: 'app-PaySlip',
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './PaySlip.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././PaySlip.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    PaySlipService,
  ],
  styles: [
    `
      :host ::ng-deep .p-frozen-column {
        font-weight: bold;
      }
      :host ::ng-deep .p-datatable-frozen-tbody {
        font-weight: bold;
      }
      :host ::ng-deep .p-datatable-scrollable .p-datatable-thead > tr > th {
        background: var(--surface-ground);
      }
      :host ::ng-deep .p-datatable-scrollable .p-datatable-frozen-tbody {
        background: var(--surface-ground);
      }
    `,
  ],
})
export class PaySlipComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  actionsFrozen: boolean = false; // Toggle for frozen actions column
  @ViewChild('dt') dt!: Table;
  PaySlipData: PaySlipDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  dtoName: string | undefined = 'PaySlip';

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private paySlipService = inject(PaySlipService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.findAllPaySlip();
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
        this.findAllPaySlip();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Format currency values
   * @param value - Numeric value to format
   * @returns Formatted currency string
   */
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

  downloadFile() {
    this.paySlipService.downloadFile().subscribe(
      (response: HttpResponse<Blob>) => {
        // Extract filename from content-disposition header
        const contentDispositionHeader: string | null = response.headers.get(
          'content-disposition'
        );
        const filename: string = this.getFilenameFromContentDisposition(
          contentDispositionHeader
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

    this.paySlipService.uploadFile(formData).subscribe(
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
      }
    );
  }

  /**
   * Fetches all PaySlip with given parameters
   * @param params - Parameters to filter PaySlip
   */
  findAllPaySlip(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.paySlipService
      .findAllPaySlip(params)
      .pipe(
        filter((res: HttpResponse<PaySlipResponse>) => res.ok),
        map((res: HttpResponse<PaySlipResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: PaySlipResponse | null) => {
          if (res != null) {
            this.PaySlipData = res.PaySlip || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.PaySlipData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all PaySlip.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all PaySlip', res);
        },
      });
  }

  //dynamic dialog
  showCreatePaySlipDialog() {
    this.showCreatePaySlipDialogDefault();
  }

  //dynamic dialog
  showCreatePaySlipDialogDefault() {
    const ref = this.dialogService.open(CreateUpdatePaySlip, {
      header: 'Create PaySlip',
      width: '60%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllPaySlip();
    });
  }

  showEditPaySlipDialog(PaySlip: PaySlipDto) {
    const ref = this.dialogService.open(CreateUpdatePaySlip, {
      data: PaySlip,
      header: 'Update PaySlip',
      width: '60%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllPaySlip();
    });
  }

  //delete PaySlip
  deletePaySlip(PaySlip: PaySlipDto) {
    this.confirmationService.confirm({
      header: 'Are you sure ?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.ConfirmDeletePaySlip(PaySlip);
        this.messageService.add({
          severity: 'error',
          summary: 'Deleted',
          detail: 'You have deleted ',
        });
      },
    });
  }

  ConfirmDeletePaySlip(PaySlip: PaySlipDto) {
    this.PaySlipData = this.PaySlipData.filter(
      (val) => val.PaySlipId !== PaySlip.PaySlipId
    );
    this.paySlipService
      .deletePaySlip({ paySlipId: PaySlip.PaySlipId })
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
    this.findAllPaySlip();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    this.page++;
    this.first = (this.page - 1) * this.rows;

    this.findAllPaySlip();
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;

    this.findAllPaySlip();
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
