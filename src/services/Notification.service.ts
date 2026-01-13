import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  NotificationDto,
  INotification,
  NotificationResponse,
} from '../dto/Notification.dto';
import { AppNotificationResponse } from '../dto/App_Notification.dto';

type EntityResponseType = HttpResponse<NotificationDto>;
type EntityArrayResponseType = HttpResponse<NotificationDto[]>;

// @ts-ignore
@Injectable()
export class NotificationService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createNotification(
    notification: INotification,
  ): Observable<HttpResponse<NotificationDto>> {
    return this.http.post<NotificationDto>(
      `${this.resourceUrl}/gateway/notification-app2016/create/notification`,
      notification,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/notification-app2016/upload/notification`,
      formData,
      { observe: 'response' },
    );
  }

  updateNotification(
    notification: INotification,
  ): Observable<HttpResponse<NotificationDto>> {
    return this.http.put<NotificationDto>(
      `${this.resourceUrl}/gateway/notification-app2016/update/notification`,
      notification,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteNotification(req?: any): Observable<HttpResponse<INotification>> {
    return this.http.delete<NotificationDto>(
      `${this.resourceUrl}/gateway/notification-app2016/delete/notification`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findNotification(req?: any): Observable<HttpResponse<INotification>> {
    return this.http.get<NotificationDto>(
      `${this.resourceUrl}/gateway/notification-app2016/find/notification`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllNotification(
    params: any,
  ): Observable<HttpResponse<NotificationResponse>> {
    return this.http.get<NotificationResponse>(
      `${this.resourceUrl}/gateway/notification-app2016/findall/notification`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  findAllAppNotification(
    params: any,
  ): Observable<HttpResponse<AppNotificationResponse>> {
    return this.http.get<AppNotificationResponse>(
      `${this.resourceUrl}/gateway/notification-app2016/findall/app/notification`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  PatchNotification(
    params: any,
  ): Observable<HttpResponse<NotificationDto>> {
    return this.http.patch<NotificationDto>(
      `${this.resourceUrl}/gateway/notification-app2016/patch/app/notification`,
      {},
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/notification-app2016/download/notification`,
      { observe: 'response', responseType: 'blob' },
    );
  }

  fileUpload(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `https://filedrop.cgaas.ai/FileMangerService/api/UploadToLocal`,
      formData,
      { observe: 'response' },
    );
  }
}
