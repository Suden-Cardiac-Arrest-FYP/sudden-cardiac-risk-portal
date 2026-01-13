export interface ICompany {
  CompanyId?: string;
  Name?: string;
  Type?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  NoOFEmployees?: number;
  BrNo?: string;
  EpfNumber?: string;
  Website?: string;
  LogoUrl?: string;
  OrganizationId?: string;
  deleted?: boolean;
}

export class CompanyDto implements ICompany {
  constructor(
    public CompanyId?: string,
    public Name?: string,
    public Type?: string,
    public Email?: string,
    public Phone?: string,
    public Address?: string,
    public NoOFEmployees?: number,
    public BrNo?: string,
    public EpfNumber?: string,
    public Website?: string,
    public LogoUrl?: string,
    public OrganizationId?: string,
    public deleted?: boolean,
  ) {}
}


export interface CompanyResponse {
  Count: number;
  Company: ICompany[];
}