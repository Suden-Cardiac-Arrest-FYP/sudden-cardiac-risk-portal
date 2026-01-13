export interface IDevice {
  DeviceId?: string;
  Ip?: string;
  Port?: number; 
  Location?: string;
  Status?: boolean; 
  deleted?: boolean;
}

export class DeviceDto implements IDevice {
  constructor(
    public DeviceId?: string,
    public Ip?: string,
    public Port?: number,
    public Location?: string,
    public Status?: boolean,
    public deleted?: boolean,
  ) {}
}

export interface DeviceResponse {
  Count: number;
  Devices: IDevice[]; 
}