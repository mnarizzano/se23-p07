import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';



@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent {
  @Output() onClose = new EventEmitter<boolean>();

  constructor(public bsModalRef: BsModalRef) {}

  onCloseClick(result: boolean) {
    this.onClose.emit(result);
    this.bsModalRef.hide();
  }
}
