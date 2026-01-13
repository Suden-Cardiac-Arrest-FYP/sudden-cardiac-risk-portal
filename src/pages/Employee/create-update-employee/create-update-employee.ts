import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { InputTextarea } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { IEmployee, EmployeeDto, IFile } from '../../../dto/Employee.dto';
import { EmployeeService } from '../../../services/Employee.service';

@Component({
  selector: 'app-create-update-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabel,
    ButtonModule,
    InputTextModule,
    DatePicker,
    Select,
    FormsModule,
    InputTextarea,
    TooltipModule,
    FileUploadModule,
    DialogModule,
  ],
  templateUrl: './create-update-employee.html',
  providers: [ConfirmationService, DialogService, EmployeeService],
})
export class CreateUpdateEmployee implements OnInit, OnDestroy {
  employee: EmployeeDto = {};
  submitted: boolean = false;
  employeeForm!: FormGroup;
  isLoading: boolean = false;
  currentStep: number = 1;
  uploadedProfileImageUrl: string = '';
  displayAdditionDialog = false;
  multipleUploadedFiles: { [key: string]: any[] } = {
  basicDocuments: [],
  educationalDocuments: [],
  certificates: []
};

  uploadedFiles: { [key: string]: any } = {};
uploadingFiles: { [key: string]: boolean } = {
  applicationLetter: false,
  confirmationLetter: false,
  certificate: false, 
  certificates: false, 
  appointmentLetter: false,
  basicDocuments: false,
  educationalDocuments: false,
};

  @ViewChild('applicationLetterInput') applicationLetterInput!: ElementRef;
  @ViewChild('confirmationLetterInput') confirmationLetterInput!: ElementRef;
  @ViewChild('certificateInput') certificateInput!: ElementRef;
  @ViewChild('appointmentLetterInput') appointmentLetterInput!: ElementRef;
  @ViewChild('basicDocumentsInput') basicDocumentsInput!: ElementRef;
  @ViewChild('educationalDocumentsInput') educationalDocumentsInput!: ElementRef;
  @ViewChild('certificatesInput') certificatesInput!: ElementRef;

  genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' },
  ];

  nationalityOptions = [
    { label: 'Sri Lankan', value: 'SRILANKAN' },
    { label: 'Other', value: 'OTHER' },
  ];

  resignOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Resigned', value: 'RESIGNED' },

  ];
  
  bloodGroupOptions = [
    { label: 'A+', value: 'A_POSITIVE' },
    { label: 'A-', value: 'A_NEGATIVE' },
    { label: 'B+', value: 'B_POSITIVE' },
    { label: 'B-', value: 'B_NEGATIVE' },
    { label: 'AB+', value: 'AB_POSITIVE' },
    { label: 'AB-', value: 'AB_NEGATIVE' },
    { label: 'O+', value: 'O_POSITIVE' },
    { label: 'O-', value: 'O_NEGATIVE' },
  ];

employeeTypeOptions = [
  { label: 'General Permanent', value: 'GeneralPermanent' },
  { label: 'Service Permanent', value: 'ServicePermanent' },
  { label: 'Probationary', value: 'Probationary' },
];


  annualEntitlementOptions = [
    { label: 'One', value: '1' },
    { label: 'Two', value: '2' },
    { label: 'Three', value: '3' },
  ];

  budgetReliefActOptions = [
    { label: 'BR1', value: 'BR1' },
    { label: 'BR2', value: 'BR2' },
    { label: 'Both', value: 'BOTH' },
    { label: 'N/A', value: 'NA' },
  ];

  isActiveOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  accountTypeOptions = [
    { label: 'Saving', value: 'SAVING' },
    { label: 'Current', value: 'CURRENT' },
  ];

  departmentOptions: any[] = [];
  designationOptions: any[] = [];
  shiftOptions: any[] = [];

  private destroy$ = new Subject<void>();
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownData();

    if (this.config.data != null) {
      this.editEmployee(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.employeeForm = this.fb.group({
      fullName: ['', Validators.required],
      nicNumber: ['', Validators.required],
      preferredName: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      whatsappNumber: [''],
      dateOfBirth: [''],
      lastNameWithInitials: [''],
      gender: [''],
      nationality: [''],
      bloodGroup: [''],
      address: [''],

      basicSalary: [null],
      username: [''],
      epfNumber: [''],
      location: [''],
      employeeType: [''],
      officialEmail: [''],
      departmentId: [''],
      designationId: [''],
      annualEntitlement: [''],
      budgetReliefAct: [''],
      isActive: [''],
      joiningDate: [''],
      shiftType: [''],
      resignStatus: [''], // Add this new form control

      accountHolderName: [''],
      bankName: [''],
      branchName: [''],
      accountType: [''],

      applicationLetter: [''],
      confirmationLetter: [''],
      certificate: [''],
      appointmentLetter: [''],
    });
  }

  onProfileImageUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.isLoading = true;
      this.employeeService
        .fileUpload(formData)
        .pipe(
          finalize(() => (this.isLoading = false)),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response) => {
            console.log('Upload response:', response);

            let imageUrl = '';

            if (response.body) {
              if (typeof response.body === 'object') {
                if (response.body.Url) {
                  imageUrl = response.body.Url;
                } else if (response.body.url) {
                  imageUrl = response.body.url;
                } else if (response.body.fileUrl) {
                  imageUrl = response.body.fileUrl;
                }
              } else if (
                typeof response.body === 'string' &&
                response.body.startsWith('http')
              ) {
                imageUrl = response.body;
              }
            }

            if (imageUrl) {
              this.uploadedProfileImageUrl = imageUrl;
              this.employeeForm.patchValue({ ProfileImage: imageUrl });
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Profile image uploaded successfully',
                life: 3000,
              });
            } else {
              console.error(
                'Unable to extract image URL from response:',
                response
              );
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to get image URL from response',
                life: 3000,
              });
            }
          },
          error: (error) => {
            console.error('Upload error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: 'Failed to upload profile image',
              life: 3000,
            });
          },
        });
    }
  }

  loadDropdownData(): void {
    this.employeeService
      .findAllDepartment({ noPagination: 'true' })
      .pipe(
        filter((res) => res.ok),
        map((res) => res.body),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res && res.Department) {
            this.departmentOptions = res.Department.map((dept: any) => ({
              label: dept.Name || dept.DepartmentName,
              value: dept.DepartmentId || dept.Id,
            }));
          }
        },
        error: (error) => {
          console.error('Error loading departments:', error);
        },
      });

    this.employeeService
      .findAllDesignation({ noPagination: 'true' })
      .pipe(
        filter((res) => res.ok),
        map((res) => res.body),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res && res.Designation) {
            this.designationOptions = res.Designation.map((desig: any) => ({
              label: desig.Designation,
              value: desig.DesignationId || desig.Id,
            }));
          }
        },
        error: (error) => {
          console.error('Error loading designations:', error);
        },
      });

    this.employeeService
      .findAllShift({ noPagination: 'true' })
      .pipe(
        filter((res) => res.ok),
        map((res) => res.body),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res && res.Shift) {
            this.shiftOptions = res.Shift.map((shift: any) => ({
              label: shift.Name || shift.ShiftName,
              value: shift.ShiftId || shift.Id,
            }));
          }
        },
        error: (error) => {
          console.error('Error loading shifts:', error);
        },
      });
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < 4) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    let isValid = true;
    const currentStepControls = this.getCurrentStepControls();

    currentStepControls.forEach((controlName) => {
      const control = this.employeeForm.get(controlName);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields before proceeding.',
        life: 3000,
      });
    }

    return isValid;
  }

  getCurrentStepControls(): string[] {
    switch (this.currentStep) {
      case 1:
        return ['fullName', 'nicNumber', 'email'];
      case 2:
        return [];
      case 3:
        return [];
      case 4:
        return [];
      default:
        return [];
    }
  }

  triggerFileInput(fileType: string): void {
    let fileInput: ElementRef;

    switch (fileType) {
      case 'applicationLetter':
        fileInput = this.applicationLetterInput;
        break;
      case 'confirmationLetter':
        fileInput = this.confirmationLetterInput;
        break;
      case 'certificate':
        fileInput = this.certificateInput;
        break;
      case 'certificates':
        fileInput = this.certificatesInput;
        break;
      case 'appointmentLetter':
        fileInput = this.appointmentLetterInput;
        break;
      case 'basicDocuments':
        fileInput = this.basicDocumentsInput;
        break;
      case 'educationalDocuments':
        fileInput = this.educationalDocumentsInput;
        break;
      default:
        console.error('Unknown file type:', fileType);
        return;
    }

  if (fileInput) {
    fileInput.nativeElement.click();
  } else {
    console.error('File input element not found for:', fileType);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Could not open file browser',
      life: 3000,
    });
  }
}



  onFileSelect(event: any, fileType: string): void {
    let files;

    if (event.files && event.files.length > 0) {
      files = event.files;
    } else if (
      event.target &&
      event.target.files &&
      event.target.files.length > 0
    ) {
      files = event.target.files;
    }

    if (files && files.length > 0) {
      const file = files[0];

      if (file.size > 10 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'File size exceeds 10MB limit',
          life: 3000,
        });

        this.clearFileInput(fileType);
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed',
      ];

      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Only JPG, PNG, GIF, PDF, DOC, and DOCX formats are allowed',
          life: 3000,
        });

        this.clearFileInput(fileType);
        return;
      }

      this.uploadFile(file, fileType);
    }
  }

  uploadFile(file: File, fileType: string): void {
    this.uploadingFiles[fileType] = true;

    const formData = new FormData();
    formData.append('file', file);

    this.employeeService
      .fileUpload(formData)
      .pipe(
        finalize(() => {
          this.uploadingFiles[fileType] = false;
          // Clear the input
          this.clearFileInput(fileType);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          console.log('Document upload response:', response); // For debugging

          if (response.body) {
            let fileUrl = '';

            // Check for different possible response structures
            if (typeof response.body === 'object') {
              // Your API returns { FileId, Url, fileName, FileType, CreatedAt, deleted }
              if (response.body.Url) {
                fileUrl = response.body.Url; // Capital U
              } else if (response.body.url) {
                fileUrl = response.body.url; // lowercase u
              } else if (response.body.fileUrl) {
                fileUrl = response.body.fileUrl;
              }
            } else if (
              typeof response.body === 'string' &&
              response.body.startsWith('http')
            ) {
              fileUrl = response.body;
            }

            if (fileUrl) {
              // Store the file info
              this.uploadedFiles[fileType] = {
                name: file.name,
                url: fileUrl,
                originalFile: file,
              };

              // Update form control
              this.employeeForm.patchValue({
                [fileType]: fileUrl,
              });

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `${file.name} uploaded successfully`,
                life: 3000,
              });
            } else {
              console.error(
                'Invalid URL received from response:',
                response.body
              );
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to extract file URL from response',
                life: 3000,
              });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to upload file - empty response',
              life: 3000,
            });
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to upload ${file.name}`,
            life: 3000,
          });
        },
      });
  }

  clearFileInput(fileType: string): void {
    let fileInput: ElementRef;

    switch (fileType) {
      case 'applicationLetter':
        fileInput = this.applicationLetterInput;
        break;
      case 'confirmationLetter':
        fileInput = this.confirmationLetterInput;
        break;
      case 'certificate':
        fileInput = this.certificateInput;
        break;
      case 'certificates':
        fileInput = this.certificatesInput;
        break;
      case 'appointmentLetter':
        fileInput = this.appointmentLetterInput;
        break;
      case 'basicDocuments':
        fileInput = this.basicDocumentsInput;
        break;
      case 'educationalDocuments':
        fileInput = this.educationalDocumentsInput;
        break;
      default:
        return;
    }

    if (fileInput) {
      fileInput.nativeElement.value = '';
    }
  }

  removeFile(fileType: string): void {
    delete this.uploadedFiles[fileType];
    // Clear the form control
    this.employeeForm.patchValue({
      [fileType]: '',
    });
  }

  isImage(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  showFilesDialog(url: string): void {
    window.open(url, '_blank');
  }

  save(): void {
    this.submitted = true;

    // Validate current step first
    if (!this.validateCurrentStep()) {
      return;
    }

    // Validate all required fields
    if (this.employeeForm.invalid) {
      this.markAllFieldsAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      return;
    }

    this.isLoading = true;
    const employeeData = this.prepareEmployeeData();

    console.log('Employee data being sent:', employeeData);
    console.log('Is update operation:', !!employeeData.EmployeeId);

    if (employeeData.EmployeeId) {
      // Update employee - make sure EmployeeId exists
      if (!employeeData.EmployeeId.trim()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Employee ID is missing for update operation.',
          life: 3000,
        });
        this.isLoading = false;
        return;
      }

      this.employeeService
        .updateEmployee(employeeData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Employee updated successfully.',
              life: 3000,
            });
            this.closeDialog();
          },
          error: (error) => {
            console.error('Update error:', error);
            const errorMessage =
              error.error?.error ||
              error.error?.message ||
              'Failed to update employee.';
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: errorMessage,
              life: 3000,
            });
          },
        });
    } else {
      // Create employee
      this.employeeService
        .createEmployee(employeeData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Employee created successfully.',
              life: 3000,
            });
            this.closeDialog();
          },
          error: (error) => {
            console.error('Create error:', error);
            const errorMessage =
              error.error?.error ||
              error.error?.message ||
              'Failed to create employee.';
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: errorMessage,
              life: 3000,
            });
          },
        });
    }
  }

  prepareEmployeeData(): IEmployee {
    const formValue = this.employeeForm.value;

    const documentsArray: IFile[] = [];

    Object.keys(this.uploadedFiles).forEach((fileType) => {
      if (this.uploadedFiles[fileType] && this.uploadedFiles[fileType].url) {
        documentsArray.push({
          FileId: '',
          Url: this.uploadedFiles[fileType].url,
          FileName: this.uploadedFiles[fileType].name || fileType,
          FileType: fileType,
          CreatedAt: new Date().toISOString(),
          Deleted: false,
        });
      }
    });

    Object.keys(this.multipleUploadedFiles).forEach((fileType) => {
      if (this.multipleUploadedFiles[fileType] && this.multipleUploadedFiles[fileType].length > 0) {
        this.multipleUploadedFiles[fileType].forEach((file, index) => {
          documentsArray.push({
            FileId: '',
            Url: file.url,
            FileName: file.name || `${fileType}_${index + 1}`,
            FileType: fileType,
            CreatedAt: new Date().toISOString(),
            Deleted: false,
          });
        });
      }
    });

    let isActiveValue = true;
    if (formValue.resignStatus) {
      isActiveValue = formValue.resignStatus === 'ACTIVE';
    } else if (formValue.isActive) {
      isActiveValue = formValue.isActive === 'ACTIVE';
    }

    const employeeData: IEmployee = {
      // IMPORTANT: Always include EmployeeId for updates
      EmployeeId: this.employee.EmployeeId,
      Name: formValue.fullName,
      CallingName: formValue.preferredName,
      BloodGroup: formValue.bloodGroup,
      WhatsappNum: formValue.whatsappNumber,
      LastNameInitial: formValue.lastNameWithInitials,
      Email: formValue.email,
      ProfileImage:
        this.uploadedProfileImageUrl || formValue.ProfileImage || '',
      Country: formValue.nationality,
      DateOfBirth: formValue.dateOfBirth
        ? new Date(formValue.dateOfBirth).toISOString().split('T')[0]
        : '',
      Phone: formValue.phoneNumber,
      Department: '',
      EpfNumber: formValue.epfNumber,
      DateJoined: formValue.joiningDate
        ? new Date(formValue.joiningDate).toISOString().split('T')[0]
        : '',
      Gender: formValue.gender,
      Address: formValue.address,
      NicNumber: formValue.nicNumber,
      EmpType: formValue.employeeType,
      AnnualEntitlement: formValue.annualEntitlement
        ? parseFloat(formValue.annualEntitlement)
        : 0,
      Location: formValue.location,
      ConsolidatedSalary: formValue.basicSalary
        ? parseFloat(formValue.basicSalary)
        : 0,
      OfficialEmail: formValue.officialEmail,
      Designation: '',
      BasicSalary: formValue.basicSalary
        ? parseFloat(formValue.basicSalary)
        : 0,
      SalaryArrears: 0,
      SalaryAdvanced: 0,
      CompanyEmpID: '',
      OrganizationId: '',
      DepartmentId: formValue.departmentId,
      DesignationId: formValue.designationId,
      Username: formValue.username,
      AccName: formValue.accountHolderName,
      AccNum: '',
      BankName: formValue.bankName,
      BankBranch: formValue.branchName,
      AccountType: formValue.accountType,
      WelfareDeduction: 0,
      OtherDeductions: 0,
      UserId: '',
      MachineEmployeeId: this.employee.MachineEmployeeId || '',
      ShiftId: formValue.shiftType,
      ShiftName: '',
      Documents: documentsArray,
      Deleted: false,
      IsActive: isActiveValue, // Use the determined active status
      HeadOfDepartment: '',
      BRAOptions: formValue.budgetReliefAct,
      FingerprintAllocated: this.employee.FingerprintAllocated || false,
    };

    console.log('Prepared employee data:', employeeData);
    console.log('Employee ID for update:', employeeData.EmployeeId);

    return employeeData;
  }


  editEmployee(employee: EmployeeDto): void {
    this.employee = { ...employee };

    // Reset multiple uploaded files
    this.multipleUploadedFiles = {
      basicDocuments: [],
      educationalDocuments: [],
      certificates: []
    };

    if (employee.Documents && Array.isArray(employee.Documents)) {
      employee.Documents.forEach((doc: IFile) => {
        if (doc.FileType && doc.Url) {
          // Handle multiple file types
          if (['basicDocuments', 'educationalDocuments', 'certificates'].includes(doc.FileType)) {
            if (!this.multipleUploadedFiles[doc.FileType]) {
              this.multipleUploadedFiles[doc.FileType] = [];
            }
            this.multipleUploadedFiles[doc.FileType].push({
              name: doc.FileName || doc.FileType,
              url: doc.Url,
            });
          } else {
            // Handle single file types
            this.uploadedFiles[doc.FileType] = {
              name: doc.FileName || doc.FileType,
              url: doc.Url,
            };
          }
        }
      });
    }

    const parseDate = (dateString: string | undefined) => {
      if (!dateString) return null;
      try {
        return new Date(dateString);
      } catch {
        return null;
      }
    };

    this.employeeForm.patchValue({
      fullName: employee.Name || '',
      nicNumber: employee.NicNumber || '',
      preferredName: employee.CallingName || '',
      email: employee.Email || '',
      phoneNumber: employee.Phone || '',
      whatsappNumber: employee.WhatsappNum || '',
      dateOfBirth: parseDate(employee.DateOfBirth),
      lastNameWithInitials: employee.LastNameInitial || '',
      gender: employee.Gender || '',
      nationality: employee.Country || '',
      bloodGroup: employee.BloodGroup || '',
      address: employee.Address || '',

      basicSalary: employee.BasicSalary || null,
      username: employee.Username || '',
      epfNumber: employee.EpfNumber || '',
      location: employee.Location || '',
      employeeType: employee.EmpType || '',
      officialEmail: employee.OfficialEmail || '',
      departmentId: employee.DepartmentId || '',
      designationId: employee.DesignationId || '',
      annualEntitlement: employee.AnnualEntitlement?.toString() || '',
      budgetReliefAct: employee.BRAOptions || '',
      isActive: employee.IsActive ? 'ACTIVE' : 'INACTIVE',
      joiningDate: parseDate(employee.DateJoined),
      shiftType: employee.ShiftId || '',
      resignStatus: employee.IsActive ? 'ACTIVE' : 'RESIGNED', // Set resign status based on IsActive

      accountHolderName: employee.AccName || '',
      bankName: employee.BankName || '',
      branchName: employee.BankBranch || '',
      accountType: employee.AccountType || '',
    });

    if (employee.ProfileImage) {
      this.uploadedProfileImageUrl = employee.ProfileImage;
    }
  }

// Update the closeDialog method to reset multiple files
closeDialog(): void {
  this.ref.close(this.employeeForm.value);
  this.employeeForm.reset();
  this.submitted = false;
  this.employee = {};
  this.uploadedFiles = {};
  this.multipleUploadedFiles = {
    basicDocuments: [],
    educationalDocuments: [],
    certificates: []
  };
  this.uploadingFiles = {
    applicationLetter: false,
    confirmationLetter: false,
    certificate: false,
    certificates: false,
    appointmentLetter: false,
    basicDocuments: false,
    educationalDocuments: false,
  };
}

  markAllFieldsAsTouched(): void {
    Object.keys(this.employeeForm.controls).forEach((key) => {
      const control = this.employeeForm.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });
  }




  getFilledClass(fieldName: string): { [key: string]: boolean } {
    const control = this.employeeForm.get(fieldName);
    return {
      'p-inputwrapper-filled': Boolean(control?.value),
    };
  }
  onMultipleFileSelect(event: any, fileType: string): void {
  let files;

  if (event.files && event.files.length > 0) {
    files = event.files;
  } else if (
    event.target &&
    event.target.files &&
    event.target.files.length > 0
  ) {
    files = event.target.files;
  }

  if (files && files.length > 0) {
    // Validate each file
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 10 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `File ${file.name} exceeds 10MB limit`,
          life: 3000,
        });
        continue;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `File ${file.name} has invalid format. Only JPG, PNG, GIF, PDF, DOC, and DOCX are allowed`,
          life: 3000,
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      this.uploadMultipleFiles(validFiles, fileType);
    }

    // Clear the input
    this.clearFileInput(fileType);
  }
}

// Add this method for uploading multiple files
uploadMultipleFiles(files: File[], fileType: string): void {
  this.uploadingFiles[fileType] = true;
  let completedUploads = 0;
  const totalFiles = files.length;

  files.forEach((file) => {
    const formData = new FormData();
    formData.append('file', file);

    this.employeeService
      .fileUpload(formData)
      .pipe(
        finalize(() => {
          completedUploads++;
          if (completedUploads === totalFiles) {
            this.uploadingFiles[fileType] = false;
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.body) {
            let fileUrl = '';

            if (typeof response.body === 'object') {
              if (response.body.Url) {
                fileUrl = response.body.Url;
              } else if (response.body.url) {
                fileUrl = response.body.url;
              } else if (response.body.fileUrl) {
                fileUrl = response.body.fileUrl;
              }
            } else if (
              typeof response.body === 'string' &&
              response.body.startsWith('http')
            ) {
              fileUrl = response.body;
            }

            if (fileUrl) {
              // Initialize array if it doesn't exist
              if (!this.multipleUploadedFiles[fileType]) {
                this.multipleUploadedFiles[fileType] = [];
              }

              // Add the file to the array
              this.multipleUploadedFiles[fileType].push({
                name: file.name,
                url: fileUrl,
                originalFile: file,
              });

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `${file.name} uploaded successfully`,
                life: 3000,
              });
            }
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to upload ${file.name}`,
            life: 3000,
          });
        },
      });
  });
}

// Add this method for removing files from multiple upload arrays
removeMultipleFile(fileType: string, index: number): void {
  if (this.multipleUploadedFiles[fileType] && this.multipleUploadedFiles[fileType][index]) {
    this.multipleUploadedFiles[fileType].splice(index, 1);
  }
}
}
