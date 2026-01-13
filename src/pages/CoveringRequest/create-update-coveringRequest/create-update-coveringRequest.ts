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
import { filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';



import {
  ICoveringRequest,
  CoveringRequestDto,
} from '../../../dto/CoveringRequest.dto';
import { CoveringRequestService } from '../../../services/CoveringRequest.service';

@Component({
  selector: 'app-create-update-coveringRequest',
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
  templateUrl: './create-update-coveringRequest.html',
  styleUrl: './create-update-coveringRequest.scss',
  providers: [ConfirmationService, DialogService, CoveringRequestService],
})
export class CreateUpdateCoveringRequest implements OnInit, OnDestroy {
  coveringRequest: CoveringRequestDto = {};
  submitted: boolean = false;
  coveringRequestForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  optionsProductCategory = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  private destroy$ = new Subject<void>();
  private coveringRequestService = inject(CoveringRequestService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.coveringRequestForm = this.fb.group({
      CoveringRequestId: [''],
      CustomerName: [''],
      CustomerEmail: [''],
      RequestDate: [''],
      ProductCategory: [''],
      Urgent: [null],
    });

    //edit coveringRequest if requested by the row click
    if (this.config.data != null) {
      this.editCoveringRequest(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.coveringRequestForm.invalid) {
      Object.keys(this.coveringRequestForm.controls).forEach((key) => {
        const control = this.coveringRequestForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const coveringRequest = this.coveringRequestForm.value;

    if (coveringRequest.CoveringRequestId) {
      this.coveringRequestService
        .updateCoveringRequest(coveringRequest)
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
                detail: `CoveringRequest Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update CoveringRequest.`,
              life: 3000,
            });
          },
        );
    } else {
      this.coveringRequestService
        .createCoveringRequest(coveringRequest)
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
                detail: `CoveringRequest Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create CoveringRequest.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.coveringRequestForm.value);
    this.coveringRequestForm.reset();
    this.submitted = false;
    this.coveringRequest = {};
  }

  //edit coveringRequest
  editCoveringRequest(coveringRequest: CoveringRequestDto) {
    this.coveringRequest = { ...coveringRequest };

    this.coveringRequestForm.patchValue({ ...coveringRequest });

    this.coveringRequestForm.patchValue({
      RequestDate: coveringRequest.RequestedDate
        ? new Date(coveringRequest.RequestedDate).toLocaleDateString('en-US')
        : '',
    });
  }

  getFilledClass(fieldName: string): { [key: string]: boolean } {
    const control = this.coveringRequestForm.get(fieldName);
    return {
      'p-inputwrapper-filled': Boolean(control?.value),
    };
  }
}
