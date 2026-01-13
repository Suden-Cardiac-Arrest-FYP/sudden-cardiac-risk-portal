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

export class AttendanceDto implements IAttendance {
  constructor(
    public AttendanceId?: string,
    public Date?: string,
    public EmployeeId?: string,
    public time?: Time[],
    public AttendanceStatus?: string,
    public ShiftStartTime?: string,
    public ShiftEndTime?: string,
    public deleted?: boolean
  ) {}
}

export interface Time {
  inTime: string;
  endTime: string;
}

export interface AttendanceResponse {
  Count: number;
  Attendance: IAttendance[];
}
