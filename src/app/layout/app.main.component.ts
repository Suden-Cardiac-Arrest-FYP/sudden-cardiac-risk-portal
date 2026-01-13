import { Component, HostListener, inject, OnInit } from '@angular/core';
import { AppConfigService } from '../../services/appconfigservice';
import { MainsectionComponent } from './sidebar/sidebar.component';
import { AppConfiguratorComponent } from './configurator/app.configurator.component';
import { RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NotificationComponent } from "./notification/notification.component";


@Component({
    selector: 'app-main',
    imports: [CommonModule, MainsectionComponent, AppConfiguratorComponent, RouterOutlet, DrawerModule, ButtonModule, ToastModule, NotificationComponent, ToastModule],
    templateUrl: './app.main.component.html',
    animations: [
        trigger('sidebarSlide', [
            state('void', style({ transform: 'translateX(-100%)', opacity: 0 })), // Hidden
            state('*', style({ transform: 'translateX(0)', opacity: 1 })), // Visible
            transition('void => *', [animate('200ms ease-out')]), // Slide in
            transition('* => void', [animate('200ms ease-in')]), // Slide out
        ]),
    ]
})
export class AppmainComponent implements OnInit {

  visible: boolean = false;
  notificationDrawer: boolean = false;
  appConfigService = inject(AppConfigService);
  sideBarVisibility: boolean = false;
  isSlimMenu: boolean = false;



  ngOnInit(): void {
    this.updateSlimMenu(window.innerWidth);
  }


  LayoutClick(event: Event, isNotLayout?: boolean) {
    if (isNotLayout) {
        this.appConfigService.showSidebar();
        event.stopImmediatePropagation();
        return;
    }

    if (this.isSlimMenu) {
        this.appConfigService.toggleSidebar();
    }
}

  onNotificationVisibilityChange(isVisible: boolean): void {
    this.notificationDrawer = isVisible;
  }


  get landingClass() {
    return {
      'layout-dark': this.isDarkMode,
      'layout-light': !this.isDarkMode,
    };
  }

  get isDarkMode() {
    return this.appConfigService.appState().darkTheme;
  }

  private updateSlimMenu(width: number): void {
    if (width < 768){
      this.isSlimMenu = true
      this.sideBarVisibility = false
    } else {
      this.isSlimMenu = false
      this.sideBarVisibility = true
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateSlimMenu(window.innerWidth);
  }

}
