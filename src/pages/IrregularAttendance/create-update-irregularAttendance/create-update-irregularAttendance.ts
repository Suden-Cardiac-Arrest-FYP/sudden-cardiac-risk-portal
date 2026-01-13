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



import {
  IIrregularAttendance,
  IrregularAttendanceDto,
} from '../../../dto/IrregularAttendance.dto';
import { IrregularAttendanceService } from '../../../services/IrregularAttendance.service';

@Component({
  selector: 'app-create-update-irregularAttendance',
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
  templateUrl: './create-update-irregularAttendance.html',
  styleUrl: './create-update-irregularAttendance.scss',
  providers: [ConfirmationService, DialogService, IrregularAttendanceService],
})
export class CreateUpdateIrregularAttendance implements OnInit, OnDestroy {
  irregularAttendance: IrregularAttendanceDto = {};
  submitted: boolean = false;
  irregularAttendanceForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private irregularAttendanceService = inject(IrregularAttendanceService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.irregularAttendanceForm = this.fb.group({
      IrregularAttendanceId: [''],
      Date: [''],
      Reason: [''],
    });

    //edit irregularAttendance if requested by the row click
    if (this.config.data != null) {
      this.editIrregularAttendance(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.irregularAttendanceForm.invalid) {
      Object.keys(this.irregularAttendanceForm.controls).forEach((key) => {
        const control = this.irregularAttendanceForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const irregularAttendance = this.irregularAttendanceForm.value;

    if (irregularAttendance.IrregularAttendanceId) {
      this.irregularAttendanceService
        .updateIrregularAttendance(irregularAttendance)
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
                detail: `IrregularAttendance Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update IrregularAttendance.`,
              life: 3000,
            });
          },
        );
    } else {
      this.irregularAttendanceService
        .createIrregularAttendance(irregularAttendance)
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
                detail: `IrregularAttendance Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create IrregularAttendance.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.irregularAttendanceForm.value);
    this.irregularAttendanceForm.reset();
    this.submitted = false;
    this.irregularAttendance = {};
  }

  //edit irregularAttendance
  editIrregularAttendance(irregularAttendance: IrregularAttendanceDto) {
    this.irregularAttendance = { ...irregularAttendance };

    this.irregularAttendanceForm.patchValue({ ...irregularAttendance });

    this.irregularAttendanceForm.patchValue({
      Date: irregularAttendance.Date
        ? new Date(irregularAttendance.Date).toLocaleDateString('en-US')
        : '',
    });
  }
}