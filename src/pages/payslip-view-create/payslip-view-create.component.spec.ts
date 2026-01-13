import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipViewCreateComponent } from './payslip-view-create.component';

describe('PayslipViewCreateComponent', () => {
  let component: PayslipViewCreateComponent;
  let fixture: ComponentFixture<PayslipViewCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayslipViewCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayslipViewCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
