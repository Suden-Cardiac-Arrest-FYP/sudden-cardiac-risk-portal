import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveLeaveOrAttendanceComponent } from './remove-leave-or-attendance.component';

describe('RemoveLeaveOrAttendanceComponent', () => {
  let component: RemoveLeaveOrAttendanceComponent;
  let fixture: ComponentFixture<RemoveLeaveOrAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveLeaveOrAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveLeaveOrAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
