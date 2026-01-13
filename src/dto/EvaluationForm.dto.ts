export interface IEvaluationForm {
  EvaluationFormId?: string;
  EmployeeId?: string;
  EmployeeName?: string;
  EpfNumber?: string;
  DateJoined?: string;
  DepartmentId?: string;
  Department?: string;
  Designation?: string;
  DesignationId?: string;
  Deleted?: boolean;
}

export class EvaluationFormDto implements IEvaluationForm {
  constructor(
    public EvaluationFormId?: string,
    public EmployeeId?: string,
    public EmployeeName?: string,
    public EpfNumber?: string,
    public DepartmentId?: string,
    public Department?: string,
    public Designation?: string,
    public DateJoined?: string,
    public DesignationId?: string,
    public Deleted?: boolean,
  ) {}
}

export interface EvaluationFormResponse {
  Count: number;
  EvaluationForm: IEvaluationForm[];
}