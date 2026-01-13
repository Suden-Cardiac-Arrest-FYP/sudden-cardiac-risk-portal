import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { EmployeeDto, IEmployee, EmployeeResponse } from '../dto/Employee.dto';
import { DepartmentResponse } from '../dto/Department.dto';
import { DesignationResponse } from '../dto/Designation.dto';
import { ShiftResponse } from '../dto/Shift.dto';

type EntityResponseType = HttpResponse<EmployeeDto>;
type EntityArrayResponseType = HttpResponse<EmployeeDto[]>;

// @ts-ignore
@Injectable()
export class EmployeeService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createEmployee(employee: IEmployee): Observable<HttpResponse<EmployeeDto>> {
    return this.http.post<EmployeeDto>(
      `${this.resourceUrl}/gateway/employee-app2014/create/employee`,
      employee,
      { observe: 'response', headers: this.headers }
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/employee-app2014/upload/employee`,
      formData,
      { observe: 'response' }
    );
  }

  updateEmployee(employee: IEmployee): Observable<HttpResponse<EmployeeDto>> {
    const params = { employeeId: employee.EmployeeId || '' };

    return this.http.put<EmployeeDto>(
      `${this.resourceUrl}/gateway/employee-app2014/update/employee`,
      employee,
      {
        observe: 'response',
        headers: this.headers,
        params: params,
      }
    );
  }

  deleteEmployee(req?: any): Observable<HttpResponse<IEmployee>> {
    return this.http.delete<EmployeeDto>(
      `${this.resourceUrl}/gateway/employee-app2014/delete/employee`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findEmployee(req?: any): Observable<HttpResponse<IEmployee>> {
    return this.http.get<EmployeeDto>(
      `${this.resourceUrl}/gateway/employee-app2014/find/employee`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findAllEmployee(params: any): Observable<HttpResponse<EmployeeResponse>> {
    return this.http.get<EmployeeResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/employee`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllDepartment(params: any): Observable<HttpResponse<DepartmentResponse>> {
    return this.http.get<DepartmentResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/department`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllDesignation(
    params: any
  ): Observable<HttpResponse<DesignationResponse>> {
    return this.http.get<DesignationResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/designation`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllShift(params: any): Observable<HttpResponse<ShiftResponse>> {
    return this.http.get<ShiftResponse>(
      `${this.resourceUrl}/gateway/attendance-app2013/findall/shift`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/employee-app2014/download/employee`,
      { observe: 'response', responseType: 'blob' }
    );
  }

  fileUpload(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `https://filemgt-app2019.demo.cgaas.ai/File-Mgt/api/CreateFile`,
      formData,
      { observe: 'response' }
    );
  }
}
