import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CompanyDto, ICompany, CompanyResponse } from '../dto/Company.dto';
import { DesignationResponse } from '../dto/Employee.dto';

type EntityResponseType = HttpResponse<CompanyDto>;
type EntityArrayResponseType = HttpResponse<CompanyDto[]>;

// @ts-ignore
@Injectable()
export class CompanyService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createCompany(company: ICompany): Observable<HttpResponse<CompanyDto>> {
    return this.http.post<CompanyDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/create/company`,
      company,
      { observe: 'response', headers: this.headers },
    );
  }

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/masterdata-app2015/upload/company`,
      formData,
      { observe: 'response' },
    );
  }

  updateCompany(company: CompanyDto): Observable<HttpResponse<any>> {
    const params = {
      companyId: company.CompanyId || ''
    };
    
    return this.http.put<any>(`${this.resourceUrl}/gateway/masterdata-app2015/update/company`, company, {
      params,
      observe: 'response'
    });
  }

  deleteCompany(req?: any): Observable<HttpResponse<ICompany>> {
    return this.http.delete<CompanyDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/delete/company`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findCompany(req?: any): Observable<HttpResponse<ICompany>> {
    return this.http.get<CompanyDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/find/company`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllCompany(params: any): Observable<HttpResponse<CompanyResponse>> {
    return this.http.get<CompanyResponse>(
      `${this.resourceUrl}/gateway/masterdata-app2015/findall/company`,
      { params, observe: 'response', headers: this.headers },
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
      `${this.resourceUrl}/gateway/masterdata-app2015/download/company`,
      { observe: 'response', responseType: 'blob' },
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
