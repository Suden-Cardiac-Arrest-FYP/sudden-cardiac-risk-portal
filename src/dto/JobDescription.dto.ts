export interface IKPIDescription {
  KPIDescription?: string;
  KPIDescriptionId?: string;
}

export class KPIDescriptionDto implements IKPIDescription {
  constructor(
    public KPIDescription?: string,
    public KPIDescriptionId?: string,
  ) {}
}

export interface IKPICategory {
  KPICategory?: string;
  KPICategoryId?: string;
  KPIDescription?: IKPIDescription[];
}

export class KPICategoryDto implements IKPICategory {
  constructor(
    public KPICategory?: string,
    public KPICategoryId?: string,
    public KPIDescription?: IKPIDescription[],
  ) {}
}

export interface IJobDescription {
  JDId?: string;
  DesignationId?: string;
  KPICategory?: IKPICategory[];
  Notes?: string;
}

export class JobDescriptionDto implements IJobDescription {
  constructor(
    public JDId?: string,
    public DesignationId?: string,
    public KPICategory?: IKPICategory[],
    public Notes?: string,
  ) {}
}

export interface JobDescriptionResponse {
  Count: number;
  JobDescription: IJobDescription[];
}