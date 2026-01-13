import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { IEmployee } from '../../dto/Employee.dto';
import { EmployeeService } from '../../services/Employee.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, ToastModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
  providers: [EmployeeService, MessageService],
})
export class MyProfileComponent {
  private destroyed$ = new Subject<void>();
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  Employee: IEmployee = {};
  isDataLoading: boolean = false;

  ngOnInit() {
      this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        if (user?.['user_metadata']['employeeId'] !== undefined) {
          const EmployeeId = user?.['user_metadata']['employeeId'];
              this.findEmployee(EmployeeId);
        }

      }

    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  findEmployee(employee:any): void {
    this.isDataLoading = true;
    const params = {
      employeeId: employee ? employee : '',
    };
    this.employeeService
      .findEmployee(params)
      .pipe(
        filter((res: HttpResponse<IEmployee>) => res.ok),
        map((res: HttpResponse<IEmployee>) => res.body),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: IEmployee | null) => {
          if (res != null) {
            this.Employee = res;
          }
          this.isDataLoading = false;
        },
        error: (res: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to load employee profile.',
            life: 6000,
          });
          this.isDataLoading = false;
          console.log('error in extracting employee', res);
        },
      });
  }

  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    const container = img.parentElement;

    if (container) {
      img.style.display = 'none';

      let placeholder = container.querySelector(
        '.image-placeholder'
      ) as HTMLElement;
      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className =
          'image-placeholder w-32 h-32 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white shadow-lg';
        placeholder.innerHTML =
          '<i class="pi pi-user text-white" style="font-size: 4rem;"></i>';
        container.appendChild(placeholder);
      }
      placeholder.style.display = 'flex';
    }
  }

  /**
   * Calculate service duration from date joined to current date
   */
  getServiceDuration(dateJoined: string): string {
    if (!dateJoined) return 'N/A';

    const joinDate = new Date(dateJoined);
    const currentDate = new Date();

    if (isNaN(joinDate.getTime())) return 'Invalid Date';

    const diffTime = Math.abs(currentDate.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      if (months > 0) {
        return `${years}y ${months}m`;
      } else {
        return `${years} year${years > 1 ? 's' : ''}`;
      }
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number | undefined): string {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get age from date of birth
   */
  getAge(dateOfBirth: string): string {
    if (!dateOfBirth) return 'N/A';

    const birthDate = new Date(dateOfBirth);
    const currentDate = new Date();

    if (isNaN(birthDate.getTime())) return 'Invalid Date';

    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return `${age} years old`;
  }

  /**
   * Download document (placeholder function)
   */
  downloadDocument(document: any): void {
    // Implement document download logic here
    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: `Downloading ${document.name || 'document'}...`,
      life: 3000,
    });
  }
}
