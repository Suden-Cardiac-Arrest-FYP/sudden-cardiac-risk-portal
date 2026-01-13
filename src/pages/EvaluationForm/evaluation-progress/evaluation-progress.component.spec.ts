import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProgressComponent } from './evaluation-progress.component';

describe('EvaluationProgressComponent', () => {
  let component: EvaluationProgressComponent;
  let fixture: ComponentFixture<EvaluationProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
