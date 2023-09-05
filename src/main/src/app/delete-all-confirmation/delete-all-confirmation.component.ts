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
    this.bsModalRef.hide(); // Chiudi la finestra di conferma senza eliminare i parcheggi
  }

  onConfirm() {
    this.bsModalRef.hide(); // Chiudi la finestra di conferma
    // Chiamare la funzione deleteAllParcheggi() per eliminare tutti i parcheggi
    this.firebaseService.deleteAllParcheggi().then(() => {
      console.log('Tutti i parcheggi eliminati con successo.');
      location.reload();
      // Puoi gestire ulteriori azioni o aggiornamenti qui, se necessario.
    }).catch(error => {
      console.error('Errore durante l\'eliminazione di tutti i parcheggi:', error);
      // Gestisci eventuali errori qui, se necessario.
    });
  }
}
