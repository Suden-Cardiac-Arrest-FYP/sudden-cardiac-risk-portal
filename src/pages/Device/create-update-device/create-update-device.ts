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
import { SelectButton } from 'primeng/selectbutton';
import { Checkbox } from 'primeng/checkbox';

import { IDevice, DeviceDto } from '../../../dto/Device.dto';
import { DeviceService } from '../../../services/Device.service';

interface StatusOption {
  label: string;
  value: boolean;
}

@Component({
  selector: 'app-create-update-device',
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
    Select,
  ],
  templateUrl: './create-update-device.html',
  styleUrl: './create-update-device.scss',
  providers: [ConfirmationService, DialogService, DeviceService],
})
export class CreateUpdateDevice implements OnInit, OnDestroy {
  device: DeviceDto = {};
  submitted: boolean = false;
  deviceForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  statusOptions: StatusOption[] = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  private destroy$ = new Subject<void>();
  private deviceService = inject(DeviceService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.deviceForm = this.fb.group({
      DeviceId: [''],
      Ip: ['', Validators.required],
      Port: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      Location: ['', Validators.required],
      Status: [true, Validators.required], // Default to true (Active)
    });

    //edit device if requested by the row click
    if (this.config.data != null) {
      this.editDevice(this.config.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.submitted = true;

    if (this.deviceForm.invalid) {
      Object.keys(this.deviceForm.controls).forEach((key) => {
        const control = this.deviceForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    this.isLoading = true;

    // Get form values and ensure proper data types
    const formValues = this.deviceForm.value;
    const device: IDevice = {
      DeviceId: formValues.DeviceId,
      Ip: formValues.Ip,
      Port: parseFloat(formValues.Port), // Convert to number for backend
      Location: formValues.Location,
      Status: Boolean(formValues.Status), // Ensure it's a boolean
    };

    if (device.DeviceId) {
      this.deviceService
        .updateDevice(device)
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
                detail: `Device Updated Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Update Device.`,
              life: 3000,
            });
          },
        );
    } else {
      // Remove DeviceId for create operation
      delete device.DeviceId;
      
      this.deviceService
        .createDevice(device)
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
                detail: `Device Created Successfully.`,
                life: 3000,
              });
            }
            this.CloseInstances();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: `Failed To Create Device.`,
              life: 3000,
            });
          },
        );
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.deviceForm.value);
    this.deviceForm.reset();
    this.submitted = false;
    this.device = {};
  }

  //edit device
  editDevice(device: DeviceDto) {
    this.device = { ...device };

    this.deviceForm.patchValue({
      DeviceId: device.DeviceId,
      Ip: device.Ip,
      Port: device.Port?.toString(), // Convert to string for form display
      Location: device.Location,
      Status: device.Status, // Should already be boolean
    });
  }
}