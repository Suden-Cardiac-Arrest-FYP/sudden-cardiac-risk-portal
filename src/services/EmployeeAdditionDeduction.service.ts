import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { 
    EmployeeAdditionDeductionDto,
    EmployeeAdditionDeductionResponse,
    IEmployeeAdditionDeduction
 } from '../dto/EmployeeAdditionDeduction.dto';

 type EntityResponseType = HttpResponse<EmployeeAdditionDeductionDto>;
 type EntityArrayResponseType = HttpResponse<EmployeeAdditionDeductionDto[]>;

 // @ts-ignore
@Injectable()
export class EmployeeAdditionDeductionService {
  resourceUrl = environment.serverUrl;

  headers = {
    AuthToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImRhbWluZHUifQ.B8BvnQhFGX7QMJzsSH8z5mJwss3YdpHpSBH7M9Zia4k',
  };

  private http = inject(HttpClient);

  createAdditionOrDeduction(
    entry: EmployeeAdditionDeductionDto
  ): Observable<EntityResponseType> {
    return this.http.post<EmployeeAdditionDeductionDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/create/additionsordeductions`,
      entry,
      { observe: 'response', headers: this.headers }
    );
  }

  updateAdditionOrDeduction(
    entry: EmployeeAdditionDeductionDto
  ): Observable<EntityResponseType> {
    return this.http.put<EmployeeAdditionDeductionDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/update/additions-or-deductions`,
      entry,
      { observe: 'response', headers: this.headers }
    );
  }

  deleteAdditionOrDeduction(req?: any): Observable<EntityResponseType> {
    return this.http.delete<EmployeeAdditionDeductionDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/findall/additionsordeductions/delete`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findAdditionOrDeduction(req?: any): Observable<EntityResponseType> {
    return this.http.get<EmployeeAdditionDeductionDto>(
      `${this.resourceUrl}/gateway/payroll-app2017/find/additions-or-deductions`,
      { params: req, observe: 'response', headers: this.headers }
    );
  }

  findAllAdditionsOrDeductions(params: any): Observable<EntityArrayResponseType> {
    return this.http.get<EmployeeAdditionDeductionDto[]>(
      `${this.resourceUrl}/gateway/payroll-app2017/findall/additions-or-deductions`,
      { params, observe: 'response', headers: this.headers }
    );
  }

    findAllAdditionsOrDeductionsByEmployeeId(employeeId: string): Observable<HttpResponse<EmployeeAdditionDeductionResponse>> {
      return this.http.get<EmployeeAdditionDeductionResponse>(
        `${this.resourceUrl}/gateway/payroll-app2017/findall/additionsordeductions/employeeid`,
        { params: { employeeId }, observe: 'response', headers: this.headers }
      );
    }
}
