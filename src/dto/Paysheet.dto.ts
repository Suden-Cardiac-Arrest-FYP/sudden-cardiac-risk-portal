export interface IPaysheet {
  PaySheetId?: string;
  Month?: string;
  Year?: string;
  Date?: string; 
  TotalSalaries?: number;
  CostToTheCompany?: number;
  PaySlip?: string[]; 
  EmployeeId?: string[]; 
  IsGenerated?: boolean;
}


export class PaysheetDto implements IPaysheet {
  constructor(
    public PaySheetId?: string,
    public Month?: string,
    public Year?: string,
    public Date?: string, // e.g., "2025-06-16"
    public TotalSalaries?: number,
    public CostToTheCompany?: number,
    public PaySlip?: string[], // Array of PaySlip IDs or URLs
    public EmployeeId?: string[], // Array of Employee IDs
    public IsGenerated?: boolean
  ) {}
}

export interface PaysheetResponse {
  Count: number;
  Paysheet: IPaysheet[];
}
