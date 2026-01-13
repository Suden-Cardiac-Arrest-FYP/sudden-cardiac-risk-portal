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

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

import { IShift, ShiftDto, IWeekSchedule, IDaySchedule } from '../../../dto/Shift.dto';
import { ShiftService } from '../../../services/Shift.service';

@Component({
  selector: 'app-create-update-shift',
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
    ToggleButtonModule,
    CalendarModule,
    TooltipModule,
  ],
  templateUrl: './create-update-shift.html',
  styleUrl: './create-update-shift.scss',
  providers: [ConfirmationService, DialogService, ShiftService],
})
export class CreateUpdateShift implements OnInit, OnDestroy {
  shift: ShiftDto = new ShiftDto();
  submitted: boolean = false;
  shiftForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private shiftService = inject(ShiftService);
  private messageService = inject(MessageService);
  public config = inject(DynamicDialogConfig); // Made public for template access
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.config.data) {
      this.editShift(this.config.data);
    } else {
      // Add initial week for new shifts
      this.addWeek();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.shiftForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(2)]],
      Weeks: this.fb.array([]),
    });
  }

  get weeks(): FormArray {
    return this.shiftForm.get('Weeks') as FormArray;
  }

  addWeek(): void {
    const week = this.fb.group({
      Days: this.fb.array(this.dayNames.map(() => this.createDayGroup())),
    });
    this.weeks.push(week);
  }

  removeWeek(index: number): void {
    if (this.weeks.length > 1) {
      this.weeks.removeAt(index);
    }
  }

  createDayGroup(): FormGroup {
    return this.fb.group({
      startTime: [{ value: null, disabled: false }], // Start disabled
      endTime: [{ value: null, disabled: false }],   // Start disabled
      isActive: [true], // Default to false (inactive)
    });
  }

  getDays(weekIndex: number): FormArray {
    return this.weeks.at(weekIndex).get('Days') as FormArray;
  }

  getDayControl(weekIndex: number, dayIndex: number, controlName: string): AbstractControl | null {
    return this.getDays(weekIndex).at(dayIndex).get(controlName);
  }

  onToggleChange(weekIndex: number, dayIndex: number): void {
    const day = this.getDays(weekIndex).at(dayIndex);
    const isActive = day.get('isActive')?.value;

    if (!isActive) {
      // Clear times when inactive and disable fields
      day.get('startTime')?.setValue(null);
      day.get('endTime')?.setValue(null);
      day.get('startTime')?.disable();
      day.get('endTime')?.disable();
    } else {
      // Enable time fields when active
      day.get('startTime')?.enable();
      day.get('endTime')?.enable();
    }

    // Mark as touched for validation
    day.get('startTime')?.markAsTouched();
    day.get('endTime')?.markAsTouched();
  }

  getActiveDaysCount(weekIndex: number): number {
    const days = this.getDays(weekIndex);
    return days.controls.filter(day => day.get('isActive')?.value).length;
  }

  calculateWeekHours(weekIndex: number): number {
    const days = this.getDays(weekIndex);
    let totalHours = 0;

    days.controls.forEach(day => {
      if (day.get('isActive')?.value) {
        const startTime = day.get('startTime')?.value;
        const endTime = day.get('endTime')?.value;

        if (startTime && endTime) {
          // Handle Date objects properly
          const start = startTime instanceof Date ? startTime : new Date(startTime);
          const end = endTime instanceof Date ? endTime : new Date(endTime);
          
          const diffMs = end.getTime() - start.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          
          if (diffHours > 0) {
            totalHours += diffHours;
          }
        }
      }
    });

    return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
  }

  hasInvalidTimeRanges(): boolean {
    for (let i = 0; i < this.weeks.length; i++) {
      const days = this.getDays(i);
      
      for (let j = 0; j < days.length; j++) {
        const day = days.at(j);
        const isActive = day.get('isActive')?.value;
        
        if (isActive) {
          const startTime = day.get('startTime')?.value;
          const endTime = day.get('endTime')?.value;
          
          if (!startTime || !endTime) {
            // Active day must have both start and end times
            return true;
          }
          
          const start = startTime instanceof Date ? startTime : new Date(startTime);
          const end = endTime instanceof Date ? endTime : new Date(endTime);
          
          if (end <= start) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private validateActiveDays(): boolean {
    // Ensure each active day has valid time ranges
    for (let i = 0; i < this.weeks.length; i++) {
      const days = this.getDays(i);
      
      for (let j = 0; j < days.length; j++) {
        const day = days.at(j);
        const isActive = day.get('isActive')?.value;
        
        if (isActive) {
          const startTime = day.get('startTime')?.value;
          const endTime = day.get('endTime')?.value;
          
          if (!startTime || !endTime) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Validation Error',
              detail: `${this.dayNames[j]} in Week ${i + 1} is active but missing time values.`,
              life: 4000,
            });
            return false;
          }
          
          const start = startTime instanceof Date ? startTime : new Date(startTime);
          const end = endTime instanceof Date ? endTime : new Date(endTime);
          
          if (end <= start) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Validation Error',
              detail: `${this.dayNames[j]} in Week ${i + 1} has invalid time range (end time must be after start time).`,
              life: 4000,
            });
            return false;
          }
        }
      }
    }
    return true;
  }

  save(): void {
    this.submitted = true;

    if (this.shiftForm.invalid) {
      this.markFormGroupTouched(this.shiftForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Form Invalid',
        detail: 'Please fill in all required fields correctly.',
        life: 3000,
      });
      return;
    }

    if (!this.validateActiveDays()) {
      return;
    }

      if (this.weeks.length < 4) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'At least 4 weeks are required in the shift schedule.',
      life: 4000,
    });
    return;
  }

    // Check if at least one day is active across all weeks
    let hasActiveDay = false;
    for (let i = 0; i < this.weeks.length; i++) {
      if (this.getActiveDaysCount(i) > 0) {
        hasActiveDay = true;
        break;
      }
    }

    if (!hasActiveDay) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'At least one day must be active in the shift schedule.',
        life: 4000,
      });
      return;
    }

    this.isLoading = true;
    const shift = this.prepareShiftData();

    if (shift.ShiftId) {
      this.updateShift(shift);
    } else {
      this.createShift(shift);
    }
  }

  private prepareShiftData(): ShiftDto {
    const formValue = this.shiftForm.value;
    
    // Process the form data to match your backend expectations
    const processedWeeks: IWeekSchedule[] = formValue.Weeks.map((week: any) => ({
      Days: week.Days.map((day: any, index: number) => ({
        dayName: this.dayNames[index],
        startTime: day.isActive && day.startTime ? this.formatTimeForBackend(day.startTime) : null,
        endTime: day.isActive && day.endTime ? this.formatTimeForBackend(day.endTime) : null,
        isActive: day.isActive,
      }))
    }));

    return new ShiftDto(
      this.shift.ShiftId || undefined,
      formValue.Name,
      this.shift.IsDefault || false,
      this.shift.Location || '',
      processedWeeks
    );
  }

  private formatTimeForBackend(time: Date | string): string {
    if (!time) return '';
    
    const date = time instanceof Date ? time : new Date(time);
    return date.toTimeString().slice(0, 8); // HH:MM:SS format
  }

  private parseTimeFromBackend(timeString: string): Date | null {
    if (!timeString) return null;
    
    const today = new Date();
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    
    today.setHours(hours || 0, minutes || 0, seconds || 0, 0);
    return today;
  }

  private createShift(shift: ShiftDto): void {
    this.shiftService
      .createShift(shift)
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
              detail: 'Shift created successfully!',
              life: 3000,
            });
            this.CloseInstances();
          }
        },
        error: (error) => {
          console.error('Error creating shift:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create shift. Please try again.',
            life: 3000,
          });
        }
      });
  }

  private updateShift(shift: ShiftDto): void {
    this.shiftService
      .updateShift(shift)
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
              detail: 'Shift updated successfully!',
              life: 3000,
            });
            this.CloseInstances();
          }
        },
        error: (error) => {
          console.error('Error updating shift:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',  
            detail: 'Failed to update shift. Please try again.',
            life: 3000,
          });
        }
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
            arrayControl.markAsDirty();
          }
        });
      } else {
        control?.markAsTouched();
        control?.markAsDirty();
      }
    });
  }

  CloseInstances(event?: Event): void {
    event?.preventDefault();
    this.ref.close(this.shiftForm.value);
    this.shiftForm.reset();
    this.submitted = false;
    this.shift = new ShiftDto();
  }

  editShift(shift: IShift): void {
    this.shift = new ShiftDto(shift.ShiftId, shift.Name, shift.IsDefault, shift.Location, shift.Weeks);

    // Clear existing weeks
    while (this.weeks.length !== 0) {
      this.weeks.removeAt(0);
    }

    // Populate form with shift data
    this.shiftForm.patchValue({ 
      Name: shift.Name 
    });

    // Add weeks from shift data
    if (shift.Weeks && shift.Weeks.length > 0) {
      shift.Weeks.forEach((week: IWeekSchedule) => {
        const weekGroup = this.fb.group({
          Days: this.fb.array([])
        });

        const daysArray = weekGroup.get('Days') as FormArray;
        
        // Add days for this week
        this.dayNames.forEach((dayName, index) => {
          const dayData = week.Days ? week.Days.find((d: IDaySchedule) => d.dayName === dayName) : null;
          
          const dayGroup = this.fb.group({
            startTime: [dayData && dayData.startTime ? this.parseTimeFromBackend(dayData.startTime) : null],
            endTime: [dayData && dayData.endTime ? this.parseTimeFromBackend(dayData.endTime) : null],
            isActive: [dayData ? dayData.isActive : false],
          });

          // Enable/disable time fields based on active state
          if (!dayData || !dayData.isActive) {
            dayGroup.get('startTime')?.disable();
            dayGroup.get('endTime')?.disable();
          } else {
            dayGroup.get('startTime')?.enable();
            dayGroup.get('endTime')?.enable();
          }

          daysArray.push(dayGroup);
        });

        this.weeks.push(weekGroup);
      });
    } else {
      // Add default week if no weeks in data
      this.addWeek();
    }
  }
}