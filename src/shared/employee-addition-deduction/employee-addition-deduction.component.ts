import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmployeeAdditionDeductionService } from '../../services/EmployeeAdditionDeduction.service';
import {
  EmployeeAdditionDeductionDto,
  EmployeeAdditionDeductionResponse,
} from '../../dto/EmployeeAdditionDeduction.dto';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpResponse } from '@angular/common/http';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-employee-addition-deduction',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    FormsModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    Select
  ],
  templateUrl: './employee-addition-deduction.component.html',
  styleUrl: './employee-addition-deduction.component.scss',
  providers: [EmployeeAdditionDeductionService],
})
export class EmployeeAdditionDeductionComponent implements OnInit {
  displayAdditionDialog: boolean = false;
  isLoading: boolean = false;
  isTypeDisabled: boolean = false;
  isSubmitiing: boolean = false;
  form!: FormGroup;
  showAddForm: boolean = false;
  submitted: boolean = false;
  employeeAddDedList: EmployeeAdditionDeductionDto[] = [];

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private employeeAdditionDeductionService = inject(
    EmployeeAdditionDeductionService
  );
  private messageService = inject(MessageService);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  ngOnInit(): void {
    const employeeId = this.config.data?.employeeId;

    let normalizedType: 'ADDITION' | 'DEDUCTION' | null = null;
    let isDefault = true;

    if (this.config.data?.type) {
      this.isTypeDisabled = true;
      isDefault = false;

      if (this.config.data?.type === 'Addition') {
        normalizedType = 'ADDITION';
      } else if (this.config.data?.type === 'Deduction') {
        normalizedType = 'DEDUCTION';
      }
    }

    const today = new Date().toISOString().slice(0, 10);

    this.form = this.fb.group({
      EmployeeId: [employeeId, Validators.required],
      Name: ['', Validators.required],
      Type: [ normalizedType, Validators.required],
      Value: [0, [Validators.required, Validators.min(0)]],
      IsDefault: [isDefault],
      Date: [today, Validators.required],
    });

    if (employeeId) {
      this.loadEmployeeAdditionsDeductions(employeeId);
    }
  }


  loadEmployeeAdditionsDeductions(employeeId: string): void {
    this.isLoading = true;

    this.employeeAdditionDeductionService
      .findAllAdditionsOrDeductionsByEmployeeId(employeeId)
      .pipe(
        filter(
          (res: HttpResponse<EmployeeAdditionDeductionResponse>) => res.ok
        ),
        map((res) => res.body?.AdditionsOrDeductions || []),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.employeeAddDedList = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to load payroll additions/deductions.',
            life: 4000,
          });
          this.isLoading = false;
        },
      });
  }

  deleteEntry(id: string): void {
    if (!id) {
      console.warn('Invalid ID for deletion');
      return;
    }

    const params = { additionsOrDeductionsId: id };

    this.employeeAdditionDeductionService.deleteAdditionOrDeduction(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Entry deleted successfully',
            life: 3000,
          });

          console.log('Entry deleted successfully:', id);
          const employeeId = this.form.value.EmployeeId;
          if (employeeId) {
            this.loadEmployeeAdditionsDeductions(employeeId);
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete entry',
            life: 3000,
          });
        }
      });
  }

  closeDialog(event?: Event, shouldReload: boolean = false) {
    event?.preventDefault();
    this.ref.close({ shouldReload });
    this.form.reset();
    this.submitted = false;
  }

  submitNewEntry(): void {
    this.submitted = true;

    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isSubmitiing = true;

    const formData = {
      AdditionsOrDeductionsId: '',
      Name: this.form.value.Name || '',
      Type: this.form.value.Type || '',
      Value: this.form.value.Value || 0,
      IsDefault: this.form.value.IsDefault,
      Deleted: false,
      Date: this.form.value.Date,
      EmployeeId: this.form.value.EmployeeId,
    };

    this.employeeAdditionDeductionService
      .createAdditionOrDeduction(formData)
      .pipe(
        finalize(() => {
          this.isSubmitiing = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Added',
            detail: 'Entry added successfully',
            life: 3000,
          });

          const employeeId = this.form.value.EmployeeId;
          if (employeeId) {
            this.loadEmployeeAdditionsDeductions(employeeId);
          }

          this.form.patchValue({ Name: '', Type: null, Value: 0 });
          this.showAddForm = false;
          this.isSubmitiing = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add entry',
            life: 3000,
          });
        }
      });
  }

  cancelAddForm(): void {
    this.form.patchValue({ Name: '', Type: null, Value: 0 });
    this.submitted = false;
    this.showAddForm = false;
  }
}
