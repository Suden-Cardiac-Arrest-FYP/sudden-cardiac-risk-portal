// Updated DTO interfaces to match the component structure
export interface IDaySchedule {
  dayName: string;
  startTime: string | null;
  endTime: string | null;
  isActive: boolean;
}

export interface IWeekSchedule {
  Days: IDaySchedule[];
}

export interface IShift {
  ShiftId?: string;
  Name?: string;
  IsDefault?: boolean;
  Location?: string;
  Weeks?: IWeekSchedule[];
}

export class ShiftDto implements IShift {
  constructor(
    public ShiftId?: string,
    public Name?: string,
    public IsDefault?: boolean,
    public Location?: string,
    public Weeks?: IWeekSchedule[]
  ) {}
}

export interface ShiftResponse {
  Count: number;
  Shift: IShift[];
}