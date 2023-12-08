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
    // Crea spy per i servizi e il ChangeDetectorRef
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
    // Simula una promessa risolta
    const deleteAllParcheggiPromise = Promise.resolve();
    (firebaseService.deleteAllParcheggi as jasmine.Spy).and.returnValue(deleteAllParcheggiPromise); 
    component.onConfirm();
    // Aspettiamo che la promessa venga risolta
    deleteAllParcheggiPromise.then(() => {
      expect(bsModalRef.hide).toHaveBeenCalled();
      expect(firebaseService.deleteAllParcheggi).toHaveBeenCalled();
      expect(locationService.reload).toHaveBeenCalled();
      done(); // Segnala al test che è stato completato
    });
  });

  it('onConfirm should hide the modal and log an error on failure', (done) => {
    const error = 'Test error message';
  
    // Simula una promessa rifiutata
    const deleteAllParcheggiPromise = Promise.reject(error);
    (firebaseService.deleteAllParcheggi as jasmine.Spy).and.returnValue(deleteAllParcheggiPromise);
  
    // Spy sulla funzione console.error
    const consoleErrorSpy = spyOn(console, 'error');
  
    component.onConfirm();
  
    // Aspettiamo che l'operazione asincrona venga completata
    fixture.detectChanges();
  
    setTimeout(() => {
      expect(bsModalRef.hide).toHaveBeenCalled();
  
      // Verifica che console.error sia stato chiamato con un messaggio che inizia con 'Errore durante l'eliminazione di tutti i parcheggi'
      const errorCallArgs = consoleErrorSpy.calls.argsFor(0);
      const errorCallMessage = errorCallArgs.join(' '); // Unisci tutti i parametri in un'unica stringa
      expect(errorCallMessage).toContain("Errore durante l'eliminazione di tutti i parcheggi");
  
      expect(errorCallArgs).toContain('Test error message'); // Verifica che il messaggio di errore effettivo sia stato incluso
  
      done(); // Segnala al test che è stato completato
    }, 0); // Attendiamo un breve lasso di tempo per permettere all'operazione asincrona di completarsi
  });
  
  

});

