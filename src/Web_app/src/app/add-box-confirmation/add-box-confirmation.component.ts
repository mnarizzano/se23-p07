import { Component, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-add-box-confirmation',
  templateUrl: './add-box-confirmation.component.html'

})

// Class for the management of the confirmation of adding a parking on the map 
export class AddBoxConfirmationComponent {
  public onAddBox: EventEmitter<void> = new EventEmitter<void>(); 

  constructor(public bsModalRef: BsModalRef) {}

  onAddBoxClick() {
    // Emits an event when you click on "Aggiungi"
    this.onAddBox.emit();
    this.bsModalRef.hide();
  }
}

