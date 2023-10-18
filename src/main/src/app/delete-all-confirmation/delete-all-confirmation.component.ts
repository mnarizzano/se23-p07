// delete-all-confirmation.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FirebaseService } from '../shared/services/firebase.service';

@Component({
  selector: 'app-delete-all-confirmation',
  templateUrl: './delete-all-confirmation.component.html',
})
export class DeleteAllConfirmationComponent {
  constructor(public bsModalRef: BsModalRef, private firebaseService: FirebaseService, private cdr: ChangeDetectorRef) {}

  onCancel() {
    this.bsModalRef.hide(); // Chiude la finestra di conferma senza eliminare i parcheggi
  }

  onConfirm() {
    // Chiude la finestra di conferma
    this.bsModalRef.hide(); 
    // Elimina tutti i parcheggi
    this.firebaseService.deleteAllParcheggi().then(() => {
      console.log('Tutti i parcheggi eliminati con successo.');
      location.reload();
    }).catch(error => {
      console.error('Errore durante l\'eliminazione di tutti i parcheggi:', error);
    });
  }
}
