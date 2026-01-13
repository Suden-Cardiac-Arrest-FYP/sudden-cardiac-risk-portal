import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { FileDto, IFile, FileResponse } from '../dto/File.dto';

type EntityResponseType = HttpResponse<FileDto>;
type EntityArrayResponseType = HttpResponse<FileDto[]>;

// @ts-ignore
@Injectable()
export class FileService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createFile(file: IFile): Observable<HttpResponse<FileDto>> {
    return this.http.post<FileDto>(
      `${this.resourceUrl}/gateway/file-mgt-app2019/create/file`,
      file,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/file-mgt-app2019/upload/file`,
      formData,
      { observe: 'response' },
    );
  }

  deleteFile(req?: any): Observable<HttpResponse<IFile>> {
    return this.http.delete<FileDto>(
      `${this.resourceUrl}/gateway/file-mgt-app2019/delete/file`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  updateFile(file: IFile): Observable<HttpResponse<FileDto>> {
    return this.http.put<FileDto>(
      `${this.resourceUrl}/gateway/file-mgt-app2019/update/file`,
      file,
      { observe: 'response', headers: this.headers },
    );
  }

  findAllFile(params: any): Observable<HttpResponse<FileResponse>> {
    return this.http.get<FileResponse>(
      `${this.resourceUrl}/gateway/file-mgt-app2019/findall/file`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/file-mgt-app2019/download/file`,
      { observe: 'response', responseType: 'blob' },
    );
  }
}
