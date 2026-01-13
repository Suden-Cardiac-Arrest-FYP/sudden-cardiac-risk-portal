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

import {
  ICoveringRequest,
  CoveringRequestDto,
  CoveringRequestResponse,
} from '../../dto/CoveringRequest.dto';
import { CoveringRequestService } from '../../services/CoveringRequest.service';
import { CreateUpdateCoveringRequest } from './create-update-coveringRequest/create-update-coveringRequest';
import { roleConfig } from '../../app/access-control/roleConfig';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AuthService, User } from '@auth0/auth0-angular';

// Define tab types
type TabType = 'my-requests' | 'assigned-to-me' | 'completed';

@Component({
  standalone: true,
  selector: 'app-CoveringRequest',
  imports: [
    CommonModule,
    ToastModule,
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
    Select,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './CoveringRequest.component.html',
  host: {
    class: 'block w-full h-full overflow-hidden',
  },
  styleUrl: './CoveringRequest.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    CoveringRequestService,
  ],
})
export class CoveringRequestComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  searchSubject = new Subject<string>();
  first = 0;
  rows = 10;
  page = 1;
  totalRecords = 0;
  searchQuery = '';
  selectedRows: any = [];
  @ViewChild('dt') dt!: Table;
  CoveringRequestData: CoveringRequestDto[] = [];
  isDataLoading: boolean = false;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleConfig = roleConfig;

  userRole: string | undefined = '';
  EmployeeId: string | undefined = '';
  HodId: string | undefined = '';

  user: User | undefined = {};

  // Tab management
  activeTab: TabType = 'my-requests';
  tabCounts: Record<TabType, number> = {
    'my-requests': 0,
    'assigned-to-me': 0,
    'completed': 0,
  };

  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  dtoName: string | undefined = 'CoveringRequest';
  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private coveringRequestService = inject(CoveringRequestService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.userRole = this.user?.['user_metadata']['role'];

        if (this.user?.['user_metadata']['employeeId'] !== undefined) {
          this.EmployeeId = this.user?.['user_metadata']['employeeId'];
        }

        if (this.user?.['user_metadata']['employeeId'] !== undefined) {
          this.HodId = this.user?.['user_metadata']['employeeId'];
        }

        localStorage.setItem('roleName', this.userRole || '');

        // Set default tab based on role
        if (this.userRole === 'HOD') {
          this.activeTab = 'my-requests';
        }

        // Initialize component after user data is loaded
        this.initializeComponent();
      } else {
        this.userRole = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
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
        this.loadDataForActiveTab();
      });
  }

  /**
   * Sets the active tab and loads corresponding data
   */
  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
    this.first = 0;
    this.page = 1;
    this.loadDataForActiveTab();
  }

  /**
   * Gets CSS classes for tab buttons
   */
  getTabClasses(tab: TabType): string {
    const baseClasses = 'relative inline-flex items-center';
    if (this.activeTab === tab) {
      return `${baseClasses} border-b-2 border-blue-500 text-blue-600 dark:text-blue-400`;
    }
    return `${baseClasses} border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600`;
  }

  /**
   * Gets the label for the active tab
   */
  getActiveTabLabel(): string {
    switch (this.activeTab) {
      case 'my-requests':
        return 'My Requests';
      case 'assigned-to-me':
        return 'Assigned to Me';
      case 'completed':
        return 'Completed Requests';
      default:
        return 'Requests';
    }
  }

  /**
   * Gets count for a specific tab
   */
  getTabCount(tab: TabType): number {
    return this.tabCounts[tab] || 0;
  }

  /**
   * Loads data based on the active tab
   */
  loadDataForActiveTab(): void {
    switch (this.activeTab) {
      case 'my-requests':
        this.findMyRequests();
        break;
      case 'assigned-to-me':
        this.findAssignedToMe();
        break;
      case 'completed':
        this.findCompletedRequests();
        break;
      default:
        this.findMyRequests();
    }
  }

  /**
   * Fetches requests created by the current user
   */
  
  findMyRequests(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
      requesterId: this.EmployeeId || '',
      hodId: this.EmployeeId || '',
      RoleName: this.userRole || '',
    };

    this.coveringRequestService
      .findAllMyCoveringRequest(params)
      .pipe(
        filter((res: HttpResponse<CoveringRequestResponse>) => res.ok),
        map((res: HttpResponse<CoveringRequestResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: CoveringRequestResponse | null) => {
          if (res != null) {
            this.CoveringRequestData = res.CoveringRequest || [];
            this.totalRecords = res.Count || 0;
            this.tabCounts['my-requests'] = res.Count || 0;
          } else {
            this.CoveringRequestData = [];
            this.totalRecords = 0;
            this.tabCounts['my-requests'] = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.showErrorMessage(
            'Failed to load my requests. Please try again.'
          );
          this.isDataLoading = false;
          console.error('Error loading my requests:', res);
        },
      });
  }

  /**
   * Fetches requests assigned to the current user as covering person
   */
  findAssignedToMe(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
      coveringPersonId: this.EmployeeId || this.user?.sub || '',
    };

    this.coveringRequestService
      .findAllMyCoveringRequestAssignedToMe(params)
      .pipe(
        filter((res: HttpResponse<CoveringRequestResponse>) => res.ok),
        map((res: HttpResponse<CoveringRequestResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: CoveringRequestResponse | null) => {
          if (res != null) {
            this.CoveringRequestData = res.CoveringRequest || [];
            this.totalRecords = res.Count || 0;
            this.tabCounts['assigned-to-me'] = res.Count || 0;
          } else {
            this.CoveringRequestData = [];
            this.totalRecords = 0;
            this.tabCounts['assigned-to-me'] = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.showErrorMessage(
            'Failed to load assigned requests. Please try again.'
          );
          this.isDataLoading = false;
          console.error('Error loading assigned requests:', res);
        },
      });
  }

  /**
   * Fetches completed requests (HOD approved)
   */
  findCompletedRequests(): void {
    this.isDataLoading = true;
    const params = {
      page: this.page.toString(),
      size: this.rows.toString(),
      searchTerm: this.searchQuery,
      hodStatus: 'Approved',
      coveringPersonId: this.EmployeeId || '',
    };

    this.coveringRequestService
      .findAllMyCoveringRequestCompletedRequests(params)
      .pipe(
        filter((res: HttpResponse<CoveringRequestResponse>) => res.ok),
        map((res: HttpResponse<CoveringRequestResponse>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: CoveringRequestResponse | null) => {
          if (res != null) {
            this.CoveringRequestData = res.CoveringRequest || [];
            this.totalRecords = res.Count || 0;
            this.tabCounts['completed'] = res.Count || 0;
          } else {
            this.CoveringRequestData = [];
            this.totalRecords = 0;
            this.tabCounts['completed'] = 0;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.showErrorMessage(
            'Failed to load completed requests. Please try again.'
          );
          this.isDataLoading = false;
          console.error('Error loading completed requests:', res);
        },
      });
  }

  /**
   * Checks if user can update covering person status
   */
  canUpdateCPStatus(request: CoveringRequestDto): boolean {
    // Only the assigned covering person can update their status
    // and only when status is pending
    return (
      request.Status === 'Pending' &&
      (request.CoveringPersonId === this.EmployeeId ||
        request.CoveringPersonId === this.user?.sub) &&
      this.activeTab === 'assigned-to-me'
    );
  }

  
  /**
   * Updates HOD status for a covering request
   */
  onHODStatusChange(
    coveringRequest: CoveringRequestDto,
    newStatus: string
  ): void {
    if (!coveringRequest.CoveringRequestId || !this.userRole) {
      this.showErrorMessage('Missing required information to update status.');
      return;
    }

    if (this.userRole === 'Employee') {
      this.showWarningMessage(
        'You do not have permission to update HOD status.'
      );
      return;
    }

    const params = {
      CoveringRequestId: coveringRequest.CoveringRequestId,
      status: newStatus,
      HodId: this.user?.sub || '',
    };

    this.coveringRequestService
      .updateHODStatus(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          coveringRequest.HODStatus = newStatus;

          if (newStatus === 'Approved' || newStatus === 'Rejected') {
            coveringRequest.HODApprovedDate = new Date().toISOString();
          }

          this.showSuccessMessage(
            `HOD status updated to ${newStatus} successfully.`
          );
    this.initializeComponent();
        },
        error: (error) => {
          this.showErrorMessage(
            'Failed to update HOD status. Please try again.'
          );
          console.error('Error updating HOD status:', error);
        },
      });
  }

  /**
   * Updates covering person status for a covering request
   */
  onCPStatusChange(
    coveringRequest: CoveringRequestDto,
    newStatus: string
  ): void {
    if (!coveringRequest.CoveringRequestId || !this.userRole) {
      this.showErrorMessage('Missing required information to update status.');
      return;
    }

    if (
      coveringRequest.Status !== 'Pending' &&
      newStatus !== coveringRequest.Status
    ) {
      this.showWarningMessage(
        'Status can only be changed when it is in Pending state.'
      );
      return;
    }

    const params = {
      CoveringRequestId: coveringRequest.CoveringRequestId,
      status: newStatus,
      LeaveId: coveringRequest.LeaveId || '',
      CoveringPersonId: coveringRequest.CoveringPersonId || '',
    };

    this.coveringRequestService
      .updateCoveringPersonStatus(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          coveringRequest.Status = newStatus;

          this.showSuccessMessage(
            `Status updated to ${newStatus} successfully.`
          );
        this.initializeComponent();
        },
        error: (error) => {
          this.showErrorMessage('Failed to update status. Please try again.');
          console.error('Error updating covering person status:', error);
        },
      });
  }

  /**
   * Shows create covering request dialog
   */
  showCreateCoveringRequestDialog(): void {
    const ref = this.dialogService.open(CreateUpdateCoveringRequest, {
      header: 'Create New Covering Request',
      width: '50%',
      closable: true,
      modal: true,
      styleClass: 'create-covering-request-dialog',
    });

    ref.onClose.subscribe((result) => {
      if (result) {
       this.initializeComponent();
        this.showSuccessMessage('Covering request created successfully.');
      }
    });
  }

  /**
   * Shows edit covering request dialog
   */
  showEditCoveringRequestDialog(coveringRequest: CoveringRequestDto): void {
    const ref = this.dialogService.open(CreateUpdateCoveringRequest, {
      data: coveringRequest,
      header: 'Update Covering Request',
      width: '50%',
      closable: true,
      modal: true,
      styleClass: 'edit-covering-request-dialog',
    });

    ref.onClose.subscribe((result) => {
      if (result) {
       this.initializeComponent();
        this.showSuccessMessage('Covering request updated successfully.');
      }
    });
  }

  /**
   * Views request details (placeholder for future implementation)
   */
  viewRequestDetails(coveringRequest: CoveringRequestDto): void {
    // Implementation for viewing detailed information
    // Could open a side panel or modal with full request details
    console.log('Viewing details for request:', coveringRequest);
  }

  /**
   * Deletes a covering request
   */
  deleteCoveringRequest(coveringRequest: CoveringRequestDto): void {
    this.confirmationService.confirm({
      header: 'Delete Covering Request',
      message: `Are you sure you want to delete this covering request? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.confirmDeleteCoveringRequest(coveringRequest);
      },
    });
  }

  /**
   * Confirms and executes the delete operation
   */
  private confirmDeleteCoveringRequest(
    coveringRequest: CoveringRequestDto
  ): void {
    this.coveringRequestService
      .deleteCoveringRequest({
        coveringRequestId: coveringRequest.CoveringRequestId,
      })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.CoveringRequestData = this.CoveringRequestData.filter(
            (val) => val.CoveringRequestId !== coveringRequest.CoveringRequestId
          );
          this.showSuccessMessage('Covering request deleted successfully.');
          this.initializeComponent();
        },
        error: (error) => {
          this.showErrorMessage(
            'Failed to delete covering request. Please try again.'
          );
          console.error('Error deleting covering request:', error);
        },
      });
  }

  /**
   * Checks if user has access to perform specific action
   */
  hasAccess(dtoId: string, accessType: string): boolean {
    const roleName = localStorage.getItem('roleName');
    if (roleName !== null) {
      const rolePermissions = roleConfig[roleName];
      if (rolePermissions && rolePermissions[dtoId]) {
        if (rolePermissions[dtoId]?.includes(accessType)) {
          return true;
        } else {
          if (accessType == 'DELETE') {
            this.canDelete = false;
          }
          if (accessType == 'UPDATE') {
            this.canUpdate = false;
          }
        }
      }
    }
    return false;
  }

  /**
   * Reloads the component state
   */
  reloadState(): void {
    this.page = 1;
    this.first = 0;
    this.searchQuery = '';
    this.selectedRows = [];
    this.initializeComponent();
    this.showInfoMessage('Data refreshed successfully.');
  }

  /**
   * Handles global filter input
   */
  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  /**
   * Clears the search query
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  /**
   * Navigates to next page
   */
  next(): void {
    if (!this.isLastPage()) {
      this.page++;
      this.first = (this.page - 1) * this.rows;
     this.initializeComponent();
    }
  }

  /**
   * Navigates to previous page
   */
  prev(): void {
    if (!this.isFirstPage()) {
      this.page--;
      this.first = (this.page - 1) * this.rows;
      this.initializeComponent();
    }
  }

  /**
   * Checks if current page is the last page
   */
  isLastPage(): boolean {
    return this.totalRecords
      ? this.first + this.rows >= this.totalRecords
      : true;
  }

  /**
   * Checks if current page is the first page
   */
  isFirstPage(): boolean {
    return this.page === 1;
  }

  /**
   * Gets current page number
   */
  get currentPage(): number {
    return this.page;
  }

  /**
   * Gets total number of pages
   */
  get totalPages(): number {
    return this.totalRecords ? Math.ceil(this.totalRecords / this.rows) : 0;
  }

  /**
   * Gets count of pending requests
   */
  getPendingCount(): number {
    return this.CoveringRequestData.filter(
      (request) =>
        request.Status === 'Pending' || request.HODStatus === 'Pending'
    ).length;
  }

  /**
   * Gets display range for pagination
   */
  getDisplayRange(): string {
    const start = this.first + 1;
    const end = Math.min(this.first + this.rows, this.totalRecords);
    return `${start}-${end}`;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByRequestId(index: number, item: CoveringRequestDto): string {
    return item.CoveringRequestId || index.toString();
  }

  /**
   * Helper methods for showing different types of messages
   */
  private showSuccessMessage(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 4000,
    });
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 6000,
    });
  }

  private showWarningMessage(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
      life: 5000,
    });
  }

  private showInfoMessage(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Information',
      detail: message,
      life: 3000,
    });
  }

  /**
   * Gets status badge class based on status value
   */
  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  /**
   * Gets priority badge class based on urgency
   */
  getPriorityBadgeClass(isUrgent: boolean): string {
    return isUrgent
      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  }

  /**
   * Formats date for display
   */
  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Exports data to CSV (placeholder for future implementation)
   */
  exportToCSV(): void {
    // Implementation for CSV export
    console.log('Exporting to CSV...');
  }

  /**
   * Bulk operations for selected rows (placeholder for future implementation)
   */
  bulkApprove(): void {
    if (this.selectedRows.length === 0) {
      this.showWarningMessage('Please select requests to approve.');
      return;
    }
    // Implementation for bulk approve
    console.log('Bulk approving selected requests...');
  }

  bulkReject(): void {
    if (this.selectedRows.length === 0) {
      this.showWarningMessage('Please select requests to reject.');
      return;
    }
    // Implementation for bulk reject
    console.log('Bulk rejecting selected requests...');
  }

  /**
   * Checks if user can update HOD status
   */
  canUpdateHODStatus(request: CoveringRequestDto): boolean {
    // Only HOD can update HOD status
    // HOD status can only be updated when CP status is approved
    // and HOD status is pending
    return (
      (this.userRole === 'HOD' || this.userRole === 'Super-Admin') && 
      request.Status === 'Approved' &&
      request.HODStatus === 'Pending'
    );
  }

  /**
   * Loads all tab counts for badge display
   */
  loadAllTabCounts(): void {
    // Load counts for all tabs to display in badges
    if (this.userRole === 'Employee') {
      this.loadTabCount('my-requests');
      this.loadTabCount('assigned-to-me');
      this.loadTabCount('completed');
    } else if (this.userRole === 'HOD') {
      this.loadTabCount('my-requests');
    }
  }

  /**
   * Loads count for a specific tab
   */
  private loadTabCount(tab: TabType): void {
    let params: any = {
      page: '1',
      size: '1',
      searchTerm: '',
    };

    switch (tab) {
      case 'my-requests':
        params.requesterId = this.EmployeeId || this.user?.sub || '';
        this.coveringRequestService.findAllCoveringRequest(params).subscribe((res) => {
          if (res.ok && res.body) {
            this.tabCounts['my-requests'] = res.body.Count || 0;
          }
        });
        break;
      case 'assigned-to-me':
        params.coveringPersonId = this.EmployeeId || this.user?.sub || '';
        this.coveringRequestService.findAllMyCoveringRequestAssignedToMe(params).subscribe((res) => {
          if (res.ok && res.body) {
            this.tabCounts['assigned-to-me'] = res.body.Count || 0;
          }
        });
        break;
      case 'completed':
        params.hodStatus = 'Approved';
        params.requesterId = this.EmployeeId || this.user?.sub || '';
        this.coveringRequestService.findAllMyCoveringRequestCompletedRequests(params).subscribe((res) => {
          if (res.ok && res.body) {
            this.tabCounts['completed'] = res.body.Count || 0;
          }
        });
        break;
    }
  }

  /**
   * Initialize component after user data is loaded
   */
  private initializeComponent(): void {
    this.loadDataForActiveTab();
    this.loadAllTabCounts();
    this.setupSearchDebounce();
  }

  
}