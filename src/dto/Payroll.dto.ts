export interface IPayroll {
  PayrollId?: string;
  CreatedDate?: string;
  Month?: string;       // 1 to 12
  Year?: string;        // e.g., 2025
  Remarks?: string;
  Status?: boolean; // e.g., "Pending", "Approved", "Rejected"
}

export class PayrollDto implements IPayroll {
  constructor(
    public PayrollId?: string,
    public CreatedDate?: string,
    public Month?: string,
    public Status?: boolean,
    public Remarks?: string,
    public Year?: string, // e.g., "2025"
  ) {}
}

export interface PayrollResponse {
  Count: number;
  Payroll: IPayroll[];
}
