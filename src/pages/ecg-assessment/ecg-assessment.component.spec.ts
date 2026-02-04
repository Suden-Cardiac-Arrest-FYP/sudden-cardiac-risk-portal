import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcgAssessmentComponent } from './ecg-assessment.component';

describe('EcgAssessmentComponent', () => {
  let component: EcgAssessmentComponent;
  let fixture: ComponentFixture<EcgAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcgAssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcgAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
