import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-save-confirmation',
  templateUrl: './save-confirmation.component.html',
  styleUrls: ['./save-confirmation.component.css']
})
export class SaveConfirmationComponent {
  @Output() onConfirm: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public bsModalRef: BsModalRef) {}

  // Funzione chiamata quando si conferma il salvataggio
  confirmSave() {
    this.onConfirm.emit(true); // Emetti l'evento di conferma
    this.bsModalRef.hide(); // Chiudi la finestra modale
  }

  // Funzione chiamata quando si annulla il salvataggio
  cancelSave() {
    this.onConfirm.emit(false); // Emetti l'evento di annullamento
    this.bsModalRef.hide(); // Chiudi la finestra modale
  }
}
