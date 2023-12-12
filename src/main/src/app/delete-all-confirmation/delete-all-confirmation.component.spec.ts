import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteAllConfirmationComponent } from './delete-all-confirmation.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FirebaseService } from '../shared/services/firebase.service';
import { ChangeDetectorRef } from '@angular/core';
import { LocationService } from '../shared/services/location.service';

describe('DeleteAllConfirmationComponent', () => {
  let component: DeleteAllConfirmationComponent;
  let fixture: ComponentFixture<DeleteAllConfirmationComponent>;
  let bsModalRef: BsModalRef;
  let firebaseService: FirebaseService;
  let cdr: ChangeDetectorRef;
  let locationService: LocationService;

  beforeEach(() => {
    bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
    firebaseService = jasmine.createSpyObj('FirebaseService', ['deleteAllParcheggi']);
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    locationService = jasmine.createSpyObj('LocationService', ['reload']);

    TestBed.configureTestingModule({
      declarations: [DeleteAllConfirmationComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: FirebaseService, useValue: firebaseService },
        { provide: ChangeDetectorRef, useValue: cdr },
        { provide: LocationService, useValue: locationService},
      ],
    });

    fixture = TestBed.createComponent(DeleteAllConfirmationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('onCancel should hide the modal', () => {
    component.onCancel();
    expect(bsModalRef.hide).toHaveBeenCalled();
  });

  it('onConfirm should hide the modal and call deleteAllParcheggi', (done) => {
    const deleteAllParcheggiPromise = Promise.resolve();
    (firebaseService.deleteAllParcheggi as jasmine.Spy).and.returnValue(deleteAllParcheggiPromise); 
    component.onConfirm();
    deleteAllParcheggiPromise.then(() => {
      expect(bsModalRef.hide).toHaveBeenCalled();
      expect(firebaseService.deleteAllParcheggi).toHaveBeenCalled();
      expect(locationService.reload).toHaveBeenCalled();
      done(); 
    });
  });

  it('onConfirm should hide the modal and log an error on failure', (done) => {
    const error = 'Test error message';
  
    const deleteAllParcheggiPromise = Promise.reject(error);
    (firebaseService.deleteAllParcheggi as jasmine.Spy).and.returnValue(deleteAllParcheggiPromise);
  
    const consoleErrorSpy = spyOn(console, 'error');
  
    component.onConfirm();
  
    fixture.detectChanges();
  
    setTimeout(() => {
      expect(bsModalRef.hide).toHaveBeenCalled();
  
      const errorCallArgs = consoleErrorSpy.calls.argsFor(0);
      const errorCallMessage = errorCallArgs.join(' '); 
      expect(errorCallMessage).toContain("Errore durante l'eliminazione di tutti i parcheggi");
  
      expect(errorCallArgs).toContain('Test error message'); 
  
      done(); 
    }, 0); 
  });
  
  

});

