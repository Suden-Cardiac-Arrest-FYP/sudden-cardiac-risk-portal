export type RecordType = 'fingerprint_scanner' | 'web_portal' | 'service_app';

export interface Time {
  inTime: string;
  endTime: string;
}

export interface IIrregularAttendancePayroll {
  AttendanceId?: string;
  Date?: string;
  EmployeeId?: string;
  time?: Time[];
  AttendanceStatus?: string;
  ShiftStartTime?: string;
  ShiftEndTime?: string;
  deleted?: boolean;
  RecordType?: RecordType;
  isAdjusted?: boolean;
  LateMinutes?: number;
  HasLeave?: boolean;
}

export class IrregularAttendancePayrollDto implements IIrregularAttendancePayroll {
  constructor(
    public AttendanceId?: string,
    public Date?: string,
    public EmployeeId?: string,
    public time?: Time[],
    public AttendanceStatus?: string,
    public ShiftStartTime?: string,
    public ShiftEndTime?: string,
    public deleted?: boolean,
    public RecordType?: RecordType,
    public isAdjusted?: boolean,
    public LateMinutes?: number,
    public hasLeave?: boolean,
  ) {}
}

export interface IrregularAttendancePayrollResponse {
  Count: number;
  IrregularAttendance: IIrregularAttendancePayroll[];
}

export interface IrregularAttendanceSummary {
  employeeId: string;
  fromDate: string;
  toDate: string;
  missingInCount: number;
  missingOutCount: number;
  lateCount: number;
  hasLeave: boolean;
  leaveConflictCount: number;
  records: IIrregularAttendanceSummary[];
}

export interface IIrregularAttendanceSummary {
  AttendanceId?: string;
  Date?: string;
  EmployeeId?: string;
  time?: Time[];
  hasLeave: boolean;
  AttendanceStatus?: string;
  ShiftStartTime?: string;
  ShiftEndTime?: string;
  deleted?: boolean;
}

