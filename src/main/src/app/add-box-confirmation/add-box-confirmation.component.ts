import { Component, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-add-box-confirmation',
  templateUrl: './add-box-confirmation.component.html'

})
export class AddBoxConfirmationComponent {
  public onAddBox: EventEmitter<void> = new EventEmitter<void>(); 

  constructor(public bsModalRef: BsModalRef) {}

  onAddBoxClick() {
    // Emits an event when you click on "Aggiungi"
    this.onAddBox.emit();
    this.bsModalRef.hide();
  }
}

