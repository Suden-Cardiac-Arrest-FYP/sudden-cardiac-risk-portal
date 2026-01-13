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


import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { debounce, debounceTime, distinctUntilChanged, filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';

import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';



import { IDepartment, DepartmentDto } from '../../../dto/Department.dto';
import { DepartmentService } from '../../../services/Department.service';
import { EmployeeDto, EmployeeResponse, IEmployee } from '../../../dto/Employee.dto';
import { EmployeeService } from '../../../services/Employee.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-update-department',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabel,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './create-update-department.html',
  styleUrl: './create-update-department.scss',
  providers: [ConfirmationService, DialogService, DepartmentService, EmployeeService],
})
export class CreateUpdateDepartment implements OnInit, OnDestroy {
  department: DepartmentDto = {};
  submitted: boolean = false;
  departmentForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);
  private employeeService = inject(EmployeeService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  employeeList: EmployeeDto[] = [];
  isDataLoading: boolean = false;
  EmployeeData: IEmployee[] =[];

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.departmentForm = this.fb.group({
      DepartmentId: [''],
      Name: ['', Validators.required],
      hod: [''],
    });

    this.findAllEmployee()

    //edit department if requested by the row click
    if (this.config.data != null) {
      this.editDepartment(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.departmentForm.invalid) {
      Object.keys(this.departmentForm.controls).forEach((key) => {
        const control = this.departmentForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const department = this.departmentForm.value;

    if (department.DepartmentId) {
      this.departmentService
        .updateDepartment(department)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe(
          (res) => {
            if (res.body) {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `Department Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Department.`,
              life: 3000,
            });
          },
        );
    } else {
      this.departmentService
        .createDepartment(department)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe(
          (res) => {
            if (res.body) {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `Department Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Department.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.departmentForm.value);
    this.departmentForm.reset();
    this.submitted = false;
    this.department = {};
  }

  //edit department
  editDepartment(department: DepartmentDto) {
    this.department = { ...department };

    this.departmentForm.patchValue({ ...department });
  }

  findAllEmployee(): void {
    this.isDataLoading = true;
    const params = {
      noPagination: 'true',
    };
    this.employeeService
      .findAllEmployee(params)
      .pipe(
        filter((res: HttpResponse<EmployeeResponse>) => res.ok),
        map((res: HttpResponse<EmployeeResponse>) => res.body),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res: EmployeeResponse | null) => {
          if (res != null) {
            this.EmployeeData = res.Employee || [];
          } else {
            this.EmployeeData = [];
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed To Load all Employee.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting all Employee', res);
        },
      });
  }
}
