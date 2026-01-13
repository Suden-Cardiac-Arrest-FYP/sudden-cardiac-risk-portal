import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedService } from '../services/shared.service';
import { AttendanceOrLeavesRespone, IAttendance, ILeave } from '../dto/shared.dto';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { filter, map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-remove-leave-or-attendance',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    ConfirmDialogModule
  ],
  templateUrl: './remove-leave-or-attendance.component.html',
  styleUrl: './remove-leave-or-attendance.component.scss',
  providers: [SharedService, ConfirmationService]
})
export class RemoveLeaveOrAttendanceComponent {

  private sharedService = inject(SharedService);
  private config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogRef = inject(DynamicDialogRef);
  
  isDataLoading: boolean = false;
  private destroyed$ = new Subject<void>();
  Attendances: IAttendance[] = [];
  Leave: ILeave[] = [];
  conflictDate: string = '';

  ngOnInit() {
    if (this.config.data) {
      console.log(this.config.data);
      const data = this.config.data;
      this.conflictDate = data?.Date;
      this.LoadData(data?.Date);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  LoadData(date: string): void {
    this.isDataLoading = true;

    const params = {
      date: date,
    };

    this.sharedService
      .findAttendanceAndLeaveData(params)
      .pipe(
        filter((res: HttpResponse<AttendanceOrLeavesRespone>) => res.ok),
        map((res: HttpResponse<AttendanceOrLeavesRespone>) => res.body),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (res: AttendanceOrLeavesRespone | null) => {
          if (res != null) {
            this.Leave = res.leaves || [];
            this.Attendances = res.attendances || [];
          } else {
            this.Leave = [];
            this.Attendances = [];
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: `Failed to load conflict data.`,
            life: 6000,
          });
          this.isDataLoading = false;
          console.error('Error loading conflict data:', res);
        },
      });
  }

  viewLeave(leave: ILeave): void {
    this.dialogRef.close();
    this.router.navigate(['/leave'], { 
      queryParams: { leaveId: leave.LeaveId } 
    });
  }

  viewAttendance(attendance: IAttendance): void {
    this.dialogRef.close();
    this.router.navigate(['/attendance/attendances'], { 
      queryParams: { attendanceId: attendance.AttendanceId } 
    });
  }

  deleteLeave(leave: ILeave): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the leave record for ${leave.Name}?`,
      header: 'Confirm Delete Leave',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Call your delete leave service method here
        this.performDeleteLeave(leave);
      }
    });
  }

  deleteAttendance(attendance: IAttendance): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the attendance record?`,
      header: 'Confirm Delete Attendance',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Call your delete attendance service method here
        this.performDeleteAttendance(attendance);
      }
    });
  }

  private performDeleteLeave(leave: ILeave): void {
    // Implement your delete leave logic here
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Leave record deleted successfully',
      life: 3000,
    });
    // Refresh data or close dialog
    this.dialogRef.close({ deleted: 'leave', id: leave.LeaveId });
  }

  private performDeleteAttendance(attendance: IAttendance): void {
    // Implement your delete attendance logic here
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Attendance record deleted successfully',
      life: 3000,
    });
    // Refresh data or close dialog
    this.dialogRef.close({ deleted: 'attendance', id: attendance.AttendanceId });
  }

  getLeaveStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  }

  getAttendanceStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      default: return 'info';
    }
  }
}