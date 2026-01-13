export interface IReport {
  ReportId?: string;
  Title?: string;
  Description?: string;
  Author?: string;
  Category?: string;
  CreatedDate?: string;
}

export class ReportDto implements IReport {
  constructor(
    public ReportId?: string,
    public Title?: string,
    public Description?: string,
    public Author?: string,
    public Category?: string,
    public CreatedDate?: string,
  ) {}
}

export interface ReportResponse {
  Count: number;
  Report: IReport[];
}
