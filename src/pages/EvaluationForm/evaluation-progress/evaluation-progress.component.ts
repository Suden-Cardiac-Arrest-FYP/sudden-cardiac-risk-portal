import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { filter, takeUntil, Subject } from 'rxjs';
import { roleConfig } from '../../../app/access-control/roleConfig';

@Component({
  selector: 'app-evaluation-progress',
  standalone: true,
  imports: [CommonModule, ToastModule, TabViewModule, RouterModule],
  templateUrl: './evaluation-progress.component.html',
  styleUrl: './evaluation-progress.component.scss',
})
export class EvaluationProgressComponent implements OnInit, OnDestroy {
  activeTabIndex = 0;
  evaluationFormId: string = '';
  employeeId: string = '';
  employeeName: string = '';
  canUpdate: boolean = true;
  canDelete: boolean = true;
  private destroy$ = new Subject<void>();
  private tabRoutes = ['self', 'hod', 'gm', 'ceo', 'final'];

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.evaluationFormId = params['evaluationFormId'] || '';
      this.employeeId = params['employeeId'] || '';
      this.employeeName = params['employeeName'] || '';
    });

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
    if (
      currentUrl === '/evaluationprogress' ||
      currentUrl.endsWith('/evaluationprogress')
    ) {
      this.router.navigate(['self'], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'preserve',
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
        queryParamsHandling: 'preserve',
      })
      .then(() => {
        setTimeout(() => {
          this.updateActiveTabFromRoute();
        }, 100);
      });
  }

  private updateActiveTabFromRoute(): void {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/evaluationprogress/self')) {
      this.activeTabIndex = 0;
    } else if (currentUrl.includes('/evaluationprogress/hod')) {
      this.activeTabIndex = 1;
    } else if (currentUrl.includes('/evaluationprogress/gm')) {
      this.activeTabIndex = 2;
    } else if (currentUrl.includes('/evaluationprogress/ceo')) {
      this.activeTabIndex = 3;
    } else if (currentUrl.includes('/evaluationprogress/final')) {
      this.activeTabIndex = 4;
    } else {
      this.activeTabIndex = 0;
    }
  }

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
}
