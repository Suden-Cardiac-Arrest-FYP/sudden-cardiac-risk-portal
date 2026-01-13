import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IIrregularAttendancePayroll, Time } from '../../dto/IrregularAttendance-Payroll.dto';
import { IrregularAttendanceService } from '../../services/IrregularAttendance.service';

@Component({
  selector: 'app-resolve-attendance',
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ReactiveFormsModule,
  ],
  templateUrl: './resolve-attendance.component.html',
  styleUrl: './resolve-attendance.component.scss',
  providers: []
})
export class ResolveAttendanceComponent implements OnInit, OnDestroy {
  irregularAttendanceForm!: FormGroup;
  submitted = false;
  isLoading = false;
  private destroy$ = new Subject<void>();
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private irregularAttendanceService = inject(IrregularAttendanceService);


  ngOnInit() {
    this.initializeForm();

    if (this.config.data) {
      const data = this.config.data as IIrregularAttendancePayroll;

      this.irregularAttendanceForm.patchValue({
        AttendanceId: data.AttendanceId,
        Date: data.Date,
        EmployeeId: data.EmployeeId,
        AttendanceStatus: data.AttendanceStatus,
        ShiftStartTime: data.ShiftStartTime,
        ShiftEndTime: data.ShiftEndTime,
        deleted: data.deleted,
        RecordType: data.RecordType,
        isAdjusted: data.isAdjusted,
        LateMinutes: data.LateMinutes,
        HasLeave: data.HasLeave,
      });

      const timeArray = this.irregularAttendanceForm.get('time') as FormArray;
      timeArray.clear();

      if (data.time && Array.isArray(data.time)) {
        data.time.forEach((entry: Time) => {
          timeArray.push(this.fb.group({
            inTime: [entry.inTime],
            endTime: [entry.endTime]
          }));
        });
      } else {
        this.addTimePair();
      }
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm() {
    this.irregularAttendanceForm = this.fb.group({
      AttendanceId: [''],
      Date: [''],
      EmployeeId: [''],
      time: this.fb.array([]),
      AttendanceStatus: [''],
      ShiftStartTime: [''],
      ShiftEndTime: [''],
      deleted: [false],
      RecordType: [''],
      isAdjusted: [false],
      LateMinutes: [0],
      HasLeave: [false]
    });

    this.addTimePair();
  }

  get timeArray(): FormArray {
    return this.irregularAttendanceForm.get('time') as FormArray;
  }

  createTimePairGroup(): FormGroup {
    return this.fb.group({
      inTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      endTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    }, { validators: this.timeRangeValidator });
  }

  timeRangeValidator(group: FormGroup) {
    const inTime = group.get('inTime')?.value;
    const endTime = group.get('endTime')?.value;

    if (inTime && endTime) {
      const inTimeMinutes = this.timeToMinutes(inTime);
      const endTimeMinutes = this.timeToMinutes(endTime);

      if (endTimeMinutes <= inTimeMinutes) {
        return { timeRange: true };
      }
    }
    return null;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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

  save() {
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
const formValue = this.irregularAttendanceForm.value;
const attendanceId = formValue.AttendanceId;

const requestBody = {
  time: formValue.time.map((timeEntry: Time) => ({
    inTime: timeEntry.inTime,
    endTime: timeEntry.endTime
  }))
};

this.irregularAttendanceService
  .updateAttendanceTime(requestBody, attendanceId)
  .pipe(
    finalize(() => {
      this.isLoading = false;
    }),
    takeUntil(this.destroy$)
  )
  .subscribe({
    next: (res) => {
      if (res.body) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Time entries saved successfully.',
          life: 3000,
        });
      }
      this.CloseInstances();
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save time entries.',
        life: 3000,
      });
    },
  });
  }

  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.irregularAttendanceForm.value);
    this.irregularAttendanceForm.reset();
    this.submitted = false;
  }
}