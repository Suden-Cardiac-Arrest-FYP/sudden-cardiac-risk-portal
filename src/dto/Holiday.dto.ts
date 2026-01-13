export interface IHoliday {
  HolidayId?: string;
  HolidayName?: string;
  Description?: string;
  Category?: CategoryItem[];
  Date?: string;
}

export class HolidayDto implements IHoliday {
  constructor(
    public HolidayId?: string,
    public HolidayName?: string,
    public Description?: string,
    public Category?: CategoryItem[],
    public Date?: string,
  ) {}
}

export interface HolidayResponse {
  Count: number;
  Holiday: IHoliday[];
}

interface CategoryItem {
    label: string;
    value: string;
}