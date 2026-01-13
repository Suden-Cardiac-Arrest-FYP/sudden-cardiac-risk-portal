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

import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';



import { IPaySlip, PaySlipDto } from '../../../dto/PaySlip.dto';
import { PaySlipService } from '../../../services/PaySlip.service';

@Component({
  selector: 'app-create-update-paySlip',
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
  templateUrl: './create-update-paySlip.html',
  styleUrl: './create-update-paySlip.scss',
  providers: [ConfirmationService, DialogService, PaySlipService],
})
export class CreateUpdatePaySlip implements OnInit, OnDestroy {
  paySlip: PaySlipDto = {};
  submitted: boolean = false;
  paySlipForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private paySlipService = inject(PaySlipService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.paySlipForm = this.fb.group({
      PaySlipId: ['', Validators.required],
      EmployeeName: ['', Validators.required],
      EpFNumber: [''],
      Designation: [''],
      Month: ['', Validators.required],
      Year: [null, Validators.required],
      BasicSalary: [null, Validators.required],
      ConsolidatedSalary: [null],
      BRA01: [null],
      BRA02: [null],
      EmployeeId: ['', Validators.required],
      WorkingDays: [null, Validators.required],
      WorkedDays: [null, Validators.required],
      NoPayDays: [null],
      NoPayAmount: [null],
      LateMinutes: [null],
      LateMinutesDeduction: [null],
      PayCuts: [null],
      SalaryForEPF: [null],
      GrossSalary: [null],
      Epf8Percent: [null],
      StampDuty: [null],
      PayeTax: [null],
      TotalAdditions: [null],
      TotalDeductions: [null],
      NetSalary: [null],
      Etf3Percent: [null],
      Epf12Percent: [null],
      CostToTheCompany: [null],
    });

    //edit paySlip if requested by the row click
    if (this.config.data != null) {
      this.editPaySlip(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.paySlipForm.invalid) {
      Object.keys(this.paySlipForm.controls).forEach((key) => {
        const control = this.paySlipForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const paySlip = this.paySlipForm.value;

    if (paySlip.PaySlipId) {
      this.paySlipService
        .updatePaySlip(paySlip)
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
                detail: `PaySlip Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update PaySlip.`,
              life: 3000,
            });
          },
        );
    } else {
      this.paySlipService
        .createPaySlip(paySlip)
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
                detail: `PaySlip Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create PaySlip.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.paySlipForm.value);
    this.paySlipForm.reset();
    this.submitted = false;
    this.paySlip = {};
  }

  //edit paySlip
  editPaySlip(paySlip: PaySlipDto) {
    this.paySlip = { ...paySlip };

    this.paySlipForm.patchValue({ ...paySlip });
  }
}
