import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReportDto, IReport, ReportResponse } from '../dto/Report.dto';

type EntityResponseType = HttpResponse<ReportDto>;
type EntityArrayResponseType = HttpResponse<ReportDto[]>;

// @ts-ignore
@Injectable()
export class ReportService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createReport(report: IReport): Observable<HttpResponse<ReportDto>> {
    return this.http.post<ReportDto>(
      `${this.resourceUrl}/gateway/report-app2018/create/report`,
      report,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/report-app2018/upload/report`,
      formData,
      { observe: 'response' },
    );
  }

  updateReport(report: IReport): Observable<HttpResponse<ReportDto>> {
    return this.http.put<ReportDto>(
      `${this.resourceUrl}/gateway/report-app2018/update/report`,
      report,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteReport(req?: any): Observable<HttpResponse<IReport>> {
    return this.http.delete<ReportDto>(
      `${this.resourceUrl}/gateway/report-app2018/delete/report`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findReport(req?: any): Observable<HttpResponse<IReport>> {
    return this.http.get<ReportDto>(
      `${this.resourceUrl}/gateway/report-app2018/find/report`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllReport(params: any): Observable<HttpResponse<ReportResponse>> {
    return this.http.get<ReportResponse>(
      `${this.resourceUrl}/gateway/report-app2018/findall/report`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/report-app2018/download/report`,
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
