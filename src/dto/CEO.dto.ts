export interface ICEOKPIDescription {
  KPIDescription?: string;
  KPIDescriptionId?: string;
}

export interface ICEOKPICategory {
  KPICategory?: string;
  KPICategoryId?: string;
  KPIDescription?: ICEOKPIDescription[];
}

export interface ICEOJobDescription {
  JDId?: string;
  DesignationId?: string;
  KPICategory?: ICEOKPICategory[];
  Notes?: string;
  deleted?: boolean;
}

export interface ICEOEmployeeDetails {
  Designation?: string;
  EmployeeName?: string;
  JobDescription?: ICEOJobDescription;
  JoinDate?: string;
}

export interface IKPICategoryMarkCEO {
  KPICategoryMarkCEOId?: string;
  KPICategoryId?: string;
  KPICategoryMark?: string;
}

export interface IKPIDescriptionMarkCEO {
  KPIDescriptionMarkCEOId?: string;
  KPIDescriptionId?: string;
  KPIDescriptionMark?: string;
}

export interface ICEOEvaluation {
  CEOEvaluationId?: string;
  EvaluationId?: string;
  EmployeeId?: string;
  kpiCategories?: IKPICategoryMarkCEO[];
  kpiDescriptions?: IKPIDescriptionMarkCEO[];
  IsIncrement?: boolean;
  IsPromotion?: boolean;
  Recommendations?: string;
  EvaluationStatus?: string;
}

export interface ICEORecommendation {
  Increment?: string;
  Promotion?: string;
  Justification?: string;
}

export class CEOEmployeeDetailsDto implements ICEOEmployeeDetails {
  constructor(
    public Designation?: string,
    public EmployeeName?: string,
    public JobDescription?: ICEOJobDescription,
    public JoinDate?: string,
  ) {}
}

export class KPICategoryMarkCEODto implements IKPICategoryMarkCEO {
  constructor(
    public KPICategoryMarkCEOId?: string,
    public KPICategoryId?: string,
    public KPICategoryMark?: string,
  ) {}
}

export class KPIDescriptionMarkCEODto implements IKPIDescriptionMarkCEO {
  constructor(
    public KPIDescriptionMarkCEOId?: string,
    public KPIDescriptionId?: string,
    public KPIDescriptionMark?: string,
  ) {}
}

export class CEOEvaluationDto implements ICEOEvaluation {
  constructor(
    public CEOEvaluationId?: string,
    public EvaluationId?: string,
    public EmployeeId?: string,
    public kpiCategories?: IKPICategoryMarkCEO[],
    public kpiDescriptions?: IKPIDescriptionMarkCEO[],
    public IsIncrement?: boolean,
    public IsPromotion?: boolean,
    public Recommendations?: string,
    public EvaluationStatus?: string,
  ) {}
}

export class CEORecommendationDto implements ICEORecommendation {
  constructor(
    public Increment?: string,
    public Promotion?: string,
    public Justification?: string,
  ) {}
}