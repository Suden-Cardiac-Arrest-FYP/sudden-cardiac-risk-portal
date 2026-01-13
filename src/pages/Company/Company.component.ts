import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  DestroyRef,
  ElementRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';
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
import { filter, map, takeUntil, Subject } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ICompany, CompanyDto, CompanyResponse } from '../../dto/Company.dto';
import { CompanyService } from '../../services/Company.service';
import { JobDescriptionService } from '../../services/JobDescription.service';
import { JobDescriptionDto, IJobDescription, IKPICategory, IKPIDescription } from '../../dto/JobDescription.dto';
import { IDesignation, DesignationResponse } from '../../dto/Designation.dto';
import { roleConfig } from '../../app/access-control/roleConfig';
import { TextareaModule } from 'primeng/textarea';

@Component({
  standalone: true,
  selector: 'app-Company',
  imports: [
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
    TextareaModule,
    DropdownModule,
    TabViewModule,
    ConfirmDialog,
    ReactiveFormsModule,
  ],
  templateUrl: './Company.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: '././Company.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    CompanyService,
    JobDescriptionService,
  ],
})
export class CompanyComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private destroyed$ = new Subject<void>();
  companyData: CompanyDto | null = null;
  companyForm!: FormGroup;
  isDataLoading: boolean = false;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  uploadingImage: boolean = false;
  currentImageUrl: string | null = null;
  selectedFile: File | null = null;
  originalFormValue: any = null;
  jobDescriptionForm!: FormGroup;
  designations: IDesignation[] = [];
  isDesignationLoading: boolean = false;
  isJdLoading: boolean = false;
  existingJobDescription: IJobDescription | null = null;
  isLoadingExistingJd: boolean = false;

  roleConfig = roleConfig;

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private jobDescriptionService = inject(JobDescriptionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeForm();
    this.initializeJobDescriptionForm();
    this.loadCompanyData();
    this.loadDesignations();
    this.setupDesignationChangeListener();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initializeForm(): void {
    this.companyForm = this.fb.group({
      CompanyId: [''],
      Name: ['', Validators.required],
      Type: [''],
      Email: [''],
      Phone: [''],
      Address: [''],
      NoOFEmployees: ['', [Validators.required, Validators.min(1)]],
      BrNo: ['', Validators.required],
      EpfNumber: [''],
      Website: [''],
      LogoUrl: [''],
    });
  }

  initializeJobDescriptionForm(): void {
    this.jobDescriptionForm = this.fb.group({
      designationId: ['', Validators.required],
      kpiCategories: this.fb.array([]),
      notes: ['']
    });
  }

  setupDesignationChangeListener(): void {
    this.jobDescriptionForm.get('designationId')?.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((designationId: string) => {
        if (designationId) {
          this.loadExistingJobDescription(designationId);
        } else {
          this.clearJobDescriptionData();
        }
      });
  }

  loadExistingJobDescription(designationId: string): void {
    this.isLoadingExistingJd = true;
    const params = { designationId: designationId };

    this.jobDescriptionService
      .findJdByDesignationId(params)
      .pipe(
        filter((res: HttpResponse<IJobDescription>) => res.ok),
        map((res: HttpResponse<IJobDescription>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (jobDescription: IJobDescription | null) => {
          this.isLoadingExistingJd = false;
          
          if (jobDescription && jobDescription.KPICategory && jobDescription.KPICategory.length > 0) {
            this.existingJobDescription = jobDescription;
            this.populateJobDescriptionForm(jobDescription);
            this.messageService.add({
              severity: 'info',
              summary: 'Existing Job Description Found',
              detail: 'Loaded existing job description for this designation.',
              life: 3000,
            });
          } else {
            this.existingJobDescription = null;
            this.clearJobDescriptionData();
            this.messageService.add({
              severity: 'info',
              summary: 'No Existing Job Description',
              detail: 'No job description found for this designation. You can create a new one.',
              life: 3000,
            });
          }
        },
        error: (error: any) => {
          this.isLoadingExistingJd = false;
          this.existingJobDescription = null;
          this.clearJobDescriptionData();
          if (error.status !== 404) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load existing job description.',
              life: 3000,
            });
          } else {
            this.messageService.add({
              severity: 'info',
              summary: 'No Existing Job Description',
              detail: 'No job description found for this designation. You can create a new one.',
              life: 3000,
            });
          }
        },
      });
  }

  populateJobDescriptionForm(jobDescription: IJobDescription): void {
    this.kpiCategoriesArray.clear();


    if (jobDescription.KPICategory && jobDescription.KPICategory.length > 0) {
      jobDescription.KPICategory.forEach((category: IKPICategory) => {
        const categoryGroup = this.fb.group({
          name: [category.KPICategory || '', Validators.required],
          subCategories: this.fb.array([])
        });

        const subCategoriesArray = categoryGroup.get('subCategories') as FormArray;
        if (category.KPIDescription && category.KPIDescription.length > 0) {
          category.KPIDescription.forEach((subCategory: IKPIDescription) => {
            subCategoriesArray.push(new FormControl(subCategory.KPIDescription || '', Validators.required));
          });
        }

        this.kpiCategoriesArray.push(categoryGroup);
      });
    }

    this.jobDescriptionForm.patchValue({
      notes: jobDescription.Notes || ''
    });
  }

  clearJobDescriptionData(): void {
    this.kpiCategoriesArray.clear();
    this.jobDescriptionForm.patchValue({
      notes: ''
    });
    this.existingJobDescription = null;
  }

  get kpiCategoriesArray(): FormArray {
    return this.jobDescriptionForm.get('kpiCategories') as FormArray;
  }

  getSubCategoriesArray(categoryIndex: number): FormArray {
    return this.kpiCategoriesArray.at(categoryIndex).get('subCategories') as FormArray;
  }

  addMainCategory(): void {
    const categoryGroup = this.fb.group({
      name: ['', Validators.required],
      subCategories: this.fb.array([])
    });
    this.kpiCategoriesArray.push(categoryGroup);
  }

  removeMainCategory(index: number): void {
    this.kpiCategoriesArray.removeAt(index);
  }

  addSubCategory(categoryIndex: number): void {
    const subCategoriesArray = this.getSubCategoriesArray(categoryIndex);
    subCategoriesArray.push(new FormControl('', Validators.required));
  }

  removeSubCategory(categoryIndex: number, subIndex: number): void {
    const subCategoriesArray = this.getSubCategoriesArray(categoryIndex);
    subCategoriesArray.removeAt(subIndex);
  }

  resetJobDescriptionForm(): void {
    this.jobDescriptionForm.reset();
    this.kpiCategoriesArray.clear();
    this.existingJobDescription = null;
    this.jobDescriptionForm.patchValue({
      designationId: '',
      notes: ''
    });
  }

  loadDesignations(): void {
    this.isDesignationLoading = true;
    const params = {
      noPagination: 'true',
    };

    this.companyService
      .findAllDesignation(params)
      .pipe(
        filter((res: HttpResponse<DesignationResponse>) => res.ok),
        map((res: HttpResponse<DesignationResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: DesignationResponse | null) => {
          if (res != null && res.Designation) {
            this.designations = res.Designation;
          } else {
            this.designations = [];
          }
          this.isDesignationLoading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed to load designations.`,
            life: 6000,
          });
          this.isDesignationLoading = false;
        },
      });
  }

  saveJobDescription(): void {
    if (this.jobDescriptionForm.invalid) {
      this.markFormGroupTouched(this.jobDescriptionForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      return;
    }

    this.isJdLoading = true;

    const formValue = this.jobDescriptionForm.value;
 
    const kpiCategories: IKPICategory[] = formValue.kpiCategories.map((category: any) => ({
      KPICategory: category.name,
      KPICategoryId: '',
      KPIDescription: category.subCategories.map((subCategory: string) => ({
        KPIDescription: subCategory,
        KPIDescriptionId: ''
      }))
    }));

    const jobDescriptionPayload: JobDescriptionDto = {
      JDId: this.existingJobDescription?.JDId || '', 
      DesignationId: formValue.designationId,
      KPICategory: kpiCategories,
      Notes: formValue.notes || ''
    };

    const serviceMethod = this.existingJobDescription 
      ? this.jobDescriptionService.updateJobDescription(jobDescriptionPayload)
      : this.jobDescriptionService.createJobDescription(jobDescriptionPayload);

    serviceMethod
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.isJdLoading = false;
          const action = this.existingJobDescription ? 'updated' : 'created';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Job Description ${action} successfully.`,
            life: 3000,
          });
          
          if (formValue.designationId) {
            this.loadExistingJobDescription(formValue.designationId);
          }
        },
        error: (error: any) => {
          this.isJdLoading = false;
          const action = this.existingJobDescription ? 'update' : 'create';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || `Failed to ${action} job description.`,
            life: 3000,
          });
        },
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  loadCompanyData(): void {
    this.isDataLoading = true;
    const params = {
      page: '1',
      size: '10',
      searchTerm: '',
    };

    this.companyService
      .findAllCompany(params)
      .pipe(
        filter((res: HttpResponse<CompanyResponse>) => res.ok),
        map((res: HttpResponse<CompanyResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: CompanyResponse | null) => {
          if (res != null && res.Company && res.Company.length > 0) {
            this.companyData = res.Company[0];
            this.populateForm(this.companyData);
          } else {
            this.companyData = null;
          }
          this.isDataLoading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed to load company data.`,
            life: 6000,
          });
          this.isDataLoading = false;
        },
      });
  }

  populateForm(company: CompanyDto): void {
    this.companyForm.patchValue({
      CompanyId: company.CompanyId || '',
      Name: company.Name || '',
      Type: company.Type || '',
      Email: company.Email || '',
      Phone: company.Phone || '',
      Address: company.Address || '',
      NoOFEmployees: company.NoOFEmployees || '',
      BrNo: company.BrNo || '',
      EpfNumber: company.EpfNumber || '',
      Website: company.Website || '',
      LogoUrl: company.LogoUrl || '',
    });

    if (company.LogoUrl) {
      this.currentImageUrl = company.LogoUrl;
    }

    this.originalFormValue = { ...this.companyForm.value };
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.originalFormValue = { ...this.companyForm.value };
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.originalFormValue) {
      this.companyForm.patchValue(this.originalFormValue);
      this.currentImageUrl = this.originalFormValue.LogoUrl;
    }
    this.selectedFile = null;
  }

  triggerFileInput(): void {
    if (this.isEditMode) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Please select a file smaller than 1MB.',
          life: 3000,
        });
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File Type',
          detail: 'Please select a JPG, PNG, or GIF file.',
          life: 3000,
        });
        return;
      }

      this.selectedFile = file;
      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    this.uploadingImage = true;

    const formData = new FormData();
    formData.append('file', file);

    this.companyService
      .fileUpload(formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.uploadingImage = false;
          let logoUrl = '';

          if (response.body && typeof response.body === 'object') {
            logoUrl = response.body.Url || response.body.url;
          } else if (typeof response.body === 'string') {
            logoUrl = response.body.replace(/^"(.*)"$/, '$1');
          }

          if (logoUrl) {
            this.companyForm.patchValue({ LogoUrl: logoUrl });
            this.currentImageUrl = logoUrl;

            this.messageService.add({
              severity: 'success',
              summary: 'Upload Successful',
              detail: 'Company logo uploaded successfully.',
              life: 3000,
            });
          } else {
            throw new Error('No URL found in response');
          }
        },
        error: () => {
          this.uploadingImage = false;
          this.currentImageUrl = this.originalFormValue?.LogoUrl || null;

          this.messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: 'Failed to upload company logo. Please try again.',
            life: 3000,
          });
        },
      });

    this.fileInput.nativeElement.value = '';
  }

  removeImage(): void {
    this.currentImageUrl = null;
    this.selectedFile = null;
    this.companyForm.patchValue({
      LogoUrl: null,
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Image Removed',
      detail: 'Company logo has been removed.',
      life: 3000,
    });
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      Object.keys(this.companyForm.controls).forEach((key) => {
        const control = this.companyForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      return;
    }

    this.isLoading = true;

    const companyPayload: CompanyDto = {
      CompanyId: this.companyForm.get('CompanyId')?.value || '',
      Name: this.companyForm.get('Name')?.value || '',
      Type: this.companyForm.get('Type')?.value || '',
      Email: this.companyForm.get('Email')?.value || '',
      Phone: this.companyForm.get('Phone')?.value || '',
      Address: this.companyForm.get('Address')?.value || '',
      NoOFEmployees:
        parseInt(this.companyForm.get('NoOFEmployees')?.value) || 1,
      BrNo: this.companyForm.get('BrNo')?.value || '',
      EpfNumber: this.companyForm.get('EpfNumber')?.value || '',
      Website: this.companyForm.get('Website')?.value || '',
      LogoUrl: this.companyForm.get('LogoUrl')?.value || '',
    };

    this.companyService
      .updateCompany(companyPayload)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isEditMode = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Company updated successfully.',
            life: 3000,
          });
          this.loadCompanyData();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Failed to update company.',
            life: 3000,
          });
        },
      });
  }

  onImageError(event: any): void {}

  reloadCompanyData(): void {
    this.loadCompanyData();
  }

  hasAccess(dtoId: string, accessType: string): boolean {
    const roleName = localStorage.getItem('roleName');
    if (roleName !== null) {
      const rolePermissions = roleConfig[roleName];
      if (rolePermissions && rolePermissions[dtoId]) {
        return rolePermissions[dtoId]?.includes(accessType) || false;
      }
    }
    return false;
  }
}