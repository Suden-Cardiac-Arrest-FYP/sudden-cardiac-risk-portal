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

import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  filter,
  finalize,
  map,
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';

import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';

import {
  IEvaluationForm,
  EvaluationFormDto,
} from '../../../dto/EvaluationForm.dto';
import { EvaluationFormService } from '../../../services/EvaluationForm.service';
import { IEmployee } from '../../../dto/Employee.dto';

@Component({
  selector: 'app-create-update-evaluationForm',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabel,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    Select,
    FormsModule,
  ],
  templateUrl: './create-update-evaluationForm.html',
  styleUrl: './create-update-evaluationForm.scss',
  providers: [ConfirmationService, DialogService, EvaluationFormService],
})
export class CreateUpdateEvaluationForm implements OnInit, OnDestroy {
  evaluationForm: EvaluationFormDto = {};
  submitted: boolean = false;
  evaluationFormForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;
  employees: IEmployee[] = [];
  isLoadingEmployees: boolean = false;

  private destroy$ = new Subject<void>();
  private evaluationFormService = inject(EvaluationFormService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.evaluationFormForm = this.fb.group({
      EvaluationFormId: [''],
      EmployeeId: ['', Validators.required],
    });

    this.loadEmployees();

    if (this.config.data != null) {
      this.editEvaluationForm(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(searchTerm: string = ''): void {
    this.isLoadingEmployees = true;
    const params = {
      noPagination: true,
    };

    this.evaluationFormService
      .findAllEmployee(params)
      .pipe(
        finalize(() => {
          this.isLoadingEmployees = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (response) => {
          if (response.body?.Employee) {
            this.employees = response.body.Employee.map((emp) => ({
              ...emp,
              displayName: `${emp.Name} - EPF: ${emp.EpfNumber}`,
            }));
          }
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load employees',
            life: 3000,
          });
        }
      );
  }

  onEmployeeSearch(event: any): void {
    const searchTerm = event.filter || '';
    this.loadEmployees(searchTerm);
  }

  save() {
    this.submitted = true;

    if (this.evaluationFormForm.invalid) {
      Object.keys(this.evaluationFormForm.controls).forEach((key) => {
        const control = this.evaluationFormForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please select an employee',
        life: 3000,
      });
      return;
    }

    this.isLoading = true;

    const formValue = this.evaluationFormForm.value;
    const selectedEmployee = this.employees.find(
      (emp) => emp.EmployeeId === formValue.EmployeeId
    );

    const evaluationForm = {
      EvaluationFormId: formValue.EvaluationFormId || '',
      EmployeeId: formValue.EmployeeId,
      EmployeeName: selectedEmployee?.Name || '',
      EpfNumber: selectedEmployee?.EpfNumber || '',
      DateJoined: selectedEmployee?.DateJoined || '',
      DesignationId: selectedEmployee?.DesignationId || '',
      DepartmentId: selectedEmployee?.DepartmentId || '',
      Deleted: false,
    };

    if (formValue.EvaluationFormId) {
      this.evaluationFormService
        .updateEvaluationForm(evaluationForm)
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
                detail: `EvaluationForm Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update EvaluationForm.`,
              life: 3000,
            });
          }
        );
    } else {
      this.evaluationFormService
        .createEvaluationForm(evaluationForm)
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
                detail: `EvaluationForm Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create EvaluationForm.`,
              life: 3000,
            });
          }
        );
    }
  }

  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.evaluationFormForm.value);
    this.evaluationFormForm.reset();
    this.submitted = false;
    this.evaluationForm = {};
  }

  editEvaluationForm(evaluationForm: EvaluationFormDto) {
    this.evaluationForm = { ...evaluationForm };
    this.evaluationFormForm.patchValue({ ...evaluationForm });
  }

  getFilledClass(fieldName: string): { [key: string]: boolean } {
    const control = this.evaluationFormForm.get(fieldName);
    return {
      'p-inputwrapper-filled': Boolean(control?.value),
    };
  }
}
