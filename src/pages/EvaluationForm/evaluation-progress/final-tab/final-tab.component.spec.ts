import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalTabComponent } from './final-tab.component';

describe('FinalTabComponent', () => {
  let component: FinalTabComponent;
  let fixture: ComponentFixture<FinalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
