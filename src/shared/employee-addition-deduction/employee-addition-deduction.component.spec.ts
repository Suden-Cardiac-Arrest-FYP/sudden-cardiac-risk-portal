import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAdditionDeductionComponent } from './employee-addition-deduction.component';

describe('EmployeeAdditionDeductionComponent', () => {
  let component: EmployeeAdditionDeductionComponent;
  let fixture: ComponentFixture<EmployeeAdditionDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAdditionDeductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAdditionDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
