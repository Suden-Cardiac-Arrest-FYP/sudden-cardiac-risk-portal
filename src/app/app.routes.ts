import { Routes } from '@angular/router';
import { AuthGuard as Auth0Guard } from '@auth0/auth0-angular';
import { AuthGuard } from './authGuard/authGuard';
import { AppmainComponent } from './layout/app.main.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { AppNotfoundComponent } from './layout/notfound/app.notfound.component';
import { UserComponent } from '../pages/User/User.component';
import { RoleComponent } from '../pages/Role/Role.component';
import { EmployeeComponent } from '../pages/Employee/Employee.component';
import { DesignationComponent } from '../pages/Designation/Designation.component';
import { DepartmentComponent } from '../pages/Department/Department.component';
import { LeaveComponent } from '../pages/Leave/Leave.component';
import { CoveringRequestComponent } from '../pages/CoveringRequest/CoveringRequest.component';
import { EvaluationFormComponent } from '../pages/EvaluationForm/EvaluationForm.component';
import { AttendanceComponent } from '../pages/Attendance/Attendance.component';
import { IrregularAttendanceComponent } from '../pages/IrregularAttendance/IrregularAttendance.component';
import { HolidayComponent } from '../pages/Holiday/Holiday.component';
import { ShiftComponent } from '../pages/Shift/Shift.component';
import { PaySlipComponent } from '../pages/PaySlip/PaySlip.component';
import { ReportComponent } from '../pages/Report/Report.component';
import { NotificationComponent } from '../pages/Notification/Notification.component';
import { CompanyComponent } from '../pages/Company/Company.component';
import { DeviceComponent } from '../pages/Device/Device.component';
import { AttendancePageComponent } from '../pages/attendance-page/attendance-page.component';
import { PaysheetComponent } from '../pages/Paysheet/Paysheet.component';
import { PayslipViewCreateComponent } from '../pages/payslip-view-create/payslip-view-create.component';
import { PrePayslipReviewComponent } from '../pages/pre-payslip-review/pre-payslip-review.component';
import { EvaluationProgressComponent } from '../pages/EvaluationForm/evaluation-progress/evaluation-progress.component';
import { MyProfileComponent } from '../pages/my-profile/my-profile.component';
import { CEOTabComponent } from '../pages/EvaluationForm/evaluation-progress/ceo-tab/ceo-tab.component';
import { FinalTabComponent } from '../pages/EvaluationForm/evaluation-progress/final-tab/final-tab.component';
import { GMTabComponent } from '../pages/EvaluationForm/evaluation-progress/gm-tab/gm-tab.component';
import { HODTabComponent } from '../pages/EvaluationForm/evaluation-progress/hod-tab/hod-tab.component';
import { SelfTabComponent } from '../pages/EvaluationForm/evaluation-progress/self-tab/self-tab.component';
import { PayrollComponent } from '../pages/Payroll/Payroll.component';
import { EmployeepayslipComponent } from '../pages/employeepayslip/employeepayslip.component';

export const routes: Routes = [
  {
    path: '',
    component: AppmainComponent,
    canActivate: [Auth0Guard],
    children: [
      { path: '', component: DashboardComponent },
      {
        path: 'user',
        component: UserComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5520' },
      },
      {
        path: 'role',
        component: RoleComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5522' },
      },
      {
        path: 'employee',
        component: EmployeeComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5525' },
      },
      {
        path: 'designation',
        component: DesignationComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5526' },
      },
      {
        path: 'department',
        component: DepartmentComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5527' },
      },
      {
        path: 'leave',
        component: LeaveComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5528' },
      },
      {
        path: 'coveringrequest',
        component: CoveringRequestComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5529' },
      },
      {
        path: 'evaluationform',
        component: EvaluationFormComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5530' },
      },
      {
        path: 'evaluationform',
        component: EvaluationFormComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5530' },
      },
      {
        path: 'evaluationprogress',
        component: EvaluationProgressComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO6001' },
        children: [
          {
            path: '',
            redirectTo: 'self',
            pathMatch: 'full',
          },
          {
            path: 'self',
            component: SelfTabComponent,
            canActivate: [AuthGuard],
            data: { requiredRoles: 'DTO6004' },
          },
          {
            path: 'hod',
            component: HODTabComponent,
            canActivate: [AuthGuard],
            data: { requiredRoles: 'DTO6005' },
          },
          {
            path: 'gm',
            component: GMTabComponent,
            canActivate: [AuthGuard],
            data: { requiredRoles: 'DTO6006' },
          },
          {
            path: 'ceo',
            component: CEOTabComponent,
            canActivate: [AuthGuard],
            data: { requiredRoles: 'DTO6007' },
          },
          {
            path: 'final',
            component: FinalTabComponent,
            canActivate: [AuthGuard],
            data: { requiredRoles: 'DTO6008' },
          },
        ],
      },
      {
        path: 'attendance',
        component: AttendancePageComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5531' },
        children: [
          {
            path: '',
            redirectTo: 'attendances',
            pathMatch: 'full',
          },
          {
            path: 'attendances',
            component: AttendanceComponent,
          },
          {
            path: 'irregular',
            component: IrregularAttendanceComponent,
          },
          {
            path: 'devices',
            component: DeviceComponent,
          },
        ],
      },
      {
        path: 'irregularattendance',
        component: IrregularAttendanceComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5532' },
      },
      {
        path: 'holiday',
        component: HolidayComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5533' },
      },
      {
        path: 'shift',
        component: ShiftComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5534' },
      },
      {
        path: 'payslip',
        component: PaySlipComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO6002' },
      },
      {
        path: 'paysheet',
        component: PaysheetComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5536' },
      },
      {
        path: 'paysheet/payroll',
        component: PayrollComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO6002' },
      },
      {
        path: 'paysheet/pre-payslip-review',
        component: PrePayslipReviewComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO6002' },
      },
      {
        path: 'paysheet/payslip-generation',
        component: PayslipViewCreateComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO6002' },
      },
      {
        path: 'report',
        component: ReportComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5537' },
      },
      {
        path: 'notification',
        component: NotificationComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5538' },
      },
      {
        path: 'company',
        component: CompanyComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5539' },
      },
      {
        path: 'device',
        component: DeviceComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO5574' },
      },
      {
        path: 'my-profile',
        component: MyProfileComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO6000' },
      },
      {
        path: 'payslips',
        component: EmployeepayslipComponent,
        canActivate: [AuthGuard],
        data: { requiredRoles: 'DTO6003' },
      },
    ],
  },
  { path: 'notfound', component: AppNotfoundComponent },
  { path: '**', redirectTo: '/notfound' },
];
