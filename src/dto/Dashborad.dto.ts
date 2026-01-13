export interface DashboardStatsDto {
  departmentCount: number;
  designationCount: number;
  employeeCount: number;
  currentMonthHolidays: number;
}

export interface LeaveStatsDto {
  totalLeaves: number;
  casualLeaves: number;
  annualLeaves: number;
  specialLeaves: number;
  remainingCasualLeaves?: number;
  remainingAnnualLeaves?: number;
  remainingSpecialLeaves?: number;
}

export interface LeaveApprovalStatsDto {
  approved: number;
  pending: number;
  rejected: number;
}

export interface EmployeeDashboardDto {
  leaveStats: LeaveStatsDto;
  upcomingHolidays: HolidayDto[];
  recentAttendance: AttendanceDto[];
}

export interface SuperAdminDashboardDto {
  dashboardStats: DashboardStatsDto;
  leaveApprovalStats: LeaveApprovalStatsDto;
  departmentWiseEmployees: DepartmentEmployeeDto[];
  recentLeaveRequests: LeaveRequestDto[];
}

export interface HolidayDto {
  id: number;
  name: string;
  date: string;
  type: string;
}

export interface AttendanceDto {
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

export interface DepartmentEmployeeDto {
  departmentName: string;
  employeeCount: number;
}

export interface LeaveRequestDto {
  id: number;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}
