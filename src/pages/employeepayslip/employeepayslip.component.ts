import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { PaySlipDto, PaySlipResponse } from '../../dto/PaySlip.dto';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { PayrollService } from '../../services/Payroll.service';
import { filter, map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-employeepayslip',
  imports: [
    CommonModule,
    ToastModule,
    TabViewModule,
    RouterModule,
    CommonModule,
    ToastModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    PopoverModule,
    OverlayBadgeModule,
    AvatarModule,
    DividerModule,
    InputTextModule,
    Tooltip,
    ProgressBarModule,
  ],
  templateUrl: './employeepayslip.component.html',
  styleUrl: './employeepayslip.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    PayrollService,
  ],
})
export class EmployeepayslipComponent {
  private payrollService = inject(PayrollService);
  private destroyed$ = new Subject<void>();

  activeTabIndex = 0;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleName: string | null = null;
  createdPayslips: PaySlipDto[] = [];
  createdPayslipsLoading = false;
  createdPayslipsFirst = 0;
  createdPayslipsRows = 10;
  createdPayslipsPage = 1;
  createdPayslipsSearchQuery = '';
  createdPayslipsTotalRecords = 0;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService
  ) {
    this.roleName = localStorage.getItem('roleName');
  }

  ngOnInit() {
    this.loadCreatedPayslips();
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

  downloadPayslip(payslip: PaySlipDto): void {
    this.payrollService.downloadFile().subscribe(
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
}
