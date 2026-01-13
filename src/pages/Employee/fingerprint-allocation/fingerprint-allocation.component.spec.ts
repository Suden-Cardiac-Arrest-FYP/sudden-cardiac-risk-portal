import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerprintAllocationComponent } from './fingerprint-allocation.component';

describe('FingerprintAllocationComponent', () => {
  let component: FingerprintAllocationComponent;
  let fixture: ComponentFixture<FingerprintAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FingerprintAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FingerprintAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
