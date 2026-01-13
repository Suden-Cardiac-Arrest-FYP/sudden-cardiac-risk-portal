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



import { ICompany, CompanyDto } from '../../../dto/Company.dto';
import { CompanyService } from '../../../services/Company.service';

@Component({
  selector: 'app-create-update-company',
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
  templateUrl: './create-update-company.html',
  styleUrl: './create-update-company.scss',
  providers: [ConfirmationService, DialogService, CompanyService],
})
export class CreateUpdateCompany implements OnInit, OnDestroy {
  company: CompanyDto = {};
  submitted: boolean = false;
  companyForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.companyForm = this.fb.group({
      Name: ['', Validators.required],
      Type: [''],
      Email: [''],
      Phone: [''],
      Address: [''],
      CompanyLogo:[''],
      NoOFEmployees: ['', Validators.required],
      BrNo: ['', Validators.required],
      EpfNumber: [''],
      CompanyId: [''],
    });

    //edit company if requested by the row click
    if (this.config.data != null) {
      this.editCompany(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.companyForm.invalid) {
      Object.keys(this.companyForm.controls).forEach((key) => {
        const control = this.companyForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const company = this.companyForm.value;

    if (company.CompanyId) {
      this.companyService
        .updateCompany(company)
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
                detail: `Company Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Company.`,
              life: 3000,
            });
          },
        );
    } else {
      this.companyService
        .createCompany(company)
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
                detail: `Company Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Company.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.companyForm.value);
    this.companyForm.reset();
    this.submitted = false;
    this.company = {};
  }

  //edit company
  editCompany(company: CompanyDto) {
    this.company = { ...company };

    this.companyForm.patchValue({ ...company });
  }
}
