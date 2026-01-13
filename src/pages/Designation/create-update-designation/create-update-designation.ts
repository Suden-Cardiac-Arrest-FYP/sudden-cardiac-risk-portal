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



import { IDesignation, DesignationDto } from '../../../dto/Designation.dto';
import { DesignationService } from '../../../services/Designation.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-create-update-designation',
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
    TextareaModule,
  ],
  templateUrl: './create-update-designation.html',
  styleUrl: './create-update-designation.scss',
  providers: [ConfirmationService, DialogService, DesignationService],
})
export class CreateUpdateDesignation implements OnInit, OnDestroy {
  designation: DesignationDto = {};
  submitted: boolean = false;
  designationForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private designationService = inject(DesignationService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.designationForm = this.fb.group({
      DesignationId: [''],
      Designation: ['', Validators.required],
      Description: [''],
      NoOfEmp: [null],
      DesignationIdOfCompany: [''],
      OrganizationId: [''],
    });

    //edit designation if requested by the row click
    if (this.config.data != null) {
      this.editDesignation(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.designationForm.invalid) {
      Object.keys(this.designationForm.controls).forEach((key) => {
        const control = this.designationForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const designation = this.designationForm.value;

    if (designation.DesignationId) {
      this.designationService
        .updateDesignation(designation)
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
                detail: `Designation Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Designation.`,
              life: 3000,
            });
          },
        );
    } else {
      this.designationService
        .createDesignation(designation)
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
                detail: `Designation Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Designation.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.designationForm.value);
    this.designationForm.reset();
    this.submitted = false;
    this.designation = {};
  }

  //edit designation
  editDesignation(designation: DesignationDto) {
    this.designation = { ...designation };

    this.designationForm.patchValue({ ...designation });
  }
}
