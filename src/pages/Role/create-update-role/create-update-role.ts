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

import { Checkbox } from 'primeng/checkbox';

import { IPermission } from '../../../dto/Role.dto';
import { PermissionCategories } from '../../../app/access-control/roleConfig';

import { IRole, RoleDto } from '../../../dto/Role.dto';
import { RoleService } from '../../../services/Role.service';

@Component({
  selector: 'app-create-update-role',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabel,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    Checkbox,
    FormsModule,
  ],
  templateUrl: './create-update-role.html',
  styleUrl: './create-update-role.scss',
  providers: [ConfirmationService, DialogService, RoleService],
})
export class CreateUpdateRole implements OnInit, OnDestroy {
  role: RoleDto = {};
  submitted: boolean = false;
  roleForm!: FormGroup;
  isLoadingClient: boolean = false;
  isLoading: boolean = false;

  rolePermissionMap: { [serviceId: string]: IPermission[] } = {};
  PermissionCategories = PermissionCategories;
  cruds: { [serviceId: string]: IPermission[] } = {};

  private destroy$ = new Subject<void>();
  private roleService = inject(RoleService);
  private messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    //set default data

    //Form Control with Validation
    this.roleForm = this.fb.group({
      RoleId: [''],
      Name: [''],
      Description: [''],
      PermissionCategories: [''],
    });

    this.PermissionCategories.forEach((category) => {
      this.cruds[category.ServiceId!] = category.Permissions || [];
    });

    //edit role if requested by the row click
    if (this.config.data != null) {
      this.editRole(this.config.data);
    } else {
      this.role.PermissionCategories = [...this.PermissionCategories];
      this.PermissionCategories.forEach((category) => {
        this.rolePermissionMap[category.ServiceId!] = [];
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.role.PermissionCategories = Object.entries(this.rolePermissionMap).map(
      ([serviceId, permissions]) => {
        const category = this.PermissionCategories.find(
          (c) => c.ServiceId === serviceId,
        );
        return {
          ServiceName: category?.ServiceName,
          ServiceId: serviceId,
          Permissions: permissions,
        };
      },
    );
    this.submitted = true;

    if (this.checkValidation()) {
      this.isLoading = true;
      if (this.role.RoleId) {
        this.roleService
          .updateRole(this.role, this.role.RoleId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Role updated successfully',
                life: 3000,
              });
              this.isLoading = false;
              this.CloseInstances();
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: `Failed to update role`,
                life: 3000,
              });
              this.isLoading = false;
            },
          );
      } else {
        this.roleService
          .createRole(this.role)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Role created successfully ',
                life: 3000,
              });
              this.isLoading = false;
              this.CloseInstances();
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: `Failed to create role`,
                life: 3000,
              });
              this.isLoading = false;
            },
          );
      }
    }
  }

  checkValidation() {
    if (this.role && this.role.Name && this.role.Description) {
      return true;
    } else {
      return false;
    }
  }

  //close dialog instances
  CloseInstances(event?: Event) {
    event?.preventDefault();
    this.ref.close(this.roleForm.value);
    this.roleForm.reset();
    this.submitted = false;
    this.role = {};
  }

  //edit role
  editRole(role: RoleDto) {
    this.role = { ...role };

    this.rolePermissionMap = {};
    this.PermissionCategories.forEach((category) => {
      const existing = role.PermissionCategories?.find(
        (p) => p.ServiceId === category.ServiceId,
      );
      this.rolePermissionMap[category.ServiceId!] =
        existing?.Permissions?.map((p) => {
          return category.Permissions?.find((cp) => cp.Key === p.Key) || p;
        }) || [];
    });

    this.roleForm.patchValue({ ...role });
  }
}
