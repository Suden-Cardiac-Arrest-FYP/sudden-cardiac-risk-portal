import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { EmployeeDto } from '../../../dto/Employee.dto';

@Component({
  selector: 'app-fingerprint-allocation',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './fingerprint-allocation.component.html',
})
export class FingerprintAllocationComponent implements OnInit {
  employee: EmployeeDto | null = null;

  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    if (this.config.data) {
      this.employee = this.config.data;
      console.log('Employee data:', this.employee);
    }
  }

  getMachineEmployeeId(): string | undefined {
    return this.employee?.MachineEmployeeId;
  }

  requestMachineId(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Machine ID Requested',
      detail: `Machine ID request submitted for ${
        this.employee?.Name || 'employee'
      }`,
      life: 3000,
    });

    this.closeDialog();
  }

  closeDialog(): void {
    this.ref.close();
  }
}
