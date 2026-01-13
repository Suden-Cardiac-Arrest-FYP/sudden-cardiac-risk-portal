import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GMTabComponent } from './gm-tab.component';

describe('GMTabComponent', () => {
  let component: GMTabComponent;
  let fixture: ComponentFixture<GMTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GMTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GMTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
