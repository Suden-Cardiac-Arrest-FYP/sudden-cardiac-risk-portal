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
  AbstractControl,
} from '@angular/forms';

import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { HttpResponse } from '@angular/common/http';
import { DatePicker } from 'primeng/datepicker';

import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';

import { ILeave, LeaveDto } from '../../../dto/Leave.dto';
import { LeaveService } from '../../../services/Leave.service';
import { EmployeeResponse, EmployeeDto } from '../../../dto/Employee.dto';
import { AuthService, User } from '@auth0/auth0-angular';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-create-update-leave',
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
    DatePicker,
    CalendarModule,
  ],
  templateUrl: './create-update-leave.html',
  styleUrl: './create-update-leave.scss',
  providers: [ConfirmationService, DialogService, LeaveService],
})
export class CreateUpdateLeave implements OnInit, OnDestroy {
  leave: LeaveDto = {};
  submitted: boolean = false;
  leaveForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;
  isLoadingEmployees: boolean = false;

  DisplayTime: string = '';
  startTime: string = '';
  leaveMessage: string = '';
  showTime: boolean = false;

  optionsLeaveType = [
    { label: 'Annual Leave', value: 'AnnualLeave' },
    { label: 'Casual Leave', value: 'CasualLeave' },
    { label: 'Company Leave', value: 'CompanyLeave' },
  ];


  optionsLeaveSubType = [
    { label: 'Full Day', value: 'FullDay' },
    { label: 'First Half', value: 'FirstHalf' },
    { label: 'Second Half', value: 'SecondHalf' },
    { label: 'Short Leave', value: 'ShortLeave' },
  ];

  employeeOptions: {
    label: string;
    value: string;
    name: string;
    epfNumber: string;
  }[] = [];
  coveringPersonOptions: { label: string; value: string }[] = [];

  isSuperAdmin: boolean = false;

  userRole: string | undefined = '';
  EmployeeId: string | undefined = '';
  user: User | undefined = {};
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  private leaveService = inject(LeaveService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.userRole = this.user?.['user_metadata']['role'];

        if (this.user?.['user_metadata']['employeeId'] !== undefined) {
          this.EmployeeId = this.user?.['user_metadata']['employeeId'];
        }

        localStorage.setItem('roleName', this.userRole || '');
      } else {
        this.userRole = undefined;
      }
    });

    this.checkUserRole();

    this.leaveForm = this.fb.group({
      LeaveId: [''],
      LeavingDateRange: ['', Validators.required],
      Reason: [''],
      ApprovedBy: [''],
      LeaveType: [''],
      LeaveSubType: [''],
      RequestedDate: [null],
      EmployeeId: [''],
      CoveringPersonId: [''],
      CoveringPersonName: [''],
      SelectedEmployee: [''],
      EmployeeName: [''],
      EpfNumber: [''],
      Time: [''],
    });
    this.loadEmployees();

    if (this.config.data != null) {
      this.editLeave(this.config.data);
    }
  }

  onLeaveTypeChange(value: string) {
    this.showTime = value === 'ShortLeave';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkUserRole(): void {
    const roleName = localStorage.getItem('roleName');
    this.isSuperAdmin = roleName != 'Employee';
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    const params = {
      noPagination: true,
    };

    this.leaveService
      .findAllEmployee(params)
      .pipe(
        filter((res: HttpResponse<EmployeeResponse>) => res.ok),
        map((res: HttpResponse<EmployeeResponse>) => res.body),
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingEmployees = false;
        })
      )
      .subscribe({
        next: (res: EmployeeResponse | null) => {
          if (res && res.Employee) {
            this.employeeOptions = res.Employee.map(
              (employee: EmployeeDto) => ({
                label: `${employee.Name || 'Unknown Employee'} - ${
                  employee.EpfNumber || 'No EPF'
                }`,
                value: employee.EmployeeId || '',
                name: employee.Name || 'Unknown Employee',
                epfNumber: employee.EpfNumber || '',
              })
            );

            this.coveringPersonOptions = res.Employee.map(
              (employee: EmployeeDto) => ({
                label: employee.Name || 'Unknown Employee',
                value: employee.EmployeeId || '',
              })
            );
          } else {
            this.employeeOptions = [];
            this.coveringPersonOptions = [];
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed to load employees.`,
            life: 3000,
          });
          this.employeeOptions = [];
          this.coveringPersonOptions = [];
        },
      });
  }

 onTimeChange(): void {
    // Get the form control value directly
    const timeValue = this.leaveForm.get('Time')?.value;
    console.log('Time value from form:', timeValue);
    
    if (timeValue) {
      try {
        const startDate = new Date(timeValue);
        
        // Check if date is valid
        if (!isNaN(startDate.getTime())) {
          // Store start time
          this.startTime = startDate.toTimeString().slice(0, 5);
          
          // Calculate end time (adding 3 hours)
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 1, endDate.getMinutes() + 30);
          this.DisplayTime = endDate.toTimeString().slice(0, 5);
          
          // Create the leave message
          this.leaveMessage = `Your Leave Is to be ${this.startTime} to ${this.DisplayTime}`;
        }

      } catch (error) {
        console.error('Error processing time:', error);
      }
    }
  }

  // Alternative method using event parameter with better safety
  onTimeSelect(event: any): void {
    console.log('Time select event:', event);
    
    try {
      if (event && typeof event === 'object') {
        const startDate = new Date(event);
        
        if (!isNaN(startDate.getTime())) {
          // Store start time
          this.startTime = startDate.toTimeString().slice(0, 5);
          
          // Calculate end time (adding 3 hours)
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 3);
          this.DisplayTime = endDate.toTimeString().slice(0, 5);
          
          // Create the leave message
          this.leaveMessage = `Your Leave Is to be ${this.startTime} to ${this.DisplayTime}`;
        }
      }
    } catch (error) {
      console.error('Error in onTimeSelect:', error);
    }
  }

  onCoveringPersonSelect(selectedCoveringPersonId: string): void {
    const selectedCoveringPerson = this.employeeOptions.find(
      (emp) => emp.value === selectedCoveringPersonId
    );
    if (selectedCoveringPerson) {
      this.leaveForm.patchValue({
        CoveringPersonId: selectedCoveringPersonId,
        CoveringPersonName: selectedCoveringPerson.name,
      });
    }
  }

  onEmployeeSelect(selectedEmployeeId: string): void {
    const selectedEmployee = this.employeeOptions.find(
      (emp) => emp.value === selectedEmployeeId
    );
    if (selectedEmployee) {
      this.leaveForm.patchValue({
        EmployeeId: selectedEmployeeId,
        EmployeeName: selectedEmployee.name,
        EpfNumber: selectedEmployee.epfNumber,
      });
    }
  }

  save() {
    this.submitted = true;

    console.log('Form Status:', this.leaveForm.status);
    console.log('Form Values:', this.leaveForm.value);
    console.log('Form Errors:', this.leaveForm.errors);

    const dateRange = this.leaveForm.get('LeavingDateRange')?.value;
    const Time = this.leaveForm.get('Time')?.value;

    // Convert to Date object if needed
    const date = new Date(Time);

    // Add 1 hour and 30 minutes
    date.setHours(date.getHours() + 1);
    date.setMinutes(date.getMinutes() + 30);

    // Format to HH:mm
    const formattedTime = date.toTimeString().slice(0, 5);
    console.log('Updated Time:', formattedTime);

    const formattedRange = dateRange?.map((date: string | Date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    if (this.leaveForm.invalid) {
      console.log('Form is invalid, checking individual controls:');
      Object.keys(this.leaveForm.controls).forEach((key) => {
        const control = this.leaveForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} is invalid:`, control.errors);
        }
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    this.leaveForm.patchValue({
      LeavingDateRange: formattedRange,
      Time: formattedTime,
    });

    if (this.EmployeeId !== undefined && this.EmployeeId !== '') {
      this.leaveForm.patchValue({
        EmployeeId: this.EmployeeId,
      });
    }

    const leave = this.leaveForm.value;

    console.log('Submitting leave data:', leave);

    if (leave.LeaveId) {
      this.leaveService
        .updateLeave(leave)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(
          (res) => {
            console.log('Update response:', res);
            if (res.body) {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `Leave Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            console.error('Update error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Leave.`,
              life: 3000,
            });
          }
        );
    } else {
      this.leaveService
        .createLeave(leave)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(
          (res) => {
            console.log('Create response:', res);
            if (res.body) {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `Leave Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            console.error('Create error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Leave.`,
              life: 3000,
            });
          }
        );
    }
  }

  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.leaveForm.value);
    this.leaveForm.reset();
    this.submitted = false;
    this.leave = {};
  }

  editLeave(leave: LeaveDto) {
    this.leave = { ...leave };
    this.leaveForm.patchValue({ ...leave });
  }

  getFilledClass(fieldName: string): { [key: string]: boolean } {
    const control = this.leaveForm.get(fieldName);
    return {
      'p-inputwrapper-filled': Boolean(control?.value),
    };
  }
}
