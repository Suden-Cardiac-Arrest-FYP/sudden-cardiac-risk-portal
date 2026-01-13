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
import { Tag } from 'primeng/tag';
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

import { IDevice, DeviceDto, DeviceResponse } from '../../dto/Device.dto';
import { DeviceService } from '../../services/Device.service';
import { CreateUpdateDevice } from './create-update-device/create-update-device';
import { roleConfig } from '../../app/access-control/roleConfig';

@Component({
  standalone: true,
  selector: 'app-Device',
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
  templateUrl: './Device.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././Device.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    DeviceService,
  ],
})
export class DeviceComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  DeviceData: DeviceDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  dtoName: string | undefined = 'Device';
  private deviceImages: string[] = [
    'https://sca-mihishi-s3-bucket.s3.eu-west-2.amazonaws.com/sca-logo.jpg',
    'https://sca-mihishi-s3-bucket.s3.eu-west-2.amazonaws.com/sca-logo.jpg'
  ];

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private deviceService = inject(DeviceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.findAllDevice();
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
        this.findAllDevice();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getDeviceImage(deviceId?: string): string {
    if (!deviceId) {
      return this.deviceImages[0];
    }
    const hash = this.hashString(deviceId);
    const index = Math.abs(hash) % this.deviceImages.length;
    return this.deviceImages[index];
  }


  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Track by function for ngFor to improve performance
   */
  trackByDeviceId(index: number, device: DeviceDto): string {
    return device.DeviceId || index.toString();
  }

  /**
   * Get status display text
   */
  getStatusText(status: any): string {
    if (status === true || status === 'true' || status === 'active') {
      return 'Active';
    } else if (status === false || status === 'false' || status === 'inactive') {
      return 'Inactive';
    }
    return status?.toString() || 'Unknown';
  }

  /**
   * Get CSS classes for status badge
   */
  getStatusClass(status: any): string {
    if (status === true || status === 'true' || status === 'active') {
      return 'bg-green-500/90 text-white border-green-300';
    } else if (status === false || status === 'false' || status === 'inactive') {
      return 'bg-red-500/90 text-white border-red-300';
    }
    return 'bg-gray-500/90 text-white border-gray-300';
  }

  /**
   * Get CSS classes for status dot
   */
  getStatusDotClass(status: any): string {
    if (status === true || status === 'true' || status === 'active') {
      return 'bg-green-200';
    } else if (status === false || status === 'false' || status === 'inactive') {
      return 'bg-red-200';
    }
    return 'bg-gray-200';
  }

  downloadFile() {
    this.deviceService.downloadFile().subscribe(
      (response: HttpResponse<Blob>) => {
        const contentDispositionHeader: string | null = response.headers.get(
          'content-disposition',
        );
        const filename: string = this.getFilenameFromContentDisposition(
          contentDispositionHeader,
        );

        if (response.body) {
          const blobUrl: string = window.URL.createObjectURL(response.body);
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

    this.deviceService.uploadFile(formData).subscribe(
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


  findAllDevice(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.deviceService
      .findAllDevice(params)
      .pipe(
        filter((res: HttpResponse<DeviceResponse>) => res.ok),
        map((res: HttpResponse<DeviceResponse>) => res.body),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (res: DeviceResponse | null) => {
          if (res != null) {
            this.DeviceData = res.Devices || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.DeviceData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all Device.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all Device', res);
        },
      });
  }

  //dynamic dialog
  showCreateDeviceDialog() {
    this.showCreateDeviceDialogDefault();
  }

  //dynamic dialog
  showCreateDeviceDialogDefault() {
    const ref = this.dialogService.open(CreateUpdateDevice, {
      header: 'Create Device',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllDevice();
    });
  }

  showEditDeviceDialog(Device: DeviceDto) {
    const ref = this.dialogService.open(CreateUpdateDevice, {
      data: Device,
      header: 'Update Device',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllDevice();
    });
  }

  //delete Device
  deleteDevice(Device: DeviceDto) {
    this.confirmationService.confirm({
      header: 'Are you sure ?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.ConfirmDeleteDevice(Device);
        this.messageService.add({
          severity: 'error',
          summary: 'Deleted',
          detail: 'You have deleted ',
        });
      },
    });
  }

  ConfirmDeleteDevice(Device: DeviceDto) {
    this.DeviceData = this.DeviceData.filter(
      (val) => val.DeviceId !== Device.DeviceId,
    );
    this.deviceService
      .deleteDevice({ deviceId: Device.DeviceId })
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
    this.findAllDevice();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    this.page++;
    this.first = (this.page - 1) * this.rows;

    this.findAllDevice();
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;

    this.findAllDevice();
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