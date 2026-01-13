import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

import { CommonModule, formatDate } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';

import { IPayroll, PayrollDto } from '../../../dto/Payroll.dto';
import { PayrollService } from '../../../services/Payroll.service';
import { PaysheetDto } from '../../../dto/Paysheet.dto';

@Component({
  selector: 'app-create-update-payroll',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabel,
    ButtonModule,
    InputTextModule,
    DatePicker,
    PasswordModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './create-update-paysheet.html',
  styleUrl: './create-update-paysheet.scss',
  providers: [ConfirmationService, DialogService, PayrollService],
})
export class CreateUpdatePaysheet implements OnInit, OnDestroy {
  payroll: PayrollDto = {};
  submitted: boolean = false;
  payrollForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private payrollService = inject(PayrollService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Keep 0-based for Date object

    // Create Date objects for the current year and month
    const currentYearDate = new Date(currentYear, 0, 1); // January 1st of current year
    const currentMonthDate = new Date(currentYear, currentMonth, 1); // 1st day of current month

    this.payrollForm = this.fb.group({
      PaySheetId: [''],
      Month: [currentMonthDate, Validators.required], // Use Date object
      Year: [currentYearDate, Validators.required], // Use Date object
      TotalSalaries: [0],
      CostToTheCompany: [0],
      PaySlip: this.fb.array([]),
      EmployeeId: this.fb.array([]),
      Date: [currentDate, Validators.required],
    });

    if (this.config.data != null) {
      this.editPayroll(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.payrollForm.invalid) {
      Object.keys(this.payrollForm.controls).forEach((key) => {
        const control = this.payrollForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const payroll = this.payrollForm.value;

    // Convert Date objects to appropriate format before sending to API
    const payrollData = {
      ...payroll,
      Year: payroll.Year ? payroll.Year.getFullYear() : null,
      Month: payroll.Month ? payroll.Month.getMonth() + 1 : null, // Convert to 1-based month
    };

    if (payrollData.PaySheetId) {
      this.payrollService
        .updatePayroll(payrollData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(
          (res) => {
            if (res.body) {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `Payroll Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Payroll.`,
              life: 3000,
            });
          }
        );
    } else {
      this.payrollService
        .createPayroll(payrollData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(
          (res) => {
            if (res.body) {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `Payroll Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Payroll.`,
              life: 3000,
            });
          }
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.payrollForm.value);
    this.payrollForm.reset();
    this.submitted = false;
    this.payroll = {};
  }

//edit payroll
editPayroll(payroll: PaysheetDto) {
  this.payroll = { ...payroll };
  
  // Prepare a new object for patching the form, converting string fields to Date objects as needed
  const editData: any = { ...payroll };
  
  // Handle Year conversion (string to Date object) for form patching only
  if (payroll.Year) {
    try {
      const year = parseInt(payroll.Year, 10);
      if (!isNaN(year) && year > 1900 && year < 3000) {
        editData.Year = new Date(year, 0, 1); // January 1st of the year
      } else {
        console.warn('Invalid year value:', payroll.Year);
        editData.Year = new Date(); // fallback to current date
      }
    } catch (error) {
      console.error('Error parsing year:', error);
      editData.Year = new Date();
    }
  }
  
  // Handle Month conversion (string to Date object)
  if (payroll.Month) {
    try {
      const month = parseInt(payroll.Month, 10);
      let year = new Date().getFullYear(); // Default to current year
      
      // Get year from the Year field if available
      if (payroll.Year) {
        const yearValue = parseInt(payroll.Year, 10);
        if (!isNaN(yearValue)) {
          year = yearValue;
        }
      }
      
      if (!isNaN(month) && month >= 1 && month <= 12) {
        // Month is 1-based (1-12), convert to 0-based for Date object
        editData.Month = new Date(year, month - 1, 1);
      } else {
        console.warn('Invalid month value:', payroll.Month);
        editData.Month = new Date(); // fallback to current date
      }
    } catch (error) {
      console.error('Error parsing month:', error);
      editData.Month = new Date();
    }
  }
  
  // Handle Date field (string to Date object)
  if (payroll.Date) {
    try {
      const dateValue = new Date(payroll.Date);
      if (!isNaN(dateValue.getTime())) {
        editData.Date = dateValue;
      } else {
        console.warn('Invalid date value:', payroll.Date);
        editData.Date = new Date(); // fallback to current date
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      editData.Date = new Date();
    }
  }
  
  // Handle CreatedDate if it exists (assuming it might be in the DTO)
  if ((payroll as any).CreatedDate) {
    try {
      const createdDate = new Date((payroll as any).CreatedDate);
      if (!isNaN(createdDate.getTime())) {
        (editData as any).createdDate = createdDate;
      } else {
        (editData as any).createdDate = new Date();
      }
    } catch (error) {
      console.error('Error parsing created date:', error);
      (editData as any).createdDate = new Date();
    }
  }
  
  // Remove undefined values to prevent form control errors
  Object.keys(editData).forEach(key => {
    if (editData[key as keyof typeof editData] === undefined) {
      delete editData[key as keyof typeof editData];
    }
  });
  
  // Patch the form with converted data
  this.payrollForm.patchValue(editData);
}
}