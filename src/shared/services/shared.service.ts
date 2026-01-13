import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AttendanceOrLeavesRespone } from '../dto/shared.dto';

// @ts-ignore
@Injectable()
export class SharedService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  findAttendanceAndLeaveData(params: any): Observable<HttpResponse<AttendanceOrLeavesRespone>> {
    return this.http.get<AttendanceOrLeavesRespone>(
      `${this.resourceUrl}/gateway/employee-app2014/findallleavesattendancebydate`,
      { params, observe: 'response', headers: this.headers }
    );
  }
}
