export interface IDepartment {
  DepartmentId?: string;
  Name?: string;
  hod?: string;
  DepartmentIdOfCompany?: string;
  OrganizationId?: string;
  // hod?: string; // Head of Department
}

export class DepartmentDto implements IDepartment {
  constructor(
    public DepartmentId?: string,
    public Name?: string,
    public hod?: string,
    public DepartmentIdOfCompany?: string,
    public OrganizationId?: string,
    // public hod?: string // Head of Department
  ) {}
}

export interface DepartmentResponse {
  Count: number;
  Department: IDepartment[];
}
