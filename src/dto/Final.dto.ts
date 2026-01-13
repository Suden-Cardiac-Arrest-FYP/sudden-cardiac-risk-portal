export interface IFinalSummaryRow {
  kpiNo?: string | number;
  self?: string | number;
  hod?: string | number;
  gm?: string | number;
  ceo?: string | number;
}

export interface IFinalEvaluationSummary {
  employeeId?: string;
  employeeName?: string;
  evaluationFormId?: string;
  summaryData?: IFinalSummaryRow[];
  totalSelf?: number;
  totalHOD?: number;
  totalGM?: number;
  totalCEO?: number;
  overallAverage?: number;
}

export interface IFinalEvaluationResponse {
  FinalEvaluationId?: string;
  EvaluationId?: string;
  employeeId?: string;
  kpiCategories?: IKPICategoryFinal[];
  kpiDescriptions?: IKPIDescriptionFinal[];
  recommendations?: IRecommendationsFinal;
  IsIncrementHod?: boolean;
  IsIncrementCeo?: boolean;
  IsIncrementGm?: boolean;
  IsPromotionHod?: boolean;
  IsPromotionCeo?: boolean;
  IsPromotionGm?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

export interface IKPICategoryFinal {
  KPICategoryId?: string;
  kpiCategoryMarkSelf?: string;
  kpiCategoryMarkHOD?: string;
  kpiCategoryMarkGM?: string;
  kpiCategoryMarkCEO?: string;
}

export interface IKPIDescriptionFinal {
  KPIDescriptionId?: string;
  kpiDescriptionMarkSelf?: string;
  kpiDescriptionMarkHOD?: string;
  kpiDescriptionMarkGM?: string;
  kpiDescriptionMarkCEO?: string;
}

export interface IRecommendationsFinal {
  recommendationsHOD?: string;
  recommendationsGM?: string;
  recommendationsCEO?: string;
}

export class FinalSummaryRowDto implements IFinalSummaryRow {
  constructor(
    public kpiNo?: string | number,
    public self?: string | number,
    public hod?: string | number,
    public gm?: string | number,
    public ceo?: string | number,
  ) {}
}

export class FinalEvaluationSummaryDto implements IFinalEvaluationSummary {
  constructor(
    public employeeId?: string,
    public employeeName?: string,
    public evaluationFormId?: string,
    public summaryData?: IFinalSummaryRow[],
    public totalSelf?: number,
    public totalHOD?: number,
    public totalGM?: number,
    public totalCEO?: number,
    public overallAverage?: number,
  ) {}
}