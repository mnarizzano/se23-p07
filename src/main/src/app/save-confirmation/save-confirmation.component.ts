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

  confirmSave() {
    this.onConfirm.emit(true); 
    this.bsModalRef.hide(); 
  }

  cancelSave() {
    this.onConfirm.emit(false); 
    this.bsModalRef.hide(); 
  }
}
