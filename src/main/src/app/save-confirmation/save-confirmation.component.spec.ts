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
    // Spy sull'evento onConfirm
    const onConfirmSpy = spyOn(component.onConfirm, 'emit');

    component.confirmSave();

    // Verifica che l'evento onConfirm sia stato chiamato con true
    expect(onConfirmSpy).toHaveBeenCalledWith(true);

    // Verifica che il metodo BsModalRef.hide sia stato chiamato
    expect(bsModalRef.hide).toHaveBeenCalled();
  });

  it('cancelSave should emit false and hide the modal', () => {
    // Spy sull'evento onConfirm
    const onConfirmSpy = spyOn(component.onConfirm, 'emit');

    component.cancelSave();

    // Verifica che l'evento onConfirm sia stato chiamato con false
    expect(onConfirmSpy).toHaveBeenCalledWith(false);

    // Verifica che il metodo BsModalRef.hide sia stato chiamato
    expect(bsModalRef.hide).toHaveBeenCalled();
  });
});
