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
import { ISelfEvaluation, SelfEvaluationDto } from '../dto/Self.dto';
import { IHODEvaluation, HODEvaluationDto } from '../dto/HOD.dto';
import { IGMEvaluation, GMEvaluationDto } from '../dto/GM.dto';
import { ICEOEvaluation, CEOEvaluationDto } from '../dto/CEO.dto';
import { IFinalEvaluationResponse } from '../dto/Final.dto';

type EntityResponseType = HttpResponse<EvaluationFormDto>;
type EntityArrayResponseType = HttpResponse<EvaluationFormDto[]>;

@Injectable()
export class EvaluationTabService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  // Self Evaluation Methods
  createSelfEvaluation(
    selfEvaluation: ISelfEvaluation,
  ): Observable<HttpResponse<SelfEvaluationDto>> {
    return this.http.post<SelfEvaluationDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/create/selfevaluation`,
      selfEvaluation,
      { observe: 'response', headers: this.headers },
    );
  }

  findSelfEvaluationByEmployeeId(
    employeeId: string,
  ): Observable<HttpResponse<ISelfEvaluation>> {
    const params = { employeeId };
    return this.http.get<ISelfEvaluation>(
      `${this.resourceUrl}/gateway/masterdata-app2015/find/selfevaluation`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  // HOD Evaluation Methods
  createHODEvaluation(
    hodEvaluation: IHODEvaluation,
  ): Observable<HttpResponse<HODEvaluationDto>> {
    return this.http.post<HODEvaluationDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/create/hodevaluation`,
      hodEvaluation,
      { observe: 'response', headers: this.headers },
    );
  }

  findHODEvaluationByEmployeeId(
    employeeId: string,
  ): Observable<HttpResponse<IHODEvaluation>> {
    const params = { employeeId };
    return this.http.get<IHODEvaluation>(
      `${this.resourceUrl}/gateway/masterdata-app2015/find/hodevaluation`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  // GM Evaluation Methods
  createGMEvaluation(
    gmEvaluation: IGMEvaluation,
  ): Observable<HttpResponse<GMEvaluationDto>> {
    return this.http.post<GMEvaluationDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/create/gmevaluation`,
      gmEvaluation,
      { observe: 'response', headers: this.headers },
    );
  }

  findGMEvaluationByEmployeeId(
    employeeId: string,
  ): Observable<HttpResponse<IGMEvaluation>> {
    const params = { employeeId };
    return this.http.get<IGMEvaluation>(
      `${this.resourceUrl}/gateway/masterdata-app2015/find/gmevaluation`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  // CEO Evaluation Methods
  createCEOEvaluation(
    ceoEvaluation: ICEOEvaluation,
  ): Observable<HttpResponse<CEOEvaluationDto>> {
    return this.http.post<CEOEvaluationDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/create/ceoevaluation`,
      ceoEvaluation,
      { observe: 'response', headers: this.headers },
    );
  }

  findCEOEvaluationByEmployeeId(
    employeeId: string,
  ): Observable<HttpResponse<ICEOEvaluation>> {
    const params = { employeeId };
    return this.http.get<ICEOEvaluation>(
      `${this.resourceUrl}/gateway/masterdata-app2015/find/ceoevaluation`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  // Final Evaluation Methods
  findFinalEvaluationByEmployeeId(
    employeeId: string,
  ): Observable<HttpResponse<IFinalEvaluationResponse>> {
    const params = { employeeId };
    return this.http.get<IFinalEvaluationResponse>(
      `${this.resourceUrl}/gateway/masterdata-app2015/findall/finalevaluation`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  // Common Methods
  findAllEmployee(params: any): Observable<HttpResponse<EmployeeResponse>> {
    return this.http.get<EmployeeResponse>(
      `${this.resourceUrl}/gateway/employee-app2014/findall/employee`,
      { params, observe: 'response', headers: this.headers }
    );
  }

  findJdByEmployeeId(req?: any): Observable<HttpResponse<IJobDescription>> {
      return this.http.get<JobDescriptionDto>(
        `${this.resourceUrl}/gateway/masterdata-app2015/find/jdbyemployeeid`,
        { params: req, observe: 'response', headers: this.headers },
      );
  } 
}