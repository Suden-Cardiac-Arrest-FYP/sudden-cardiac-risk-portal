import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { JobDescriptionDto, IJobDescription, JobDescriptionResponse } from '../dto/JobDescription.dto';

type EntityResponseType = HttpResponse<JobDescriptionDto>;
type EntityArrayResponseType = HttpResponse<JobDescriptionDto[]>;

@Injectable()
export class JobDescriptionService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createJobDescription(jobDescription: IJobDescription): Observable<HttpResponse<JobDescriptionDto>> {
    return this.http.post<JobDescriptionDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/create/jobdescription`,
      jobDescription,
      { observe: 'response', headers: this.headers },
    );
  }

  updateJobDescription(jobDescription: JobDescriptionDto): Observable<HttpResponse<any>> {
    return this.http.put<any>(
      `${this.resourceUrl}/gateway/masterdata-app2015/update/jobdescription`,
      jobDescription,
      { observe: 'response', headers: this.headers }
    );
  }

  deleteJobDescription(req?: any): Observable<HttpResponse<IJobDescription>> {
    return this.http.delete<JobDescriptionDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/delete/jobdescription`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findJobDescription(req?: any): Observable<HttpResponse<IJobDescription>> {
    return this.http.get<JobDescriptionDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/find/jobdescription`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  findAllJobDescription(params: any): Observable<HttpResponse<JobDescriptionResponse>> {
    return this.http.get<JobDescriptionResponse>(
      `${this.resourceUrl}/gateway/masterdata-app2015/findall/jobdescription`,
      { params, observe: 'response', headers: this.headers },
    );
  }

  findJdByDesignationId(req?: any): Observable<HttpResponse<IJobDescription>> {
    return this.http.get<JobDescriptionDto>(
      `${this.resourceUrl}/gateway/masterdata-app2015/find/jdbydesignationid`,
      { params: req, observe: 'response', headers: this.headers },
    );
  } 
}