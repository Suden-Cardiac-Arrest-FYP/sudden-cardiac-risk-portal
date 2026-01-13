export interface ICoveringRequest {
  CoveringRequestId?: string;
  LeaveId?: string;
  CoveringDate?: string;
  RequesterId?: string;
  Department?: string;
  ReasonForLeave?: string;
  CoveringPersonId?: string;
  RequestedDate?: string;
  Urgent?: boolean;
  HODApprovedDate?: string;
  HodId?: string;
  Comments?: string;
  Status?: string;
  HODStatus?: string;
  LeaveType?: string;
  LeaveSubType?: string;
  Time?: string; // Optional field for timestamp
  CoveringDateRange?: string[]; // Optional field for date range
}

export class CoveringRequestDto implements ICoveringRequest {
  constructor(
    public CoveringRequestId?: string,
    public LeaveId?: string,
    public CoveringDate?: string,
    public RequesterId?: string,
    public Department?: string,
    public ReasonForLeave?: string,
    public CoveringPersonId?: string,
    public RequestedDate?: string,
    public Urgent?: boolean,
    public HODApprovedDate?: string,
    public HodId?: string,
    public Comments?: string,
    public Status?: string,
    public HODStatus?: string,
    public LeaveType?: string,
    public LeaveSubType?: string,
    public Time?: string,
    public CoveringDateRange?: string[] 

  ) {}
}

export interface CoveringRequestResponse {
  Count: number;
  CoveringRequest: ICoveringRequest[];
}
