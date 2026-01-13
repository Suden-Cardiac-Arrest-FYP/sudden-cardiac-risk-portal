import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ShiftDto, IShift, ShiftResponse } from '../dto/Shift.dto';

type EntityResponseType = HttpResponse<ShiftDto>;
type EntityArrayResponseType = HttpResponse<ShiftDto[]>;

// @ts-ignore
@Injectable()
export class ShiftService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createShift(shift: IShift): Observable<HttpResponse<ShiftDto>> {
    return this.http.post<ShiftDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/create/shift`,
      shift,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/attendance-app2013/upload/shift`,
      formData,
      { observe: 'response' },
    );
  }

  updateShift(shift: IShift): Observable<HttpResponse<ShiftDto>> {
    return this.http.put<ShiftDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/update/shift`,
      shift,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteShift(req?: any): Observable<HttpResponse<IShift>> {
    return this.http.delete<ShiftDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/delete/shift`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findShift(req?: any): Observable<HttpResponse<IShift>> {
    return this.http.get<ShiftDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/find/shift`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllShift(params: any): Observable<HttpResponse<ShiftResponse>> {
    return this.http.get<ShiftResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/shift`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/attendance-app2013/download/shift`,
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
