import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { filter, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [ToastModule, TabViewModule, RouterModule],
  templateUrl: './attendance-page.component.html',
  styleUrl: './attendance-page.component.scss',
})
export class AttendancePageComponent implements OnInit, OnDestroy {
  activeTabIndex = 0;
  private destroy$ = new Subject<void>();
  private tabRoutes = ['attendances', 'irregular', 'devices'];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveTabFromRoute();
      });
    this.updateActiveTabFromRoute();
    if (
      this.router.url === '/attendance' ||
      this.router.url.endsWith('/attendance')
    ) {
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
    this.router.navigate([selectedRoute], {
      relativeTo: this.activatedRoute,
    });
  }

  private updateActiveTabFromRoute(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/attendance/attendances')) {
      this.activeTabIndex = 0;
    } else if (currentUrl.includes('/attendance/irregular')) {
      this.activeTabIndex = 1;
    } else if (currentUrl.includes('/attendance/devices')) {
      this.activeTabIndex = 2;
    } else {
      this.activeTabIndex = 0;
    }
  }
}
