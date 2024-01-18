import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaveConfirmationComponent } from './save-confirmation.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

describe('SaveConfirmationComponent', () => {
  let component: SaveConfirmationComponent;
  let fixture: ComponentFixture<SaveConfirmationComponent>;
  let bsModalRef: jasmine.SpyObj<BsModalRef>;

  beforeEach(() => {
    bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
    
    TestBed.configureTestingModule({
      declarations: [SaveConfirmationComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
      ],
    });

    fixture = TestBed.createComponent(SaveConfirmationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('confirmSave should emit true and hide the modal', () => {
    const onConfirmSpy = spyOn(component.onConfirm, 'emit');
    component.confirmSave();
    expect(onConfirmSpy).toHaveBeenCalledWith(true);
    expect(bsModalRef.hide).toHaveBeenCalled();
  });

  it('cancelSave should emit false and hide the modal', () => {
    const onConfirmSpy = spyOn(component.onConfirm, 'emit');
    component.cancelSave();
    expect(onConfirmSpy).toHaveBeenCalledWith(false);
    expect(bsModalRef.hide).toHaveBeenCalled();
  });
  
});
