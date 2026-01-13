export interface IFile {
  FileId?: string;
  Url?: string;
  FileName?: string;
  FileType?: string;
  CreatedAt?: string;
  Deleted?: boolean;
}

export interface IEmployee {
  EmployeeId?: string;
  Name?: string;
  CallingName?: string;
  BloodGroup?: string;
  WhatsappNum?: string;
  LastNameInitial?: string;
  Email?: string;
  ProfileImage?: string;
  Country?: string;
  DateOfBirth?: string;
  Phone?: string;
  Department?: string;
  EpfNumber?: string;
  DateJoined?: string;
  Gender?: string;
  Address?: string;
  NicNumber?: string;
  EmpType?: string;
  AnnualEntitlement?: number;
  Location?: string;
  ConsolidatedSalary?: number;
  OfficialEmail?: string;
  Designation?: string;
  BasicSalary?: number;
  SalaryArrears?: number;
  SalaryAdvanced?: number;
  CompanyEmpID?: string;
  OrganizationId?: string;
  DepartmentId?: string;
  DesignationId?: string;
  Username?: string;
  AccName?: string;
  AccNum?: string;
  BankName?: string;
  BankBranch?: string;
  AccountType?: string;
  WelfareDeduction?: number;
  OtherDeductions?: number;
  UserId?: string;
  MachineEmployeeId?: string;
  ShiftId?: string;
  ShiftName?: string;
  Documents?: IFile[];
  Deleted?: boolean;
  IsActive?: boolean;
  HeadOfDepartment?: string;
  BRAOptions?: string;
  FingerprintAllocated?: boolean;
}

export class EmployeeDto implements IEmployee {
  constructor(
    public EmployeeId?: string,
    public Name?: string,
    public CallingName?: string,
    public BloodGroup?: string,
    public WhatsappNum?: string,
    public LastNameInitial?: string,
    public Email?: string,
    public ProfileImage?: string,
    public Country?: string,
    public DateOfBirth?: string,
    public Phone?: string,
    public Department?: string,
    public EpfNumber?: string,
    public DateJoined?: string,
    public Gender?: string,
    public Address?: string,
    public NicNumber?: string,
    public EmpType?: string,
    public AnnualEntitlement?: number,
    public Location?: string,
    public ConsolidatedSalary?: number,
    public OfficialEmail?: string,
    public Designation?: string,
    public BasicSalary?: number,
    public SalaryArrears?: number,
    public SalaryAdvanced?: number,
    public CompanyEmpID?: string,
    public OrganizationId?: string,
    public DepartmentId?: string,
    public DesignationId?: string,
    public Username?: string,
    public AccName?: string,
    public AccNum?: string,
    public BankName?: string,
    public BankBranch?: string,
    public AccountType?: string,
    public WelfareDeduction?: number,
    public OtherDeductions?: number,
    public UserId?: string,
    public MachineEmployeeId?: string,
    public ShiftId?: string,
    public ShiftName?: string,
    public Documents?: IFile[],
    public Deleted?: boolean,
    public IsActive?: boolean,
    public HeadOfDepartment?: string,
    public BRAOptions?: string,
    public FingerprintAllocated?: boolean
  ) {}
}

export interface EmployeeResponse {
  Count: number;
  Employee: IEmployee[];
}

export interface DepartmentDto {
  DepartmentId?: string;
  Name?: string;
  DepartmentName?: string;
  Id?: string;
}

export interface DepartmentResponse {
  Count: number;
  Department: DepartmentDto[];
}

export interface DesignationDto {
  DesignationId?: string;
  Name?: string;
  DesignationName?: string;
  Id?: string;
}

export interface DesignationResponse {
  Count: number;
  Designation: DesignationDto[];
}

export interface ShiftDto {
  ShiftId?: string;
  Name?: string;
  ShiftName?: string;
  Id?: string;
}

export interface ShiftResponse {
  Count: number;
  Shift: ShiftDto[];
}
