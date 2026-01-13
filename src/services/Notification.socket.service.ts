import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export enum WebSocketConnectionState {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING'
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
    private socket: WebSocket | undefined;
    private notificationsSubject: Subject<any> = new Subject<any>();
    private connectionStateSubject = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
    
    private reconnectInterval: number = 5000;
    private maxReconnectAttempts: number = 10;
    private reconnectAttempts: number = 0;
    private url: string = `${environment.serverUrl}/gateway/notification-app2016/ws/notification`;
    private employeeId: string = '';
    private heartbeatInterval: any;
    private heartbeatTimeout: any;
    private readonly heartbeatIntervalMs = 60000;
    private readonly heartbeatTimeoutMs = 15000;
    
    private isManualClose = false;

    initialize(employeeId: string): void {
        if (!employeeId) {
            console.error('Employee ID is required to initialize WebSocket connection');
            return;
        }
        
        this.employeeId = employeeId;
        this.isManualClose = false;
        this.connect();
    }

    private connect(): void {
        if (!this.employeeId) {
            console.error('Cannot connect without employee ID');
            return;
        }

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            return;
        }

        this.connectionStateSubject.next(
            this.reconnectAttempts > 0 ? 
            WebSocketConnectionState.RECONNECTING : 
            WebSocketConnectionState.CONNECTING
        );

        try {
            this.socket = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }

    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.onopen = () => {
            this.connectionStateSubject.next(WebSocketConnectionState.CONNECTED);
            this.reconnectAttempts = 0;
            
            this.sendEmployeeId();
            this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            try {
                if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
                    return;
                }

                this.resetHeartbeatTimeout();
                
                const data = JSON.parse(event.data);
                this.notificationsSubject.next(data);
            } catch (error) {
                console.debug('Non-JSON WebSocket message received:', event.data);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = (event) => {
            this.connectionStateSubject.next(WebSocketConnectionState.DISCONNECTED);
            
            this.stopHeartbeat();
            
            if (!this.isManualClose) {
                this.scheduleReconnect();
            }
        };

    }

    private sendEmployeeId(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const initMessage = {
                employeeId: this.employeeId
            };
            
            try {
                this.socket.send(JSON.stringify(initMessage));
            } catch (error) {
                console.error('Failed to send employee ID:', error);
            }
        }
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.resetHeartbeatTimeout();

        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                try {
                    this.socket.send(JSON.stringify({ type: 'heartbeat' }));
                    console.debug('Sent heartbeat');
                } catch (error) {
                    console.error('Failed to send heartbeat:', error);
                }
            }
        }, this.heartbeatIntervalMs);
    }

    private resetHeartbeatTimeout(): void {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
        
        this.heartbeatTimeout = setTimeout(() => {
            console.warn('Heartbeat timeout - no message from server');
            if (this.socket && !this.isManualClose) {
                this.socket.close(1000, 'Heartbeat timeout');
            }
        }, this.heartbeatIntervalMs + this.heartbeatTimeoutMs);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    private scheduleReconnect(): void {
        if (this.isManualClose || this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
            }
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
        
        console.warn(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isManualClose) {
                this.connect();
            }
        }, delay);
    }

    disconnect(): void {
        this.isManualClose = true;
        this.stopHeartbeat();
        
        if (this.socket) {
            this.socket.close(1000, 'Manual disconnect');
            this.socket = undefined;
        }
        
        this.connectionStateSubject.next(WebSocketConnectionState.DISCONNECTED);
    }

    reconnect(): void {
        this.disconnect();
        setTimeout(() => {
            this.isManualClose = false;
            this.reconnectAttempts = 0;
            this.connect();
        }, 1000);
    }

    sendMessage(message: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(message));
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        } else {
            console.warn('Cannot send message - WebSocket not connected');
        }
    }

    get notifications$(): Observable<any> {
        return this.notificationsSubject.asObservable();
    }

    get connectionState$(): Observable<WebSocketConnectionState> {
        return this.connectionStateSubject.asObservable();
    }

    get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    ngOnDestroy(): void {
        this.disconnect();
        this.notificationsSubject.complete();
        this.connectionStateSubject.complete();
    }
}