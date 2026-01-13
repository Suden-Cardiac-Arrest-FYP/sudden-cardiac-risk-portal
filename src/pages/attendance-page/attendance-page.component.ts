import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { filter, takeUntil, Subject } from 'rxjs';
import { roleConfig } from '../../app/access-control/roleConfig';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [CommonModule, ToastModule, TabViewModule, RouterModule],
  templateUrl: './attendance-page.component.html',
  styleUrl: './attendance-page.component.scss',
})
export class AttendancePageComponent implements OnInit, OnDestroy {
  activeTabIndex = 0;
  canUpdate: boolean = true;
  canDelete: boolean = true;
  roleName: string | null = null;

  private destroy$ = new Subject<void>();
  private tabRoutes = ['attendances', 'irregular', 'devices'];

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.roleName = localStorage.getItem('roleName');

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveTabFromRoute();
      });

    this.updateActiveTabFromRoute();
    const currentUrl = this.router.url;
    if (currentUrl === '/attendance' || currentUrl.endsWith('/attendance')) {
      this.router.navigate(['attendances'], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(event: any): void {
    const selectedRoute = this.tabRoutes[event.index];
    this.activeTabIndex = event.index;
    this.router
      .navigate([selectedRoute], {
        relativeTo: this.activatedRoute,
      })
      .then(() => {
        setTimeout(() => {
          this.updateActiveTabFromRoute();
        }, 100);
      });
  }

  private updateActiveTabFromRoute(): void {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/attendance/attendances')) {
      this.activeTabIndex = 0;
      console.log('Setting tab to Attendances (0)');
    } else if (currentUrl.includes('/attendance/irregular')) {
      this.activeTabIndex = 1;
      console.log('Setting tab to Irregular Attendances (1)');
    } else if (currentUrl.includes('/attendance/devices')) {
      this.activeTabIndex = 2;
      console.log('Setting tab to Devices (2)');
    } else {
      this.activeTabIndex = 0;
      console.log('Setting tab to default (0)');
    }
  }

  hasAccess(dtoId: string, accessType: string): boolean {
    this.roleName = localStorage.getItem('roleName');
    if (this.roleName !== null) {
      const rolePermissions = roleConfig[this.roleName];
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
}
