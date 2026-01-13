import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  AttendanceDto,
  IAttendance,
  AttendanceResponse,
} from '../dto/Attendance.dto';
import { EmployeeResponse } from '../dto/Employee.dto';

type EntityResponseType = HttpResponse<AttendanceDto>;
type EntityArrayResponseType = HttpResponse<AttendanceDto[]>;

// @ts-ignore
@Injectable()
export class AttendanceService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createAttendance(
    attendance: IAttendance
  ): Observable<HttpResponse<AttendanceDto>> {
    return this.http.post<AttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/create/attendance`,
      attendance,
      { observe: 'response', headers: this.headers }
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/attendance-app2013/upload/attendance`,
      formData,
      { observe: 'response' }
    );
  }
  findAllEmployee(params: any): Observable<HttpResponse<EmployeeResponse>> {
    return this.http.get<EmployeeResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/employee`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  updateAttendance(
    attendance: IAttendance,
    attendanceId: any
  ): Observable<HttpResponse<AttendanceDto>> {
    return this.http.put<AttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/update/attendance`,
      attendance,
      {
        params: { attendanceId: attendanceId },
        observe: 'response',
        headers: this.headers,
      }
    );
  }

  deleteAttendance(req?: any): Observable<HttpResponse<IAttendance>> {
    return this.http.delete<AttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/delete/attendance`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findAttendance(req?: any): Observable<HttpResponse<IAttendance>> {
    return this.http.get<AttendanceDto>(
      `${this.resourceUrl}/gateway/attendance-app2013/find/attendance`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findAllAttendance(params: any): Observable<HttpResponse<AttendanceResponse>> {
    return this.http.get<AttendanceResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/attendance`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllAttendanceByEmployeeId(
    params: any
  ): Observable<HttpResponse<AttendanceResponse>> {
    return this.http.get<AttendanceResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/attendance/employeeid`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllAttendanceByEmployeeIdPaysheetId(
    params: any
  ): Observable<HttpResponse<AttendanceDto[]>> {
    return this.http.get<AttendanceDto[]>(
      `${this.resourceUrl}/gateway/payroll-app2017/findallattendancebyemployeeidpaysheetid`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/attendance-app2013/download/attendance`,
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
