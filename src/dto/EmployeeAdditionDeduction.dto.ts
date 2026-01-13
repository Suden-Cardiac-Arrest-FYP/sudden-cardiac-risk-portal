export interface IEmployeeAdditionDeduction {
    AdditionsOrDeductionsId?: string;
	IsDefault?: boolean;
	Type?: string;
	Name?: string;
	Value?: Float32Array;
	EmployeeId?: string;
	Date?: string;
	Deleted?: boolean;
}

export class EmployeeAdditionDeductionDto implements IEmployeeAdditionDeduction {
    constructor(
        public AdditionsOrDeductionsId?: string,
        public IsDefault?: boolean,
        public Type?: string,
        public Name?: string,
        public Value?: Float32Array,
        public EmployeeId?: string,
        public Date?: string,
        public Deleted?: boolean,
    ) {}
}

export interface EmployeeAdditionDeductionResponse {
  Count: number;
  AdditionsOrDeductions: IEmployeeAdditionDeduction[];
}