import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCompletedComponent } from './payment-completed.component';

describe('PaymentCompletedComponent', () => {
  let component: PaymentCompletedComponent;
  let fixture: ComponentFixture<PaymentCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentCompletedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
