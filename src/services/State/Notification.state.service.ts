
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationStateService {
    private _newNotificationCount = new BehaviorSubject<number>(0);
    newNotificationCount$ = this._newNotificationCount.asObservable();

    incrementNotificationCount() {
        this._newNotificationCount.next(this._newNotificationCount.value + 1);
    }

    resetNotificationCount() {
        this._newNotificationCount.next(0);
    }

    decrementNotificationCount() {
        const currentCount = this._newNotificationCount.value;
        if (currentCount > 0) {
            this._newNotificationCount.next(currentCount - 1);
        }
    }

    setNotificationCount(count: number) {
        this._newNotificationCount.next(count);
    }
}
