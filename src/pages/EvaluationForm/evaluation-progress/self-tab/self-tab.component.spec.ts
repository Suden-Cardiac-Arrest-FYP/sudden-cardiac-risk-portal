import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfTabComponent } from './self-tab.component';

describe('SelfTabComponent', () => {
  let component: SelfTabComponent;
  let fixture: ComponentFixture<SelfTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelfTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelfTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
