import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HolidayDto, IHoliday, HolidayResponse } from '../dto/Holiday.dto';

type EntityResponseType = HttpResponse<HolidayDto>;
type EntityArrayResponseType = HttpResponse<HolidayDto[]>;

// @ts-ignore
@Injectable()
export class HolidayService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createHoliday(holiday: IHoliday): Observable<HttpResponse<HolidayDto>> {
    return this.http.post<HolidayDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/create/holiday`,
      holiday,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/attendance-app2013/upload/holiday`,
      formData,
      { observe: 'response' },
    );
  }

  updateHoliday(holiday: IHoliday): Observable<HttpResponse<HolidayDto>> {
    return this.http.put<HolidayDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/update/holiday`,
      holiday,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteHoliday(req?: any): Observable<HttpResponse<IHoliday>> {
    return this.http.delete<HolidayDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/delete/holiday`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findHoliday(req?: any): Observable<HttpResponse<IHoliday>> {
    return this.http.get<HolidayDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/find/holiday`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllHoliday(params: any): Observable<HttpResponse<HolidayResponse>> {
    return this.http.get<HolidayResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/holiday`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/attendance-app2013/download/holiday`,
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
