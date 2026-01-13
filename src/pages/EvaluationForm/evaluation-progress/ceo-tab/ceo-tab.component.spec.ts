import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CEOTabComponent } from './ceo-tab.component';

describe('CEOTabComponent', () => {
  let component: CEOTabComponent;
  let fixture: ComponentFixture<CEOTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CEOTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CEOTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
