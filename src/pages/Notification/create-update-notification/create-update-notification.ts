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



import { INotification, NotificationDto } from '../../../dto/Notification.dto';
import { NotificationService } from '../../../services/Notification.service';

@Component({
  selector: 'app-create-update-notification',
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
  templateUrl: './create-update-notification.html',
  styleUrl: './create-update-notification.scss',
  providers: [ConfirmationService, DialogService, NotificationService],
})
export class CreateUpdateNotification implements OnInit, OnDestroy {
  notification: NotificationDto = {};
  submitted: boolean = false;
  notificationForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  optionsStatus = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  private destroy$ = new Subject<void>();
  private notificationService = inject(NotificationService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.notificationForm = this.fb.group({
      NotificationId: [''],
      Title: [''],
      Message: [''],
      Status: [''],
      Recipient: [''],
      DateSent: [''],
    });

    //edit notification if requested by the row click
    if (this.config.data != null) {
      this.editNotification(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.notificationForm.invalid) {
      Object.keys(this.notificationForm.controls).forEach((key) => {
        const control = this.notificationForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    const notification = this.notificationForm.value;

    if (notification.NotificationId) {
      this.notificationService
        .updateNotification(notification)
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
                detail: `Notification Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Notification.`,
              life: 3000,
            });
          },
        );
    } else {
      this.notificationService
        .createNotification(notification)
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
                detail: `Notification Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Notification.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.notificationForm.value);
    this.notificationForm.reset();
    this.submitted = false;
    this.notification = {};
  }

  //edit notification
  editNotification(notification: NotificationDto) {
    this.notification = { ...notification };

    this.notificationForm.patchValue({ ...notification });

    this.notificationForm.patchValue({
      DateSent: notification.DateSent
        ? new Date(notification.DateSent).toLocaleDateString('en-US')
        : '',
    });
  }

  getFilledClass(fieldName: string): { [key: string]: boolean } {
    const control = this.notificationForm.get(fieldName);
    return {
      'p-inputwrapper-filled': Boolean(control?.value),
    };
  }
}
