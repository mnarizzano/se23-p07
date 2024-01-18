// delete-all-confirmation.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FirebaseService } from '../shared/services/firebase.service';
import { LocationService } from '../shared/services/location.service';

@Component({
  selector: 'app-delete-all-confirmation',
  templateUrl: './delete-all-confirmation.component.html',
})

  // For the management of the whole deletion of all the parking slots
export class DeleteAllConfirmationComponent {
  constructor(public bsModalRef: BsModalRef, private firebaseService: FirebaseService, private cdr: ChangeDetectorRef, private locationService: LocationService) {}

  // To hide the window
  onCancel() {
    this.bsModalRef.hide(); 
  }

  // To confirm the deletion of all the parking slots
  onConfirm() {
    this.bsModalRef.hide(); 
    this.firebaseService.deleteAllParcheggi().then(() => {
      console.log('Tutti i parcheggi eliminati con successo.');
      this.locationService.reload();
    }).catch(error => {
      console.error('Errore durante l\'eliminazione di tutti i parcheggi:', error);
    });
  }
}
