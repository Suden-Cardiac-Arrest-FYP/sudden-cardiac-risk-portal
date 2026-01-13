import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PaySlipDto, IPaySlip, PaySlipResponse } from '../dto/PaySlip.dto';

type EntityResponseType = HttpResponse<PaySlipDto>;
type EntityArrayResponseType = HttpResponse<PaySlipDto[]>;

// @ts-ignore
@Injectable()
export class PaySlipService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createPaySlip(payslip: IPaySlip): Observable<HttpResponse<PaySlipDto>> {
    return this.http.post<PaySlipDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/create/payslip`,
      payslip,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/payroll-app2017/upload/payslip`,
      formData,
      { observe: 'response' },
    );
  }

  updatePaySlip(payslip: IPaySlip): Observable<HttpResponse<PaySlipDto>> {
    return this.http.put<PaySlipDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/update/payslip`,
      payslip,
      { observe: 'response', headers: this.headers },
    );
  }

  deletePaySlip(req?: any): Observable<HttpResponse<IPaySlip>> {
    return this.http.delete<PaySlipDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/delete/payslip`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findPaySlip(req?: any): Observable<HttpResponse<IPaySlip>> {
    return this.http.get<PaySlipDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/find/payslip`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllPaySlip(params: any): Observable<HttpResponse<PaySlipResponse>> {
    return this.http.get<PaySlipResponse>(
      `${this.resourceUrl}/gateway/payroll-app2017/findall/payslip`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/payroll-app2017/download/payslip`,
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
