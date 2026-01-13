import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  CoveringRequestDto,
  ICoveringRequest,
  CoveringRequestResponse,
} from '../dto/CoveringRequest.dto';

type EntityResponseType = HttpResponse<CoveringRequestDto>;
type EntityArrayResponseType = HttpResponse<CoveringRequestDto[]>;

// @ts-ignore
@Injectable()
export class CoveringRequestService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createCoveringRequest(
    coveringrequest: ICoveringRequest
  ): Observable<HttpResponse<CoveringRequestDto>> {
    return this.http.post<CoveringRequestDto>(
      `${this.resourceUrl}/gateway/employee-app2014/create/coveringrequest`,
      coveringrequest,
      { observe: 'response', headers: this.headers }
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/employee-app2014/upload/coveringrequest`,
      formData,
      { observe: 'response' }
    );
  }

  updateCoveringRequest(
    coveringrequest: ICoveringRequest
  ): Observable<HttpResponse<CoveringRequestDto>> {
    return this.http.put<CoveringRequestDto>(
      `${this.resourceUrl}/gateway/employee-app2014/update/coveringrequest`,
      coveringrequest,
      { observe: 'response', headers: this.headers }
    );
  }

  deleteCoveringRequest(req?: any): Observable<HttpResponse<ICoveringRequest>> {
    return this.http.delete<CoveringRequestDto>(
      `${this.resourceUrl}/gateway/employee-app2014/delete/coveringrequest`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findCoveringRequest(req?: any): Observable<HttpResponse<ICoveringRequest>> {
    return this.http.get<CoveringRequestDto>(
      `${this.resourceUrl}/gateway/employee-app2014/find/coveringrequest`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findAllMyCoveringRequest(
    params: any
  ): Observable<HttpResponse<CoveringRequestResponse>> {
    let url = ``;

    if (params?.RoleName === 'Employee') {
      url = `${this.resourceUrl}/gateway/employee-app2014/findallcoveringrequest/requesterid`;
    } else if (params?.RoleName === 'HOD') {
      url = `${this.resourceUrl}/gateway/employee-app2014/findallcoveringrequest/hodid`;
    } else if (params?.RoleName === 'Super-Admin') {
      url = `${this.resourceUrl}/gateway/employee-app2014/findall/coveringrequest`;
    }

    return this.http.get<CoveringRequestResponse>(url, {
      params,
      observe: 'response',
      headers: this.headers,
    });
  }

  findAllMyCoveringRequestAssignedToMe(
    params: any
  ): Observable<HttpResponse<CoveringRequestResponse>> {
    return this.http.get<CoveringRequestResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findallcoveringrequest/coveringpersonid`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllMyCoveringRequestCompletedRequests(
    params: any
  ): Observable<HttpResponse<CoveringRequestResponse>> {
    return this.http.get<CoveringRequestResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findallcoveringrequest/coveringpersonid/hodstatus`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findAllCoveringRequest(
    params: any
  ): Observable<HttpResponse<CoveringRequestResponse>> {
    return this.http.get<CoveringRequestResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/coveringrequest`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  updateHODStatus(params: {
    CoveringRequestId: string;
    status: string;
    HodId?: string;
  }): Observable<HttpResponse<any>> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set('CoveringRequestId', params.CoveringRequestId);
    httpParams = httpParams.set('Status', params.status);
    httpParams = httpParams.set('HodId', params.HodId || '');

    return this.http.patch(
      `${this.resourceUrl}/gateway/employee-app2014/updatecoveringrequest/hod/status`,
      null,
      {
        params: httpParams,
        observe: 'response',
        headers: this.headers,
      }
    );
  }

  updateCoveringPersonStatus(params: {
    CoveringRequestId: string;
    status: string;
    HODApprovedDate?: string;
    LeaveId?: string;
    CoveringPersonId?: string;
  }): Observable<HttpResponse<any>> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set('CoveringRequestId', params.CoveringRequestId);
    httpParams = httpParams.set('Status', params.status);
    httpParams = httpParams.set('LeaveId', params.LeaveId || '');
    httpParams = httpParams.set(
      'CoveringPersonId',
      params.CoveringPersonId || ''
    );

    return this.http.patch(
      `${this.resourceUrl}/gateway/employee-app2014/updatecoveringperson/status`,
      null,
      {
        params: httpParams,
        observe: 'response',
        headers: this.headers,
      }
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/employee-app2014/download/coveringrequest`,
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
