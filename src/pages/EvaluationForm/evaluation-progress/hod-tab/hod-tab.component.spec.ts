import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HODTabComponent } from './hod-tab.component';

describe('HODTabComponent', () => {
  let component: HODTabComponent;
  let fixture: ComponentFixture<HODTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HODTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HODTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
