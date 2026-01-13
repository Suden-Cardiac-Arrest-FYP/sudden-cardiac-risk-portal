import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { DeviceDto, IDevice, DeviceResponse } from '../dto/Device.dto';

type EntityResponseType = HttpResponse<DeviceDto>;
type EntityArrayResponseType = HttpResponse<DeviceDto[]>;

// @ts-ignore
@Injectable()
export class DeviceService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createDevice(device: IDevice): Observable<HttpResponse<DeviceDto>> {
    return this.http.post<DeviceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/create/attendance/device`,
      device,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/attendance-app2013/upload/device`,
      formData,
      { observe: 'response' },
    );
  }

  updateDevice(device: IDevice): Observable<HttpResponse<DeviceDto>> {
    return this.http.put<DeviceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/update/attendance/device`,
      device,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteDevice(req?: any): Observable<HttpResponse<IDevice>> {
    return this.http.delete<DeviceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/delete/attendance/device`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findDevice(req?: any): Observable<HttpResponse<IDevice>> {
    return this.http.get<DeviceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/find/attendance/device`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllDevice(params: any): Observable<HttpResponse<DeviceResponse>> {
    return this.http.get<DeviceResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/attendance/device`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/attendance-app2013/download/device`,
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
