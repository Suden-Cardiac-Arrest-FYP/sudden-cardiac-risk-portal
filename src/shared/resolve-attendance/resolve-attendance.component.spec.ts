import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolveAttendanceComponent } from './resolve-attendance.component';

describe('ResolveAttendanceComponent', () => {
  let component: ResolveAttendanceComponent;
  let fixture: ComponentFixture<ResolveAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolveAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolveAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
