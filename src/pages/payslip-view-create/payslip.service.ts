import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PayslipResponse } from './payslip-view-create.component';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayslipService {
  private readonly http = inject(HttpClient);
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  findPaySlip(req?: any): Observable<HttpResponse<PayslipResponse>> {
    return this.http.get<PayslipResponse>(
      `${this.resourceUrl}/gateway/payroll-app2017/find/payslip`,
      { params: req, observe: 'response', headers: this.headers },
    );
  }

  // findPaySlip(params: {
  //   employeeId: string;
  //   month: number;
  //   year: number;
  // }): Observable<HttpResponse<q>> {
  //   const dummyResponse: PayslipResponse = {
  //     overview: {
  //       actualWorkedDays: 20,
  //       netWorkingDays: 22,
  //       scheduledShiftDays: 26,
  //       eligibleHolidays: 2,
  //       payrollPeriodHolidays: 4,
  //       fullDayLeaves: 1,
  //       halfDayLeaves: 2,
  //       shortLeaves: 3,
  //       lateArrivalDurationMinutes: 45,
  //       noPayDays: 1,
  //     },
  //     payslip: {
  //       paySlipId: 'PSLIP-001',
  //       employeeName: 'Jane Doe',
  //       epFNumber: 'EPF123456',
  //       designation: 'Software Engineer',
  //       month: 'June',
  //       year: 2025,
  //       basicSalary: 100000,
  //       consolidatedSalary: 150000,
  //       bra01: 5000,
  //       bra02: 2500,
  //       employeeId: "EPF-100",
  //       workingDays: 22,
  //       additions: [
  //         { name: 'Performance Bonus', amount: 5000 },
  //         { name: 'Transport Allowance', amount: 3000 }
  //       ],
  //       deductions: [
  //         { name: 'Loan Repayment', amount: 2000 },
  //         { name: 'Late Penalty', amount: 500 }
  //       ],
  //       noPayDays: 1,
  //       workedDays: 20,
  //       noPayAmount: 2500,
  //       lateMinutes: 45,
  //       lateMinutesDeduction: 300,
  //       payCuts: 2800,
  //       salaryForEPF: 100000,
  //       grossSalary: 158000,
  //       epf8Percent: 8000,
  //       stampDuty: 25,
  //       payeTax: 3500,
  //       totalAdditions: 8000,
  //       totalDeductions: 1325,
  //       netSalary: 156675,
  //       etf3Percent: 3000,
  //       epf12Percent: 12000,
  //       costToTheCompany: 171000,
  //       deleted: false,
  //       createAt: new Date().toISOString()
  //     },
  //     success: true,
  //     message: 'Dummy payslip data retrieved successfully'
  //   };

  //   const response = new HttpResponse({ body: dummyResponse, status: 200 });
  //   return of(response);
  // }

  approvePayslip(params: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      `${this.resourceUrl}/gateway/payroll-app2017/create/temp/pay/slip`,
      {},
      { params:params, observe: 'response' }
    );
  }
}