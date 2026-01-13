export interface IDesignation {
  DesignationId?: string;
  Designation?: string;
  Description?: string;
  NoOfEmp?: string;
  DesignationIdOfCompany?: string;
  OrganizationId?: string;
  IsEmployeeAssigned?: boolean;
}

export class DesignationDto implements IDesignation {
  constructor(
    public DesignationId?: string,
    public Designation?: string,
    public Description?: string,
    public NoOfEmp?: string,
    public DesignationIdOfCompany?: string,
    public OrganizationId?: string,
    public IsEmployeeAssigned?: boolean,
  ) {}
}

export interface DesignationResponse {
  Count: number;
  Designation: IDesignation[];
}
