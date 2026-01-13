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
import { filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';

import { IHoliday, HolidayDto } from '../../../dto/Holiday.dto';
import { HolidayService } from '../../../services/Holiday.service';

@Component({
  selector: 'app-create-update-holiday',
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
    TextareaModule,
    MultiSelectModule,
  ],
  templateUrl: './create-update-holiday.html',
  styleUrl: './create-update-holiday.scss',
  providers: [ConfirmationService, DialogService, HolidayService],
})
export class CreateUpdateHoliday implements OnInit, OnDestroy {
  holiday: HolidayDto = {};
  submitted: boolean = false;
  holidayForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private holidayService = inject(HolidayService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  categoryOptions = [
    { label: 'Public Holiday', value: 'Public Holiday' },
    { label: 'Religious Holiday', value: 'Religious Holiday' },
    { label: 'Bank Holiday', value: 'Bank Holiday' },
    { label: 'Optional Holiday', value: 'Optional Holiday' },
  ];

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.holidayForm = this.fb.group({
      HolidayId: [''],
      HolidayName: ['', Validators.required ],
      Description: [''],
      Category: [[], Validators.required],
      Date: [''],
    });

    //edit holiday if requested by the row click
    if (this.config.data != null) {
      this.editHoliday(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.holidayForm.invalid) {
      Object.keys(this.holidayForm.controls).forEach((key) => {
        const control = this.holidayForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const holiday = this.holidayForm.value;

    if (holiday.HolidayId) {
      this.holidayService
        .updateHoliday(holiday)
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
                detail: `Holiday Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Holiday.`,
              life: 3000,
            });
          }
        );
    } else {
      this.holidayService
        .createHoliday(holiday)
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
                detail: `Holiday Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Holiday.`,
              life: 3000,
            });
          }
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.holidayForm.value);
    this.holidayForm.reset();
    this.submitted = false;
    this.holiday = {};
  }

  //edit holiday
  editHoliday(holiday: HolidayDto) {
    this.holiday = { ...holiday };

    this.holidayForm.patchValue({ ...holiday });

    this.holidayForm.patchValue({
      Date: holiday.Date
        ? new Date(holiday.Date).toLocaleDateString('en-US')
        : '',
    });
  }
}
