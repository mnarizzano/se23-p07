import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-save-confirmation',
  templateUrl: './save-confirmation.component.html',
  styleUrls: ['./save-confirmation.component.css']
})

  // Class for managing the saving of parking slots 
export class SaveConfirmationComponent {
  @Output() onConfirm: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public bsModalRef: BsModalRef) {}

  // Manages the click on the confirm button
  confirmSave() {
    this.onConfirm.emit(true); 
    this.bsModalRef.hide(); 
  }

  // Manages the click on the cancel button
  cancelSave() {
    this.onConfirm.emit(false); 
    this.bsModalRef.hide(); 
  }
}
