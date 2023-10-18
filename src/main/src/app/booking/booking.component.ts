import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FirebaseService } from '../shared/services/firebase.service';
import { FasceOrarieService } from '../fasce-orarie.service';
import { interval } from 'rxjs';
import { Parcheggio } from '../shared/services/parking.interface';


@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {


  @Input() parcheggio!: Parcheggio;
  @Input() fasceOrarieParcheggio!: { [key: string]: { stato: string } };
  @Input() parcheggioId: string = '';
  @Output() onConferma = new EventEmitter<boolean>();

  fasceSelezionate: string[] = [];
  selectedFasce: string[] = [];

  constructor(
   public bsModalRef: BsModalRef,
   public firebaseService: FirebaseService, 
   public fasceOrarieService: FasceOrarieService,) {
    /*
    interval(86400000).subscribe(() => { // Per aggiornare lo stato delle fasce orarie ogni giorno 
      this.turnFasceDisponibili();
    }); */
   }
   ngOnInit(): void {
    this.firebaseService.getFasceOrarieParcheggio(this.parcheggio.pid).then(fasceOrarie => {
      this.parcheggio.FasceOrarie = fasceOrarie; // Assegna i dati a parcheggio.FasceOrarie
    });
  }

  onConfermaClick(result: boolean) {
    this.onConferma.emit(result);
    this.bsModalRef.hide();
  }

  turnFasceDisponibili(parcheggio: Parcheggio): void {
    if (parcheggio && parcheggio.FasceOrarie) {
      const fasceOrarie = parcheggio.FasceOrarie;
      for (const fasciaOraria in fasceOrarie) {
        if (fasceOrarie.hasOwnProperty(fasciaOraria)) {
          fasceOrarie[fasciaOraria].stato = 'disponibile';
        }
      }
    }
  }
  
  updateSelectedFasce(fascia: string) {
    if (this.selectedFasce.includes(fascia)) {
      this.selectedFasce = this.selectedFasce.filter(item => item !== fascia);
    } else {
      this.selectedFasce.push(fascia);
    }
  }

  async confermaPrenotazione() {  
    for (const fascia of this.selectedFasce) {
      await this.firebaseService.updateFasciaOraria(this.parcheggio, fascia, 'occupato');
      // Ora chiama la funzione per aggiornare lo stato nell'oggetto parcheggio.FasceOrarie
      this.fasceOrarieService.setStatoFasciaOraria(this.parcheggio, fascia, 'occupato');
    }
    if (this.fasceOrarieService.areAllFasceOccupate(this.parcheggio.FasceOrarie)) {
      this.updateStateToOccupato(this.parcheggio);
    }
    this.onConfermaClick(true);
    this.chiudiFinestraModale();
  }

  updateStateToOccupato(parcheggio: Parcheggio) {
    console.log('sto chiamando la funzione updateStateToOccupato');
    const parcheggioId = parcheggio.pid;
    parcheggio.state = 'occupato';
    // Aggiorna lo stato nel database
    this.firebaseService.updateParcheggioState(parcheggio.pid, 'occupato');
  }

  chiudiFinestraModale() {
     this.onConfermaClick(false);
     this.bsModalRef.hide();
  }




  
  
  

}

