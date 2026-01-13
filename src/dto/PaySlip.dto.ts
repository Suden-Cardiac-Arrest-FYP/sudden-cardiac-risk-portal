export interface AdditionsOrDeductions {
  AdditionsOrDeductionsId: string;
  IsDefault: boolean;
  Type: string;
  Name: string;
  Value: number;
  EmployeeId: string;
  OrganizationId: string;
  Date: string;
  Deleted: boolean;
}

export interface IPaySlip {
  PaySlipId?: string;
  EmployeeName?: string;
  EpFNumber?: string;
  Designation?: string;
  Month?: string;
  Year?: number;
  BasicSalary?: number;
  ConsolidatedSalary?: number;
  BRA01?: number;
  BRA02?: number;
  EmployeeId?: string;
  WorkingDays?: number;
  WorkedDays?: number;
  NoPayDays?: number;
  NoPayAmount?: number;
  LateMinutes?: number;
  LateMinutesDeduction?: number;
  PayCuts?: number;
  SalaryForEPF?: number;
  GrossSalary?: number;
  Epf8Percent?: number;
  StampDuty?: number;
  PayeTax?: number;
  TotalAdditions?: number;
  TotalDeductions?: number;
  NetSalary?: number;
  Etf3Percent?: number;
  Epf12Percent?: number;
  CostToTheCompany?: number;
  CreateAt?: string;
  Additions?: AdditionsOrDeductions[];
  Deductions?: AdditionsOrDeductions[];
}

export class PaySlipDto implements IPaySlip {
  constructor(
    public PaySlipId?: string,
    public EmployeeName?: string,
    public EpFNumber?: string,
    public Designation?: string,
    public Month?: string,
    public Year?: number,
    public BasicSalary?: number,
    public ConsolidatedSalary?: number,
    public BRA01?: number,
    public BRA02?: number,
    public EmployeeId?: string,
    public WorkingDays?: number,
    public WorkedDays?: number,
    public NoPayDays?: number,
    public NoPayAmount?: number,
    public LateMinutes?: number,
    public LateMinutesDeduction?: number,
    public PayCuts?: number,
    public SalaryForEPF?: number,
    public GrossSalary?: number,
    public Epf8Percent?: number,
    public StampDuty?: number,
    public PayeTax?: number,
    public TotalAdditions?: number,
    public TotalDeductions?: number,
    public NetSalary?: number,
    public Etf3Percent?: number,
    public Epf12Percent?: number,
    public CostToTheCompany?: number,
    public CreateAt?: string,
    public Additions?: AdditionsOrDeductions[],
    public Deductions?: AdditionsOrDeductions[]
  ) {}
}

export interface PaySlipResponse {
  Count: number;
  PaySlip: IPaySlip[];
}
