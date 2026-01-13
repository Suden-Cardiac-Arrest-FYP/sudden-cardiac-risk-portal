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

export class LeaveDto implements ILeave {
  constructor(
    public LeaveId?: string,
    public LeavingDateRange?: string,
    public Reason?: string,
    public ApprovedBy?: string,
    public LeaveType?: string,
    public RequestedDate?: Number,
    public EmployeeId?: string,
    public CoveringPersonId?: string,
    public CoveringPersonName?: string,
    public Status?: string,
    public Name?: string, 
    public EpfNumber?: string, 
    public Time?: string 

  ) {}
}

export interface LeaveResponse {
  Count: number;
  Leave: ILeave[];
}
