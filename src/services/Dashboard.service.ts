import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  SuperAdminDashboardDto,
  DashboardStatsDto,
  LeaveApprovalStatsDto,
  EmployeeDashboardDto,
  LeaveStatsDto,
} from '../dto/Dashborad.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  // Super Admin Dashboard APIs
  getSuperAdminDashboard(): Observable<SuperAdminDashboardDto> {
    return this.http.get<SuperAdminDashboardDto>(
      `${this.resourceUrl}/dashboard/super-admin`,
      {
        headers: this.headers,
      }
    );
  }

  getDashboardStats(): Observable<DashboardStatsDto> {
    return this.http
      .get<any>(`${this.resourceUrl}/gateway/employee-app2014/find/count`, {
        headers: this.headers,
      })
      .pipe(
        map((response) => ({
          departmentCount: response.Department_counts,
          designationCount: response.Designation_Counts,
          employeeCount: response.Employees_counts,
          currentMonthHolidays: response.Holidays_Count,
        }))
      );
  }

  // Leave Approval Stats API - Map response to DTO
  getLeaveApprovalStats(): Observable<LeaveApprovalStatsDto> {
    return this.http
      .get<any>(
        `${this.resourceUrl}/gateway/employee-app2014/find/bymonthleavesstatus`,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((response: { Approved: any; Pending: any; Rejected: any }) => ({
          approved: response.Approved,
          pending: response.Pending,
          rejected: response.Rejected,
        }))
      );
  }

  // Employee Dashboard APIs
  getEmployeeDashboard(): Observable<EmployeeDashboardDto> {
    return this.http.get<EmployeeDashboardDto>(
      `${this.resourceUrl}/dashboard/employee`,
      {
        headers: this.headers,
      }
    );
  }

  getEmployeeLeaveStats(): Observable<LeaveStatsDto> {
    return this.http.get<LeaveStatsDto>(
      `${this.resourceUrl}/dashboard/employee/leave-stats`,
      {
        headers: this.headers,
      }
    );
  }
}
