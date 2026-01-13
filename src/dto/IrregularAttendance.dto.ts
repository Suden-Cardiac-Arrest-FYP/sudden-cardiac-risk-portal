export interface IIrregularAttendance {
  AttendanceId?: string;
  Date?: string;
  EmployeeId?: string;
  time?: Time[];
  AttendanceStatus?: string;
  ShiftStartTime?: string;
  ShiftEndTime?: string;
  deleted?: boolean;
  LateMinutes?: number;
}

export class IrregularAttendanceDto implements IIrregularAttendance {
  constructor(
    public AttendanceId?: string,
    public Date?: string,
    public EmployeeId?: string,
    public time?: Time[],
    public AttendanceStatus?: string,
    public ShiftStartTime?: string,
    public ShiftEndTime?: string,
    public deleted?: boolean,
    public LateMinutes?: number,
  ) {}
}

export interface Time {
  inTime: string;
  endTime: string;
}

export interface IrregularAttendanceResponse {
  Count: number;
  IrregularAttendance: IIrregularAttendance[];
}