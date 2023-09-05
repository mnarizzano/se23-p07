import { Component, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-add-box-confirmation',
  templateUrl: './add-box-confirmation.component.html'

})
export class AddBoxConfirmationComponent {
  public onAddBox: EventEmitter<void> = new EventEmitter<void>(); // Definisci un evento

  constructor(public bsModalRef: BsModalRef) {}

  onAddBoxClick() {
    // Emetti l'evento quando si fa clic su "Aggiungi"
    this.onAddBox.emit();
    this.bsModalRef.hide(); // Chiudi il modale
  }
}

