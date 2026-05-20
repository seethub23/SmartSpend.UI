import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionModalComponent } from './add-transaction-modal';

describe('AddTransactionModalComponent', () => {
  let component: AddTransactionModalComponent;
  let fixture: ComponentFixture<AddTransactionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTransactionModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTransactionModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
