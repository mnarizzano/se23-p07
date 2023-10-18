import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AddBoxConfirmationComponent } from './add-box-confirmation.component';

describe('AddBoxConfirmationComponent', () => {
  let component: AddBoxConfirmationComponent;
  let fixture: ComponentFixture<AddBoxConfirmationComponent>;
  let bsModalRef: BsModalRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddBoxConfirmationComponent],
      providers: [BsModalRef],
    });
    fixture = TestBed.createComponent(AddBoxConfirmationComponent);
    component = fixture.componentInstance;
    bsModalRef = TestBed.inject(BsModalRef);
    // fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit "onAddBox" event and hide modal on button click', () => {
    spyOn(component.onAddBox, 'emit');
    spyOn(bsModalRef, 'hide');

    component.onAddBoxClick();

    expect(component.onAddBox.emit).toHaveBeenCalled();
    expect(bsModalRef.hide).toHaveBeenCalled();
  });
  
});
