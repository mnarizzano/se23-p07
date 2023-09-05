import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBoxConfirmationComponent } from './add-box-confirmation.component';

describe('AddBoxConfirmationComponent', () => {
  let component: AddBoxConfirmationComponent;
  let fixture: ComponentFixture<AddBoxConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddBoxConfirmationComponent]
    });
    fixture = TestBed.createComponent(AddBoxConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
