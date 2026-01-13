export interface ILeave {
  LeaveId?: string;
  LeavingDateRange?: string;
  Reason?: string;
  ApprovedBy?: string;
  LeaveType?: string;
  RequestedDate?: Number;
  EmployeeId?: string;
  CoveringPersonId?: string;
  CoveringPersonName?: string;
  Status?: string;
  Name?: string;
  EpfNumber?: string; 
  Time?: string; // Optional field for timestamp
}

export interface IAttendance {
  AttendanceId?: string;
  Date?: string;
  EmployeeId?: string;
  time?: Time[];
  AttendanceStatus?: string;
  ShiftStartTime?: string;
  ShiftEndTime?: string;
  deleted?: boolean;
}

export interface Time {
  inTime: string;
  endTime: string;
}

export interface AttendanceOrLeavesRespone {
  leaves: ILeave[];
  attendances: IAttendance[];
}

