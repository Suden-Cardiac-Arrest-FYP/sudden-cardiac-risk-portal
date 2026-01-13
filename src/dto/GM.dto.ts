export interface IGMKPIDescription {
  KPIDescription?: string;
  KPIDescriptionId?: string;
}

export interface IGMKPICategory {
  KPICategory?: string;
  KPICategoryId?: string;
  KPIDescription?: IGMKPIDescription[];
}

export interface IGMJobDescription {
  JDId?: string;
  DesignationId?: string;
  KPICategory?: IGMKPICategory[];
  Notes?: string;
  deleted?: boolean;
}

export interface IGMEmployeeDetails {
  Designation?: string;
  EmployeeName?: string;
  JobDescription?: IGMJobDescription;
  JoinDate?: string;
}

export interface IKPICategoryMarkGM {
  KPICategoryMarkGMId?: string;
  KPICategoryId?: string;
  KPICategoryMark?: string;
}

export interface IKPIDescriptionMarkGM {
  KPIDescriptionMarkGMId?: string;
  KPIDescriptionId?: string;
  KPIDescriptionMark?: string;
}

export interface IGMEvaluation {
  GMEvaluationId?: string;
  EvaluationId?: string;
  EmployeeId?: string;
  kpiCategories?: IKPICategoryMarkGM[];
  kpiDescriptions?: IKPIDescriptionMarkGM[];
  IsIncrement?: boolean;
  IsPromotion?: boolean;
  Recommendations?: string;
  EvaluationStatus?: string;
  Deleted?: boolean;
}

export interface IGMRecommendation {
  Increment?: string;
  Promotion?: string;
  Justification?: string;
}

export class GMEmployeeDetailsDto implements IGMEmployeeDetails {
  constructor(
    public Designation?: string,
    public EmployeeName?: string,
    public JobDescription?: IGMJobDescription,
    public JoinDate?: string,
  ) {}
}

export class KPICategoryMarkGMDto implements IKPICategoryMarkGM {
  constructor(
    public KPICategoryMarkGMId?: string,
    public KPICategoryId?: string,
    public KPICategoryMark?: string,
  ) {}
}

export class KPIDescriptionMarkGMDto implements IKPIDescriptionMarkGM {
  constructor(
    public KPIDescriptionMarkGMId?: string,
    public KPIDescriptionId?: string,
    public KPIDescriptionMark?: string,
  ) {}
}

export class GMEvaluationDto implements IGMEvaluation {
  constructor(
    public GMEvaluationId?: string,
    public EvaluationId?: string,
    public EmployeeId?: string,
    public kpiCategories?: IKPICategoryMarkGM[],
    public kpiDescriptions?: IKPIDescriptionMarkGM[],
    public IsIncrement?: boolean,
    public IsPromotion?: boolean,
    public Recommendations?: string,
    public EvaluationStatus?: string,
    public Deleted?: boolean,
  ) {}
}

export class GMRecommendationDto implements IGMRecommendation {
  constructor(
    public Increment?: string,
    public Promotion?: string,
    public Justification?: string,
  ) {}
}