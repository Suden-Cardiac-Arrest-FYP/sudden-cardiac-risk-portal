import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  IrregularAttendanceDto,
  IIrregularAttendance,
  IrregularAttendanceResponse,
} from '../dto/IrregularAttendance.dto';
import { IrregularAttendanceSummary, Time } from '../dto/IrregularAttendance-Payroll.dto';

type EntityResponseType = HttpResponse<IrregularAttendanceDto>;
type EntityArrayResponseType = HttpResponse<IrregularAttendanceDto[]>;

// @ts-ignore
@Injectable()
export class IrregularAttendanceService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createIrregularAttendance(
    irregularattendance: IIrregularAttendance
  ): Observable<HttpResponse<IrregularAttendanceDto>> {
    return this.http.post<IrregularAttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/create/irregularattendance`,
      irregularattendance,
      { observe: 'response', headers: this.headers }
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/attendance-app2013/upload/irregularattendance`,
      formData,
      { observe: 'response' }
    );
  }

  updateIrregularAttendance(
    irregularattendance: IIrregularAttendance
  ): Observable<HttpResponse<IrregularAttendanceDto>> {
    return this.http.put<IrregularAttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/update/irregularattendance`,
      irregularattendance,
      { observe: 'response', headers: this.headers }
    );
  }

  updateAttendanceTime(
    data: { time: Time[] },
    attendanceId: string
  ): Observable<HttpResponse<Time[]>> {
    const url = `${this.resourceUrl}/gateway/attendance-app2013/update/attendancetime?attendanceId=${attendanceId}`;
    return this.http.patch<Time[]>(url, data, {
      observe: 'response',
      headers: this.headers,
    });
  }

  deleteIrregularAttendance(
    req?: any
  ): Observable<HttpResponse<IIrregularAttendance>> {
    return this.http.delete<IrregularAttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/delete/irregularattendance`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findIrregularAttendance(
    req?: any
  ): Observable<HttpResponse<IIrregularAttendance>> {
    return this.http.get<IrregularAttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/find/irregularattendance`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findAllIrregularAttendance(
    params: any
  ): Observable<HttpResponse<IrregularAttendanceResponse>> {
    return this.http.get<IrregularAttendanceResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/irregularattendance`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllIrregularAttendanceByEmployeeID(
    params: any
  ): Observable<HttpResponse<IrregularAttendanceResponse>> {
    return this.http.get<IrregularAttendanceResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/irregularattendance/employeeid`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllIrregularAttendanceForReveiw(
    params: any
  ): Observable<HttpResponse<IrregularAttendanceSummary>> {
    return this.http.get<IrregularAttendanceSummary>(
      `${this.resourceUrl}/gateway/attendance-app2013/findallirregularattendancecountemployeeid`,

      { params, observe: 'response', headers: this.headers }
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/attendance-app2013/download/irregularattendance`,
      { observe: 'response', responseType: 'blob' }
    );
  }

  fileUpload(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `https://filedrop.cgaas.ai/FileMangerService/api/UploadToLocal`,
      formData,
      { observe: 'response' }
    );
  }
}
