export interface IECGResult {
  predicted_class?: string;
  confidence?: number;
  class_scores?: Record<string, number>;
}

export interface IECGPrediction {
  id?: string;
  image_name?: string;
  model?: string;
  result?: IECGResult;
  created_at?: string;
}

export class ECGPredictionDto implements IECGPrediction {
  constructor(
    public id?: string,
    public image_name?: string,
    public model?: string,
    public result?: IECGResult,
    public created_at?: string
  ) {}
}
