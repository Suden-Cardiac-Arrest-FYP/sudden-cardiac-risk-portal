import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { RoleDto, IRole, RoleResponse } from '../dto/Role.dto';

type EntityResponseType = HttpResponse<RoleDto>;
type EntityArrayResponseType = HttpResponse<RoleDto[]>;

// @ts-ignore
@Injectable()
export class RoleService {
  resourceUrl = environment.serverUrl;
  resourceUrl2 = environment.userMgt

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createRole(role: IRole): Observable<HttpResponse<RoleDto>> {
    return this.http.post<RoleDto>(
      `${this.resourceUrl2}/CreateRole`,
      role,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl2}/UploadRole`,
      formData,
      { observe: 'response' },
    );
  }

  updateRole(role: IRole, roleId: any): Observable<HttpResponse<RoleDto>> {
    return this.http.put<RoleDto>(
      `${this.resourceUrl2}/UpdateRole`,
      role,
      { params: {roleId:roleId}, observe: 'response', headers: this.headers },
    );
  }

  deleteRole(req?: any): Observable<HttpResponse<IRole>> {
    return this.http.delete<RoleDto>(
      `${this.resourceUrl2}/DeleteRole`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findRole(req?: any): Observable<HttpResponse<IRole>> {
    return this.http.get<RoleDto>(
      `${this.resourceUrl2}/FindRole`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllRole(params: any): Observable<HttpResponse<RoleResponse>> {
    return this.http.get<RoleResponse>(
      `${this.resourceUrl2}/FindallRole`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl2}/DownloadRole`,
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
