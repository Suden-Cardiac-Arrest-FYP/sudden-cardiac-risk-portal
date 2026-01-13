import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PayrollDto, IPayroll, PayrollResponse } from '../dto/Payroll.dto';
import { EmployeeResponse } from '../dto/Employee.dto';
import { PaySlipResponse } from '../dto/PaySlip.dto';

type EntityResponseType = HttpResponse<PayrollDto>;
type EntityArrayResponseType = HttpResponse<PayrollDto[]>;

// @ts-ignore
@Injectable()
export class PayrollService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createPayroll(payroll: IPayroll): Observable<HttpResponse<PayrollDto>> {
    return this.http.post<PayrollDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/create/payroll`,
      payroll,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/payroll-app2017/upload/payroll`,
      formData,
      { observe: 'response' },
    );
  }

  updatePayroll(payroll: IPayroll): Observable<HttpResponse<PayrollDto>> {
    return this.http.put<PayrollDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/update/payroll`,
      payroll,
      { observe: 'response', headers: this.headers },
    );
  }

  deletePayroll(req?: any): Observable<HttpResponse<IPayroll>> {
    return this.http.delete<PayrollDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/delete/payroll`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findPayroll(req?: any): Observable<HttpResponse<IPayroll>> {
    return this.http.get<PayrollDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/find/payroll`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllPayroll(params: any): Observable<HttpResponse<PayrollResponse>> {
    return this.http.get<PayrollResponse>(
      `${this.resourceUrl}/gateway/payroll-app2017/findall/payroll`,
      { params, observe: 'response', headers: this.headers },
    );
  }

    CanCreatePaysheet(): Observable<HttpResponse<any>> {
    return this.http.get<any>(
      `${this.resourceUrl}/gateway/payroll-app2017/cancreatepaysheet`,
      { observe: 'response', headers: this.headers },
    );
  }


  approvePayslip(): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      `${this.resourceUrl}/gateway/payroll-app2017/create/temp/pay/slip`,
      {},
      { observe: 'response' }
    );
  }

  findAllExcepTempEmployee(params: any): Observable<HttpResponse<EmployeeResponse>> {
    return this.http.get<EmployeeResponse>(
      `${this.resourceUrl}/gateway/payroll-app2017/findall/employees/except/temp/pay/slips`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findTempAllPaySlip(params: any): Observable<HttpResponse<PaySlipResponse>> {
    return this.http.get<PaySlipResponse>(
      `${this.resourceUrl}/gateway/payroll-app2017/findall/temp/slips`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/payroll-app2017/download/payroll`,
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
