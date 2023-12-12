import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteConfirmationComponent } from './delete-confirmation.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

describe('DeleteConfirmationComponent', () => {
  let component: DeleteConfirmationComponent;
  let fixture: ComponentFixture<DeleteConfirmationComponent>;
  let bsModalRef: BsModalRef;

  beforeEach(() => {
    bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
    TestBed.configureTestingModule({
      declarations: [DeleteConfirmationComponent], 
      providers: [ {provide: BsModalRef, useValue: bsModalRef }, ]
    });

    fixture = TestBed.createComponent(DeleteConfirmationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('onCloseClick should emit the result and hide the modal', () => {
    const emitSpy = spyOn(component.onClose, 'emit');
    component.onCloseClick(true);
    expect(emitSpy).toHaveBeenCalledWith(true);
    expect(bsModalRef.hide).toHaveBeenCalled();
  });


});

