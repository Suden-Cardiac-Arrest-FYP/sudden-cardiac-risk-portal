import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { LeaveDto, ILeave, LeaveResponse } from '../dto/Leave.dto';
import { EmployeeResponse } from '../dto/Employee.dto';

type EntityResponseType = HttpResponse<LeaveDto>;
type EntityArrayResponseType = HttpResponse<LeaveDto[]>;

// @ts-ignore
@Injectable()
export class LeaveService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createLeave(leave: ILeave): Observable<HttpResponse<LeaveDto>> {
    return this.http.post<LeaveDto>(
      `${this.resourceUrl}/gateway/employee-app2014/create/leave`,
      leave,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/employee-app2014/upload/leave`,
      formData,
      { observe: 'response' },
    );
  }

  updateLeave(leave: ILeave): Observable<HttpResponse<LeaveDto>> {
    return this.http.put<LeaveDto>(
      `${this.resourceUrl}/gateway/employee-app2014/update/leave`,
      leave,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteLeave(req?: any): Observable<HttpResponse<ILeave>> {
    return this.http.delete<LeaveDto>(
      `${this.resourceUrl}/gateway/employee-app2014/delete/leave`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findLeave(req?: any): Observable<HttpResponse<ILeave>> {
    return this.http.get<LeaveDto>(
      `${this.resourceUrl}/gateway/employee-app2014/find/leave`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

findAllLeave(params: any): Observable<HttpResponse<LeaveResponse>> {
  let url = `${this.resourceUrl}/gateway/employee-app2014/findall/leave`;

  if (params?.employeeId) {
    url = `${this.resourceUrl}/gateway/employee-app2014/findallleave/employeeid`;
  } else if (params?.HodId) {
    url = `${this.resourceUrl}/gateway/employee-app2014/findallleave/hodid`;
  }

  return this.http.get<LeaveResponse>(url, {
    params,
    observe: 'response',
    headers: this.headers,
  });
}


  findAllEmployee(params: any): Observable<HttpResponse<EmployeeResponse>> {
    return this.http.get<EmployeeResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/employee`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllLeaveCount(params: any): Observable<HttpResponse<LeaveResponse>> {
    return this.http.get<LeaveResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/LeaveCount`,
      { params, observe: 'response', headers: this.headers },
    );
  }
  
  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/employee-app2014/download/leave`,
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
