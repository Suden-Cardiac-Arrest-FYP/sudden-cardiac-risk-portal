import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'primeng/popover';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  filter,
  map,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  Subject,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { getDtoNameById } from '../../app/relationships/reationshipConfig';

// Enhanced interfaces for better type safety
export interface IDaySchedule {
  dayName: string;
  startTime: string | null;
  endTime: string | null;
  isActive: boolean;
}

export interface IWeekSchedule {
  Days: IDaySchedule[];
}

export interface IShiftEnhanced {
  ShiftId?: string;
  Name: string;
  IsDefault: boolean;
  Location: string;
  Weeks: IWeekSchedule[];
}

export interface ShiftDto extends IShiftEnhanced {
  ShiftId: string;
}

export interface ShiftResponse {
  Shift: ShiftDto[];
  Count: number;
}

import { ShiftService } from '../../services/Shift.service';
import { CreateUpdateShift } from './create-update-shift/create-update-shift';
import { roleConfig } from '../../app/access-control/roleConfig';

@Component({
  standalone: true,
  selector: 'app-shift',
  imports: [
    CommonModule,
    ToastModule,
    IconField,
    InputIcon,
    ButtonModule,
    TableModule,
    TooltipModule,
    PopoverModule,
    OverlayBadgeModule,
    AvatarModule,
    DividerModule,
    InputTextModule,
    ConfirmDialog,
    Tooltip,
  ],
  templateUrl: './Shift.component.html',
  host: {
    class:
      'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6',
  },
  styleUrl: './Shift.component.scss',
  providers: [ConfirmationService, MessageService, DialogService, ShiftService],
})
export class ShiftComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;

  // Sample data - replace with your actual data
  ShiftData: ShiftDto[] = [];

  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;
  dtoName: string | undefined = 'Shift';

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private shiftService = inject(ShiftService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.findAllShift();
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.searchQuery = searchTerm;
        this.first = 0;
        this.page = 1;
        this.findAllShift();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Enhanced utility methods for display
   */

  /**
   * Format time from HH:mm:ss to HH:mm AM/PM
   */
  formatTime(time: string | null): string {
    if (!time) return '--';

    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  }

  /**
   * Calculate duration between start and end time
   */
  calculateDuration(startTime: string | null, endTime: string | null): string {
    if (!startTime || !endTime) return '--';

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      return `${diffMinutes}m`;
    } else if (diffMinutes === 0) {
      return `${diffHours}h`;
    } else {
      return `${diffHours}h ${diffMinutes}m`;
    }
  }

  /**
   * Get count of active days in a week
   */
  getActiveDaysCount(week: IWeekSchedule): number {
    return week.Days?.filter((day) => day.isActive).length || 0;
  }

  /**
   * Get count of active shifts
   */
  getActiveShiftsCount(): number {
    return this.ShiftData.filter((shift) =>
      shift.Weeks?.some((week) => week.Days?.some((day) => day.isActive))
    ).length;
  }

  /**
   * Get count of default shifts
   */
  getDefaultShiftsCount(): number {
    return this.ShiftData.filter((shift) => shift.IsDefault).length;
  }

  /**
   * Get total working hours for a shift (first week only for simplicity)
   */
  getTotalWorkingHours(shift: ShiftDto): number {
    if (!shift.Weeks || shift.Weeks.length === 0) return 0;

    let totalMinutes = 0;
    const firstWeek = shift.Weeks[0];

    firstWeek.Days?.forEach((day) => {
      if (day.isActive && day.startTime && day.endTime) {
        const start = new Date(`1970-01-01T${day.startTime}`);
        const end = new Date(`1970-01-01T${day.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        totalMinutes += diffMs / (1000 * 60);
      }
    });

    return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Fetches all Shifts with given parameters
   */
  findAllShift(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
    };
    this.shiftService
      .findAllShift(params)
      .pipe(
        filter((res: HttpResponse<any>) => res.ok),
        map((res: HttpResponse<ShiftResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: ShiftResponse | null) => {
          if (res != null) {
            this.ShiftData = res.Shift || [];
            this.totalRecords = res.Count || 0;
          } else {
            this.ShiftData = [];
            this.totalRecords = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load all shifts.',
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('Error loading shifts:', res);
        },
      });
  }

  /**
   * Dialog methods
   */
  showCreateShiftDialog() {
    this.showCreateShiftDialogDefault();
  }

  showCreateShiftDialogDefault() {
    const ref = this.dialogService.open(CreateUpdateShift, {
      header: 'Create Shift',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllShift();
    });
  }

  showEditShiftDialog(shift: ShiftDto) {
    const ref = this.dialogService.open(CreateUpdateShift, {
      data: shift,
      header: 'Update Shift',
      width: '40%',
      closable: true,
      modal: true,
    });
    ref.onClose.subscribe(() => {
      this.findAllShift();
    });
  }

  /**
   * Delete shift functionality
   */
  deleteShift(shift: ShiftDto) {
    this.confirmationService.confirm({
      header: 'Are you sure?',
      message: `Please confirm to delete shift "${shift.Name}".`,
      accept: () => {
        this.confirmDeleteShift(shift);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Shift "${shift.Name}" has been deleted.`,
          life: 3000,
        });
      },
    });
  }

  confirmDeleteShift(shift: ShiftDto) {
    this.ShiftData = this.ShiftData.filter(
      (val) => val.ShiftId !== shift.ShiftId
    );
    this.shiftService
      .deleteShift({ shiftId: shift.ShiftId })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.findAllShift(); // Refresh the list
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: `Failed to delete shift "${shift.Name}".`,
            life: 3000,
          });
          // Restore the item in case of error
          this.findAllShift();
        },
      });
  }

  /**
   * Access control
   */
  hasAccess(dtoId: string, accessType: string): boolean {
    const roleName = localStorage.getItem('roleName');
    if (roleName !== null) {
      const rolePermissions = this.roleConfig[roleName];
      if (rolePermissions && rolePermissions[dtoId]) {
        if (rolePermissions[dtoId]?.includes(accessType)) {
          return true;
        } else {
          if (accessType === 'DELETE') {
            this.canDelete = false;
          }
          if (accessType === 'UPDATE') {
            this.canUpdate = false;
          }
        }
      }
    }
    return false;
  }

  /**
   * Table navigation and filtering
   */
  reloadState() {
    this.page = 1;
    this.first = 0;
    this.searchQuery = '';
    this.isDataLoading = true;
    this.findAllShift();
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  next() {
    if (!this.isLastPage()) {
      this.page++;
      this.first = (this.page - 1) * this.rows;
      this.findAllShift();
    }
  }

  prev() {
    if (!this.isFirstPage()) {
      this.page--;
      this.first = (this.page - 1) * this.rows;
      this.findAllShift();
    }
  }

  isLastPage(): boolean {
    return this.totalRecords
      ? this.first + this.rows >= this.totalRecords
      : true;
  }

  isFirstPage(): boolean {
    return this.page === 1;
  }

  get currentPage(): number {
    return this.page;
  }

  get totalPages(): number {
    return this.totalRecords ? Math.ceil(this.totalRecords / this.rows) : 0;
  }

  /**
   * Additional utility methods for enhanced display
   */

  /**
   * Get shift status based on active days
   */
  getShiftStatus(shift: ShiftDto): 'active' | 'inactive' | 'partial' {
    if (!shift.Weeks || shift.Weeks.length === 0) return 'inactive';

    const totalDays = shift.Weeks.reduce(
      (total, week) => total + (week.Days?.length || 0),
      0
    );
    const activeDays = shift.Weeks.reduce(
      (total, week) =>
        total + (week.Days?.filter((day) => day.isActive).length || 0),
      0
    );

    if (activeDays === 0) return 'inactive';
    if (activeDays === totalDays) return 'active';
    return 'partial';
  }

  /**
   * Get the most common working time pattern
   */
  getWorkingPattern(shift: ShiftDto): string {
    if (!shift.Weeks || shift.Weeks.length === 0) return 'No pattern';

    const activeDays = shift.Weeks[0].Days?.filter((day) => day.isActive) || [];
    if (activeDays.length === 0) return 'No active days';

    const dayNames = activeDays.map((day) => day.dayName.substring(0, 3));
    return dayNames.join(', ');
  }

  /**
   * Check if shift has weekend work
   */
  hasWeekendWork(shift: ShiftDto): boolean {
    if (!shift.Weeks || shift.Weeks.length === 0) return false;

    return shift.Weeks.some((week) =>
      week.Days?.some(
        (day) =>
          (day.dayName === 'Saturday' || day.dayName === 'Sunday') &&
          day.isActive
      )
    );
  }

  /**
   * Get earliest start time across all active days
   */
  getEarliestStartTime(shift: ShiftDto): string {
    if (!shift.Weeks || shift.Weeks.length === 0) return '--';

    let earliestTime = '23:59:59';

    shift.Weeks.forEach((week) => {
      week.Days?.forEach((day) => {
        if (day.isActive && day.startTime && day.startTime < earliestTime) {
          earliestTime = day.startTime;
        }
      });
    });

    return earliestTime === '23:59:59' ? '--' : this.formatTime(earliestTime);
  }

  /**
   * Get latest end time across all active days
   */
  getLatestEndTime(shift: ShiftDto): string {
    if (!shift.Weeks || shift.Weeks.length === 0) return '--';

    let latestTime = '00:00:00';

    shift.Weeks.forEach((week) => {
      week.Days?.forEach((day) => {
        if (day.isActive && day.endTime && day.endTime > latestTime) {
          latestTime = day.endTime;
        }
      });
    });

    return latestTime === '00:00:00' ? '--' : this.formatTime(latestTime);
  }

  /**
   * Export shift data to CSV
   */
  exportToCSV() {
    if (this.ShiftData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No shift data available to export.',
        life: 3000,
      });
      return;
    }

    const csvData = this.convertToCSV(this.ShiftData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Export Successful',
      detail: 'Shift data exported to CSV successfully.',
      life: 3000,
    });
  }

  private convertToCSV(data: ShiftDto[]): string {
    const headers = [
      'Shift ID',
      'Name',
      'Is Default',
      'Location',
      'Week',
      'Day',
      'Start Time',
      'End Time',
      'Is Active',
    ];
    const csvContent = [headers.join(',')];

    data.forEach((shift) => {
      if (shift.Weeks && shift.Weeks.length > 0) {
        shift.Weeks.forEach((week, weekIndex) => {
          if (week.Days && week.Days.length > 0) {
            week.Days.forEach((day) => {
              const row = [
                shift.ShiftId,
                `"${shift.Name}"`,
                shift.IsDefault,
                `"${shift.Location || ''}"`,
                weekIndex + 1,
                day.dayName,
                day.startTime || '',
                day.endTime || '',
                day.isActive,
              ];
              csvContent.push(row.join(','));
            });
          }
        });
      } else {
        // Handle shifts without weeks data
        const row = [
          shift.ShiftId,
          `"${shift.Name}"`,
          shift.IsDefault,
          `"${shift.Location || ''}"`,
          '',
          '',
          '',
          '',
          '',
        ];
        csvContent.push(row.join(','));
      }
    });

    return csvContent.join('\n');
  }
}
