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
import { DialogModule } from 'primeng/dialog';
import { PopoverModule } from 'primeng/popover';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  filter,
  map,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  Subject,
  firstValueFrom,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { getDtoNameById } from '../../app/relationships/reationshipConfig';

import {
  IEmployee,
  EmployeeDto,
  EmployeeResponse,
} from '../../dto/Employee.dto';
import { EmployeeService } from '../../services/Employee.service';
import { CreateUpdateEmployee } from './create-update-employee/create-update-employee';
import { roleConfig } from '../../app/access-control/roleConfig';
import { FingerprintAllocationComponent } from './fingerprint-allocation/fingerprint-allocation.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmployeeAdditionDeductionComponent } from '../../shared/employee-addition-deduction/employee-addition-deduction.component';
import { FileViewerComponent } from '../file-viewer/file-viewer.component';

@Component({
  standalone: true,
  selector: 'app-Employee',
  imports: [
    CommonModule,
    ToastModule,
    IconField,
    InputIcon,
    ButtonModule,
    DialogModule,
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
  templateUrl: './Employee.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././Employee.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    EmployeeService,
  ],
})
export class EmployeeComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  EmployeeData: EmployeeDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;
  departmentMap: Map<string, string> = new Map();
  designationMap: Map<string, string> = new Map();
  shiftMap: Map<string, string> = new Map();
  isDropdownDataLoading: boolean = false;
  employeeForm!: FormGroup;
  isEditMode: boolean = false;
  currentEmployeeId: string = '';

  dtoName: string | undefined = 'Employee';

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private fb = inject(FormBuilder);

  @ViewChild('additionDeductionDialog')
  additionDeductionDialog!: EmployeeAdditionDeductionComponent;

  ngOnInit() {
    this.findAllEmployee();

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
        this.findAllEmployee();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // async loadDropdownMappings(): Promise<void> {
  //   this.isDropdownDataLoading = true;

  //   try {
  //     const departmentResponse = await firstValueFrom(
  //       this.employeeService
  //         .findAllDepartment({ noPagination: 'true' })
  //         .pipe(
  //           filter((res) => res.ok),
  //           map((res) => res.body),
  //           takeUntil(this.destroyed$)
  //         )
  //     );

  //     if (departmentResponse && departmentResponse.Department) {
  //       departmentResponse.Department.forEach((dept: any) => {
  //         const id = dept.DepartmentId || dept.Id;
  //         const name = dept.Name || dept.DepartmentName;
  //         if (id && name) {
  //           this.departmentMap.set(id, name);
  //         }
  //       });
  //       console.log('Loaded departments:', this.departmentMap);
  //     }

  //     const designationResponse = await firstValueFrom(
  //       this.employeeService
  //         .findAllDesignation({ noPagination: 'true' })
  //         .pipe(
  //           filter((res) => res.ok),
  //           map((res) => res.body),
  //           takeUntil(this.destroyed$)
  //         )
  //     );

  //     if (designationResponse && designationResponse.Designation) {
  //       designationResponse.Designation.forEach((desig: any) => {
  //         const id = desig.DesignationId || desig.Id;
  //         const name = desig.Designation || desig.Name || desig.DesignationName;
  //         if (id && name) {
  //           this.designationMap.set(id, name);
  //         }
  //       });
  //       console.log('Loaded designations:', this.designationMap);
  //     }

  //     const shiftResponse = await firstValueFrom(
  //       this.employeeService.findAllShift({ noPagination: 'true' }).pipe(
  //         filter((res) => res.ok),
  //         map((res) => res.body),
  //         takeUntil(this.destroyed$)
  //       )
  //     );

  //     if (shiftResponse && shiftResponse.Shift) {
  //       shiftResponse.Shift.forEach((shift: any) => {
  //         const id = shift.ShiftId || shift.Id;
  //         const name = shift.Name || shift.ShiftName;
  //         if (id && name) {
  //           this.shiftMap.set(id, name);
  //         }
  //       });
  //       console.log('Loaded shifts:', this.shiftMap);
  //     }
  //   } catch (error) {
  //     console.error('Error loading dropdown mappings:', error);
  //     this.messageService.add({
  //       severity: 'warn',
  //       summary: 'Warning',
  //       detail: 'Some dropdown data could not be loaded',
  //       life: 3000,
  //     });
  //   } finally {
  //     this.isDropdownDataLoading = false;
  //   }
  // }

  getDepartmentName(departmentId: string): string {
    if (!departmentId) return '-';
    return this.departmentMap.get(departmentId) || departmentId;
  }

  getDesignationName(designationId: string): string {
    if (!designationId) return '-';
    return this.designationMap.get(designationId) || designationId;
  }

  getShiftName(shiftId: string): string {
    if (!shiftId) return '-';
    return this.shiftMap.get(shiftId) || shiftId;
  }

  getInitials(name: string): string {
    if (!name) return 'NA';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  getEmployeeTypeLabel(empType: string): string {
    const typeMap: { [key: string]: string } = {
      GeneralPermanent: 'Full Time',
      Probationary: 'Training',
      ServicePermanent: 'Full Time - Service',
    };
    return typeMap[empType] || 'Not Set';
  }

  getGenderLabel(gender: string): string {
    const genderMap: { [key: string]: string } = {
      MALE: 'Male',
      FEMALE: 'Female',
      OTHER: 'Other',
    };
    return genderMap[gender] || 'Not Set';
  }

  downloadFile() {
    this.employeeService.downloadFile().subscribe(
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
          summary: 'Download Successful',
          detail: 'Excel successfully downloaded.',
          life: 3000,
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Download Failed',
          detail: 'Failed to download excel.',
          life: 3000,
        });
      }
    );
  }

  private getFilenameFromContentDisposition(header: string | null): string {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);

    if (!header) {
      return 'Employees_' + date + '.xlsx';
    }
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(header);
    if (!matches || !matches[1]) {
      return 'Employees_' + date + '.xlsx';
    }
    return matches[1].replace(/['"]/g, '');
  }

  uploadFile(event: any) {
    const file: File = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', file);

    this.employeeService.uploadFile(formData).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: `File "${file.name}" successfully uploaded.`,
          life: 3000,
        });

        this.findAllEmployee();
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

  /**
   * Fetches all Employee with given parameters
   * @param params - Parameters to filter Employee
   */
  findAllEmployee(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.employeeService
      .findAllEmployee(params)
      .pipe(
        filter((res: HttpResponse<EmployeeResponse>) => res.ok),
        map((res: HttpResponse<EmployeeResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: EmployeeResponse | null) => {
          if (res != null) {
            this.EmployeeData = (res.Employee || []).map((emp) => ({
              ...emp,
              Type: (emp as any).Type ?? '',
              Value: (emp as any).Value ?? '',
            }));
            this.totalRecords = res.Count || 0;
          } else {
            this.EmployeeData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load all employees.',
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all Employee', res);
        },
      });
  }

  //dynamic dialog
  showCreateEmployeeDialog() {
    this.showCreateEmployeeDialogDefault();
  }

  //dynamic dialog
  showCreateEmployeeDialogDefault() {
    const ref = this.dialogService.open(CreateUpdateEmployee, {
      header: 'Create Employee',
      width: '60%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllEmployee();
    });
  }

  showEditEmployeeDialog(Employee: EmployeeDto) {
    const ref = this.dialogService.open(CreateUpdateEmployee, {
      data: Employee,
      header: 'Update Employee',
      width: '60%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllEmployee();
    });
  }

  //delete Employee
  deleteEmployee(Employee: EmployeeDto) {
    this.confirmationService.confirm({
      header: 'Are you sure?',
      message: `Please confirm to delete ${Employee.Name}.`,
      accept: () => {
        this.ConfirmDeleteEmployee(Employee);
      },
    });
  }

  openAdditionDeductionDialog(employee: EmployeeDto) {
    const ref: DynamicDialogRef = this.dialogService.open(
      EmployeeAdditionDeductionComponent,
      {
        header: 'Employee Addition / Deduction',
        width: '40%',
        data: {
          employeeId: employee.EmployeeId,
        },
        modal: true,
      }
    );

    ref.onClose.subscribe((data) => {
      if (data) {
        this.findAllEmployee();
      }
    });
  }

  ConfirmDeleteEmployee(Employee: EmployeeDto) {
    this.employeeService
      .deleteEmployee({ employeeId: Employee.EmployeeId })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.EmployeeData = this.EmployeeData.filter(
            (val) => val.EmployeeId !== Employee.EmployeeId
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `${Employee.Name} has been deleted successfully.`,
            life: 3000,
          });

          this.findAllEmployee();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: 'Failed to delete employee.',
            life: 3000,
          });
          console.error('Delete error:', error);
        },
      });
  }

showFilesDialog(documents: any[], event: Event) {
  event.stopImmediatePropagation();
  
  // Filter out deleted documents and ensure we have valid documents
  const validDocuments = documents?.filter(doc => !doc.deleted && doc.Url) || [];
  
  if (validDocuments.length === 0) {
    this.messageService.add({
      severity: 'info',
      summary: 'No Documents',
      detail: 'No documents available for this employee.',
      life: 3000,
    });
    return;
  }

  const ref = this.dialogService.open(FileViewerComponent, {
    data: validDocuments,
    header: `Employee Documents (${validDocuments.length})`,
    width: '90%',
    height: '90%',
    closable: true,
    modal: true,
    styleClass: 'file-viewer-dialog'
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

  openFingerprintAllocation(employee: EmployeeDto): void {
    const ref = this.dialogService.open(FingerprintAllocationComponent, {
      data: employee,
      header: 'Fingerprint Allocation',
      width: '40%',
      height: 'auto',
      closable: true,
      modal: true,
      styleClass: 'fingerprint-allocation-dialog',
    });

    ref.onClose.subscribe((result) => {
      this.findAllEmployee();
    });
  }

  reloadState() {
    this.page = 1;
    this.first = 0;
    this.isDataLoading = true;

    this.findAllEmployee();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    this.page++;
    this.first = (this.page - 1) * this.rows;
    this.findAllEmployee();
  }

  prev() {
    this.page--;
    this.first = (this.page - 1) * this.rows;
    this.findAllEmployee();
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
