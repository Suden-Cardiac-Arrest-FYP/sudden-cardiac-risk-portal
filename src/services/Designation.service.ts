import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  DesignationDto,
  IDesignation,
  DesignationResponse,
} from '../dto/Designation.dto';

type EntityResponseType = HttpResponse<DesignationDto>;
type EntityArrayResponseType = HttpResponse<DesignationDto[]>;

// @ts-ignore
@Injectable()
export class DesignationService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createDesignation(
    designation: IDesignation,
  ): Observable<HttpResponse<DesignationDto>> {
    return this.http.post<DesignationDto>(
      `${this.resourceUrl}/gateway/employee-app2014/create/designation`,
      designation,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/employee-app2014/upload/designation`,
      formData,
      { observe: 'response' },
    );
  }

  updateDesignation(
    designation: IDesignation,
  ): Observable<HttpResponse<DesignationDto>> {
    return this.http.put<DesignationDto>(
      `${this.resourceUrl}/gateway/employee-app2014/update/designation`,
      designation,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteDesignation(req?: any): Observable<HttpResponse<IDesignation>> {
    return this.http.delete<DesignationDto>(
      `${this.resourceUrl}/gateway/employee-app2014/delete/designation`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findDesignation(req?: any): Observable<HttpResponse<IDesignation>> {
    return this.http.get<DesignationDto>(
      `${this.resourceUrl}/gateway/employee-app2014/find/designation`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllDesignation(
    params: any,
  ): Observable<HttpResponse<DesignationResponse>> {
    return this.http.get<DesignationResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/designation`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/employee-app2014/download/designation`,
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

  getEmployeeCountByDesignationId(designationId: string) {
    return this.http.get<{ count: number }>(
      `${this.resourceUrl}/${designationId}/employees/count`
    );
  }  
}
