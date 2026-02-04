export interface IClinicalInput {
  age?: number;
  sex?: number;
  cp?: number;
  trestbps?: number;
  chol?: number;
  fbs?: number;
  restecg?: number;
  thalach?: number;
  exang?: number;
  oldpeak?: number;
  slope?: number;
  ca?: number;
  thal?: number;
}

export interface IProbability {
  disease?: number;
  no_disease?: number;
}

export interface IFeatureImpact {
  value?: number;
  shap_value?: number;
  impact?: string;
}

export interface IClinicalPrediction {
  prediction?: number;
  prediction_text?: string;
  probability?: IProbability;
  feature_importance?: Record<string, IFeatureImpact>;
  all_features?: Record<string, IFeatureImpact>;
}

export class ClinicalPredictionDto implements IClinicalPrediction {
  constructor(
    public prediction?: number,
    public prediction_text?: string,
    public probability?: IProbability,
    public feature_importance?: Record<string, IFeatureImpact>,
    public all_features?: Record<string, IFeatureImpact>
  ) {}
}
