import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrePayslipReviewComponent } from './pre-payslip-review.component';

describe('PrePayslipReviewComponent', () => {
  let component: PrePayslipReviewComponent;
  let fixture: ComponentFixture<PrePayslipReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrePayslipReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrePayslipReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
