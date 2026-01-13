export interface IHODKPIDescription {
  KPIDescription?: string;
  KPIDescriptionId?: string;
}

export interface IHODKPICategory {
  KPICategory?: string;
  KPICategoryId?: string;
  KPIDescription?: IHODKPIDescription[];
}

export interface IHODJobDescription {
  JDId?: string;
  DesignationId?: string;
  KPICategory?: IHODKPICategory[];
  Notes?: string;
  deleted?: boolean;
}

export interface IHODEmployeeDetails {
  Designation?: string;
  EmployeeName?: string;
  JobDescription?: IHODJobDescription;
  JoinDate?: string;
}

export interface IKPICategoryMarkHOD {
  KPICategoryMarkHODId?: string;
  KPICategoryId?: string;
  KPICategoryMark?: string;
}

export interface IKPIDescriptionMarkHOD {
  KPIDescriptionMarkHODId?: string;
  KPIDescriptionId?: string;
  KPIDescriptionMark?: string;
}

export interface IHODEvaluation {
  HODEvaluationId?: string;
  EvaluationId?: string;
  EmployeeId?: string;
  kpiCategories?: IKPICategoryMarkHOD[];
  kpiDescriptions?: IKPIDescriptionMarkHOD[];
  IsIncrement?: boolean;
  IsPromotion?: boolean;
  Recommendations?: string;
  EvaluationStatus?: string;
  Deleted?: boolean;
}

export interface IHODRecommendation {
  Increment?: string;
  Promotion?: string;
  Justification?: string;
}

export class HODEmployeeDetailsDto implements IHODEmployeeDetails {
  constructor(
    public Designation?: string,
    public EmployeeName?: string,
    public JobDescription?: IHODJobDescription,
    public JoinDate?: string,
  ) {}
}

export class KPICategoryMarkHODDto implements IKPICategoryMarkHOD {
  constructor(
    public KPICategoryMarkHODId?: string,
    public KPICategoryId?: string,
    public KPICategoryMark?: string,
  ) {}
}

export class KPIDescriptionMarkHODDto implements IKPIDescriptionMarkHOD {
  constructor(
    public KPIDescriptionMarkHODId?: string,
    public KPIDescriptionId?: string,
    public KPIDescriptionMark?: string,
  ) {}
}

export class HODEvaluationDto implements IHODEvaluation {
  constructor(
    public HODEvaluationId?: string,
    public EvaluationId?: string,
    public EmployeeId?: string,
    public kpiCategories?: IKPICategoryMarkHOD[],
    public kpiDescriptions?: IKPIDescriptionMarkHOD[],
    public IsIncrement?: boolean,
    public IsPromotion?: boolean,
    public Recommendations?: string,
    public EvaluationStatus?: string,
    public Deleted?: boolean,
  ) {}
}

export class HODRecommendationDto implements IHODRecommendation {
  constructor(
    public Increment?: string,
    public Promotion?: string,
    public Justification?: string,
  ) {}
}