import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  DepartmentDto,
  IDepartment,
  DepartmentResponse,
} from '../dto/Department.dto';

type EntityResponseType = HttpResponse<DepartmentDto>;
type EntityArrayResponseType = HttpResponse<DepartmentDto[]>;

// @ts-ignore
@Injectable()
export class DepartmentService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createDepartment(
    department: IDepartment,
  ): Observable<HttpResponse<DepartmentDto>> {
    return this.http.post<DepartmentDto>(
      `${this.resourceUrl}/gateway/employee-app2014/create/department`,
      department,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/employee-app2014/upload/department`,
      formData,
      { observe: 'response' },
    );
  }

  updateDepartment(
    department: IDepartment,
  ): Observable<HttpResponse<DepartmentDto>> {
    return this.http.put<DepartmentDto>(
      `${this.resourceUrl}/gateway/employee-app2014/update/department`,
      department,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteDepartment(req?: any): Observable<HttpResponse<IDepartment>> {
    return this.http.delete<DepartmentDto>(
      `${this.resourceUrl}/gateway/employee-app2014/delete/department`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findDepartment(req?: any): Observable<HttpResponse<IDepartment>> {
    return this.http.get<DepartmentDto>(
      `${this.resourceUrl}/gateway/employee-app2014/find/department`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllDepartment(params: any): Observable<HttpResponse<DepartmentResponse>> {
    return this.http.get<DepartmentResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/department`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/employee-app2014/download/department`,
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
