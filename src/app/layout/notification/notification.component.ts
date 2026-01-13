import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { AppNotificationDto, AppNotificationResponse } from '../../../dto/App_Notification.dto';
import { NotificationService } from '../../../services/Notification.service';
import { NotificationStateService } from '../../../services/State/Notification.state.service';
import { finalize, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { WebSocketService, WebSocketConnectionState } from '../../../services/Notification.socket.service';
import { Subject } from 'rxjs';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    imports: [CommonModule, ButtonModule, ToastModule, BadgeModule],
    providers: [NotificationStateService, NotificationService, WebSocketService]
})
export class NotificationComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('notificationContainer') notificationContainer: ElementRef | undefined;
    @Output() visibilityChange = new EventEmitter<boolean>();

    date: Date | undefined;
    notifications: AppNotificationDto[] = [];
    employeeId: string = '';

    private page = 1;
    private pageSize = 10;
    isLoading = false;
    private hasMoreData = true;
    audio = new Audio('/notification.mp3');
    private scrollListener: any;

    connectionState = WebSocketConnectionState.DISCONNECTED;
    isConnected = false;

    private destroy$ = new Subject<void>();

    private notificationStateService = inject(NotificationStateService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private authService = inject(AuthService);
    private webSocketService = inject(WebSocketService);

    ngOnInit() {
        this.authService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe((user: any) => {
                if (user?.sub) {
                    this.employeeId = user['user_metadata']["employeeId"] || user.sub;
                    this.initializeServices();
                }
            });

        this.webSocketService.connectionState$
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
                this.connectionState = state;
                this.isConnected = state === WebSocketConnectionState.CONNECTED;
            });

        this.webSocketService.notifications$
            .pipe(takeUntil(this.destroy$))
            .subscribe((notification: AppNotificationDto) => {
                this.handleNewNotification(notification);
            });
    }

    private initializeServices() {
        if (!this.employeeId) return;

        this.webSocketService.initialize(this.employeeId);

        this.loadNotifications();
    }

    private handleNewNotification(notification: AppNotificationDto) {
        this.notifications.unshift(notification);

        this.notificationStateService.incrementNotificationCount();

        this.playNotificationSound();

        this.messageService.add({
            severity: 'info',
            summary: notification.Title,
            detail: notification.Content,
            life: 5000
        });
    }

    private playNotificationSound() {
        try {
            this.audio.currentTime = 0;
            this.audio.play().catch(error => {
                console.warn('Could not play notification sound:', error);
            });
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.setupScrollListener();
        });
    }

    private setupScrollListener() {
        if (this.notificationContainer) {
            const scrollableContainer = this.notificationContainer.nativeElement;
            if (scrollableContainer) {
                this.scrollListener = this.onContainerScroll.bind(this);
                scrollableContainer.addEventListener('scroll', this.scrollListener);
            }
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.notificationContainer && this.scrollListener) {
            const scrollableContainer = this.notificationContainer.nativeElement;
            if (scrollableContainer) {
                scrollableContainer.removeEventListener('scroll', this.scrollListener);
            }
        }

        this.webSocketService.disconnect();
    }

    onContainerScroll(event: Event) {
        const target = event.target as HTMLElement;
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom && !this.isLoading && this.hasMoreData) {
            this.loadNotifications();
        }
    }

    loadNotifications() {
        if (this.isLoading || !this.hasMoreData || !this.employeeId) {
            return;
        }

        this.isLoading = true;

        this.notificationService.findAllAppNotification({
            employeeId: this.employeeId,
            page: this.page,
            size: this.pageSize
        }).pipe(
            finalize(() => this.isLoading = false),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (res: HttpResponse<AppNotificationResponse>) => {
                const body = res.body;
                if (body) {
                    const newNotifications = body.Notification;
                    this.notifications = [...this.notifications, ...newNotifications];
                    this.page++;

                    if (newNotifications.length < this.pageSize) {
                        this.hasMoreData = false;
                    }

                    if (this.page === 2) {
                        this.notificationStateService.setNotificationCount(this.notifications.length);
                    }
                } else {
                    this.hasMoreData = false;
                }
            },
            error: (error) => {
                console.error('Error loading notifications:', error);
                this.hasMoreData = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load notifications'
                });
            }
        });
    }

    onRightMenuButtonClick() {
        this.notificationStateService.resetNotificationCount();
    }

    onNotificationClick(notification: AppNotificationDto) {
        this.visibilityChange.emit(false);

        this.notificationService
            .PatchNotification({ notificationId: notification.NotificationId })
            .subscribe({
                next: () => { },
                error: err => {
                    console.error('Failed to mark notification as read', err);
                }
            });
        this.hasMoreData = true;
        this.page = 1;
        this.pageSize = 10;
        this.notifications = []
        this.loadNotifications();
        this.router.navigate([notification.Url]);
    }

    reconnectWebSocket() {
        this.webSocketService.reconnect();
    }

    get connectionStatusText(): string {
        switch (this.connectionState) {
            case WebSocketConnectionState.CONNECTED:
                return 'Connected';
            case WebSocketConnectionState.CONNECTING:
                return 'Connecting...';
            case WebSocketConnectionState.RECONNECTING:
                return 'Reconnecting...';
            case WebSocketConnectionState.DISCONNECTED:
                return 'Disconnected';
            default:
                return 'Unknown';
        }
    }
}