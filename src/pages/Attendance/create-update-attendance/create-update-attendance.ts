import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  FormArray,
} from '@angular/forms';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { finalize, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { AttendanceDto, Time } from '../../../dto/Attendance.dto';
import { AttendanceService } from '../../../services/Attendance.service';
import { IEmployee } from '../../../dto/Employee.dto';

@Component({
  selector: 'app-create-update-attendance',
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
    Select,
    FormsModule,
  ],
  templateUrl: './create-update-attendance.html',
  styleUrl: './create-update-attendance.scss',
  providers: [ConfirmationService, DialogService, AttendanceService],
})
export class CreateUpdateAttendance implements OnInit, OnDestroy {
  attendance: AttendanceDto = {};
  submitted: boolean = false;
  attendanceForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;
  isLoadingEmployees: boolean = false;
  EditModeEndTime: boolean = false;


  employeeOptions: { label: string; value: string; empId: string; department: string }[] = [];
  allEmployees: IEmployee[] = [];

  private destroy$ = new Subject<void>();
  private attendanceService = inject(AttendanceService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.attendanceForm = this.fb.group({
      AttendanceId: [''],
      Date: ['', Validators.required],
      EmployeeId: ['', Validators.required],
      time: this.fb.array([]),
      AttendanceStatus: [''],
      ShiftStartTime: [''],
      ShiftEndTime: [''],
      deleted: [false],
    });


    this.loadEmployees();
    if (this.config.data != null) {
      this.EditModeEndTime =true;
      this.editAttendance(this.config.data);
      console.log('Edit Mode', this.EditModeEndTime);
    } else {
      this.addTimePair();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {

    if (this.attendanceForm.invalid) {
      Object.keys(this.attendanceForm.controls).forEach((key) => {
        const control = this.attendanceForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }
    this.submitted = true;
    const timeArray = this.timeArray;

    let hasEmpty = false;
    let hasInvalidOrder = false;

    for (const ctrl of timeArray.controls) {
      const inTime = ctrl.get('inTime')?.value?.trim();
      const endTime = ctrl.get('endTime')?.value?.trim();

      if (!inTime || !endTime) {
        hasEmpty = true;
        continue;
      }

      const [inHours, inMinutes] = inTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const inTotal = inHours * 60 + inMinutes;
      const endTotal = endHours * 60 + endMinutes;

      if (inTotal >= endTotal) {
        hasInvalidOrder = true;
      }
    }

    if (hasEmpty) {
      this.messageService.add({
        severity: 'error',
        summary: 'Incomplete Time Entry',
        detail: 'All time entries must have both Start Time and End Time.'
      });
    }

    if (hasInvalidOrder) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Time Range',
        detail: 'Start Time must be earlier than End Time in all entries.'
      });
    }

    if (hasEmpty || hasInvalidOrder) {
      return;
    }

    this.isLoading = true;

    const formValue = this.attendanceForm.value;

    let formattedDate = formValue.Date;

    if (formattedDate instanceof Date && !isNaN(formattedDate.getTime())) {
      const year = formattedDate.getFullYear();
      const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
      const day = String(formattedDate.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    const attendance: any = {
      Date: formattedDate,
      EmployeeId: formValue.EmployeeId,
      time: formValue.time.map((timeEntry: Time) => ({
        inTime: timeEntry.inTime,
        endTime: timeEntry.endTime
      })),
      AttendanceStatus: formValue.AttendanceStatus,
      ShiftStartTime: formValue.ShiftStartTime,
      ShiftEndTime: formValue.ShiftEndTime
    };
    if (formValue.AttendanceId) {
      attendance.AttendanceId = formValue.AttendanceId;
    }

    if (attendance.AttendanceId) {
      this.attendanceService
        .updateAttendance(attendance, attendance.AttendanceId)
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
                detail: `Attendance Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Attendance.`,
              life: 3000,
            });
          },
        );
    } else {
      this.attendanceService
        .createAttendance(attendance)
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
                detail: `Attendance Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Attendance.`,
              life: 3000,
            });
          },
        );
    }
  }

  // Close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.attendanceForm.value);
    this.attendanceForm.reset();
    this.submitted = false;
    this.attendance = {};
  }

  // Edit attendance
  editAttendance(attendance: AttendanceDto) {
    this.attendance = { ...attendance };

    this.attendanceForm.patchValue({ ...attendance });

    this.attendanceForm.patchValue({
      Date: attendance.Date ? new Date(attendance.Date) : null,
    });
    const timeArray = this.attendanceForm.get('time') as FormArray;
    timeArray.clear();

    if (attendance.time && Array.isArray(attendance.time)) {
      attendance.time.forEach((entry: Time) => {
        timeArray.push(this.fb.group({
          inTime: [entry.inTime],
          endTime: [entry.endTime]
        }));
      });
    } else {
      this.addTimePair()
    }
  }

  getFilledClass(fieldName: string): { [key: string]: boolean } {
    const control = this.attendanceForm.get(fieldName);
    return {
      'p-inputwrapper-filled': Boolean(control?.value),
    };
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    const params = {
      noPagination: true
    };

    this.attendanceService
      .findAllEmployee(params)
      .pipe(
        finalize(() => {
          this.isLoadingEmployees = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (response) => {
          if (response.body && response.body.Employee) {
            this.allEmployees = response.body.Employee.filter(emp => emp.IsActive);
            this.employeeOptions = this.allEmployees.map(employee => ({
              label: `${employee.Name}`,
              value: employee.EmployeeId || '',
              empId: employee.EmployeeId || '',
              department: employee.Department || 'N/A'
            }));
          }
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load employees.',
            life: 3000,
          });
        },
      );
  }

  get timeArray(): FormArray {
    return this.attendanceForm.get('time') as FormArray;
  }

  createTimePairGroup(): FormGroup {
    return this.fb.group({
      inTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      endTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    }, { validators: timeRangeValidator });
  }

  addTimePair() {
    this.timeArray.push(this.createTimePairGroup());
  }

  removeTimePair(index: number) {
    if (this.timeArray.length > 1) {
      this.timeArray.removeAt(index);
    }
  }

  formatTimeInput(event: any, controlName: string, index: number) {
    let value = event.target.value.replace(/[^\d]/g, '');

    if (value.length >= 3) {
      value = value.substring(0, 2) + ':' + value.substring(2, 4);
    }

    const parts = value.split(':');
    if (parts[0] && parseInt(parts[0]) > 23) {
      parts[0] = '23';
    }
    if (parts[1] && parseInt(parts[1]) > 59) {
      parts[1] = '59';
    }

    const formattedValue = parts.join(':');
    const control = this.timeArray.at(index).get(controlName);
    if (control) {
      control.setValue(formattedValue);
    }
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeRangeValidator(group: FormGroup) {
  const inTime = group.get('inTime')?.value;
  const endTime = group.get('endTime')?.value;

  if (inTime && endTime) {
    const inTimeMinutes = timeToMinutes(inTime);
    const endTimeMinutes = timeToMinutes(endTime);

    if (endTimeMinutes <= inTimeMinutes) {
      return { timeRange: true };
    }
  }
  return null;
}