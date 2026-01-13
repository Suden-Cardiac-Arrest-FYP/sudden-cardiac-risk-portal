import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  EvaluationFormDto,
  IEvaluationForm,
  EvaluationFormResponse,
} from '../dto/EvaluationForm.dto';
import { EmployeeResponse } from '../dto/Employee.dto';
import { IJobDescription, JobDescriptionDto } from '../dto/JobDescription.dto';

type EntityResponseType = HttpResponse<EvaluationFormDto>;
type EntityArrayResponseType = HttpResponse<EvaluationFormDto[]>;

// @ts-ignore
@Injectable()
export class EvaluationFormService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createEvaluationForm(
    evaluationform: IEvaluationForm,
  ): Observable<HttpResponse<EvaluationFormDto>> {
    return this.http.post<EvaluationFormDto>(
      `${this.resourceUrl}/gateway/employee-app2014/create/evaluationform`,
      evaluationform,
      { observe: 'response', headers: this.headers },
    );
  }

  findAllEmployee(params: any): Observable<HttpResponse<EmployeeResponse>> {
    return this.http.get<EmployeeResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/employee`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  //use this method to find job description by employee id
  findJdByEmployeeId(req?: any): Observable<HttpResponse<IJobDescription>> {
      return this.http.get<JobDescriptionDto>(
        `${this.resourceUrl}/gateway/masterdata-app2015/find/jdbyemployeeid`,
        { params: req, observe: 'response', headers: this.headers },
      );
  } 

  uploadFile(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.resourceUrl}/gateway/employee-app2014/upload/evaluationform`,
      formData,
      { observe: 'response' },
    );
  }

  updateEvaluationForm(
    evaluationform: IEvaluationForm,
  ): Observable<HttpResponse<EvaluationFormDto>> {
    return this.http.put<EvaluationFormDto>(
      `${this.resourceUrl}/gateway/employee-app2014/update/evaluationform`,
      evaluationform,
      { observe: 'response', headers: this.headers },
    );
  }

  deleteEvaluationForm(req?: any): Observable<HttpResponse<IEvaluationForm>> {
    return this.http.delete<EvaluationFormDto>(
      `${this.resourceUrl}/gateway/employee-app2014/delete/evaluationform`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findEvaluationForm(req?: any): Observable<HttpResponse<IEvaluationForm>> {
    return this.http.get<EvaluationFormDto>(
      `${this.resourceUrl}/gateway/employee-app2014/find/evaluationform`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllEvaluationForm(
    params: any,
  ): Observable<HttpResponse<EvaluationFormResponse>> {
    return this.http.get<EvaluationFormResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/evaluationform`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  downloadFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.resourceUrl}/gateway/employee-app2014/download/evaluationform`,
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
