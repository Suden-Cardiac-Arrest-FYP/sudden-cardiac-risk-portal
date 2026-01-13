export interface ISelfKPIDescription {
  KPIDescription?: string;
  KPIDescriptionId?: string;
}

export interface ISelfKPICategory {
  KPICategory?: string;
  KPICategoryId?: string;
  KPIDescription?: ISelfKPIDescription[];
}

export interface ISelfJobDescription {
  JDId?: string;
  DesignationId?: string;
  KPICategory?: ISelfKPICategory[];
  Notes?: string;
  deleted?: boolean;
}

export interface ISelfEmployeeDetails {
  Designation?: string;
  EmployeeName?: string;
  JobDescription?: ISelfJobDescription;
  JoinDate?: string;
}

export interface IKPICategoryMarkSelf {
  KPICategoryMarkSelfId?: string;
  KPICategoryId?: string;
  KPICategoryMark?: string;
}

export interface IKPIDescriptionMarkSelf {
  KPIDescriptionMarkSelfId?: string;
  KPIDescriptionId?: string;
  KPIDescriptionMark?: string;
}

export interface ISelfEvaluation {
  SelfEvaluationId?: string;
  EvaluationId?: string;
  EmployeeId?: string;
  kpiCategories?: IKPICategoryMarkSelf[];
  kpiDescriptions?: IKPIDescriptionMarkSelf[];
  EvaluationStatus?: string;
  Deleted?: boolean;
}

export class SelfEmployeeDetailsDto implements ISelfEmployeeDetails {
  constructor(
    public Designation?: string,
    public EmployeeName?: string,
    public JobDescription?: ISelfJobDescription,
    public JoinDate?: string,
  ) {}
}

export class KPICategoryMarkSelfDto implements IKPICategoryMarkSelf {
  constructor(
    public KPICategoryMarkSelfId?: string,
    public KPICategoryId?: string,
    public KPICategoryMark?: string,
  ) {}
}

export class KPIDescriptionMarkSelfDto implements IKPIDescriptionMarkSelf {
  constructor(
    public KPIDescriptionMarkSelfId?: string,
    public KPIDescriptionId?: string,
    public KPIDescriptionMark?: string,
  ) {}
}

export class SelfEvaluationDto implements ISelfEvaluation {
  constructor(
    public SelfEvaluationId?: string,
    public EvaluationId?: string,
    public EmployeeId?: string,
    public kpiCategories?: IKPICategoryMarkSelf[],
    public kpiDescriptions?: IKPIDescriptionMarkSelf[],
    public EvaluationStatus?: string,
    public Deleted?: boolean,
  ) {}
}