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
export class BookingComponent {
  parcheggio: Parcheggio | null = null;

  fasceOrarie: any[] = [
    { oraInizio: '09:00', oraFine: '10:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '10:00', oraFine: '11:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '11:00', oraFine: '12:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '12:00', oraFine: '13:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '13:00', oraFine: '14:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '14:00', oraFine: '15:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '15:00', oraFine: '16:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '16:00', oraFine: '17:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '17:00', oraFine: '18:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    { oraInizio: '18:00', oraFine: '19:00', stato: 'disponibile', selezionata: false, parcheggio: null },
    // Aggiungi altre fasce orarie
  ];
  //@Output() onConferma: EventEmitter<string[]> = new EventEmitter<string[]>();

  @Input() parcheggioId: string = '';
  @Output() onConferma = new EventEmitter<boolean>();
  @Output() tutteOccupate = new EventEmitter<boolean>();

  //private tutteOccupate: boolean = false; // Variabile per memorizzare lo stato delle fasce orarie

  constructor(
   public bsModalRef: BsModalRef,
   private firebaseService: FirebaseService, 
   public fasceOrarieService: FasceOrarieService,) {
    
    interval(86400000).subscribe(() => { // Per aggiornare lo stato delle fasce orarie ogni giorno 
      this.turnFasceDisponibili();
    });
   }

   

  onConfermaClick(result: boolean) {
    this.onConferma.emit(result);
    this.bsModalRef.hide();
  }

  onTutteOccupate(result: boolean){
    this.tutteOccupate.emit(result);
    this.bsModalRef.hide();
  }

  areFasceOrarieSelezionate(): boolean {
    return this.fasceOrarie.some(fascia => fascia.selezionata);
  }
  
  turnFasceDisponibili(){
    this.fasceOrarie.forEach(fascia => {
      this.fasceOrarieService.setStatoFasciaOraria(
        this.parcheggioId,
        fascia.oraInizio,
        fascia.oraFine,
        'disponibile'
      );
    });
  }

  sonoTutteOccupatePerParcheggio(parcheggioId: string): boolean {
    // Verifica se tutte le fasce orarie per il parcheggio specifico sono "occupate"
    return this.fasceOrarie.some((fascia) => {
      return fascia.parcheggioId === parcheggioId && fascia.stato !== 'occupato';
    });
  }



  confermaPrenotazione() {
    // Gestisci la conferma della prenotazione e le fasce orarie selezionate
    const fasceSelezionate = this.fasceOrarie.filter(fascia => fascia.selezionata);
    console.log('Fasce orarie selezionate:', fasceSelezionate);
    // const parcheggioDaAggiornare = this.initialStateFromMap; // Usa initialStateFromMap come parcheggioDaAggiornare
   // this.sharedService.updateState(parcheggioDaAggiornare);
   if (this.areFasceOrarieSelezionate() ){
    fasceSelezionate.forEach(fascia => {
      this.fasceOrarieService.setStatoFasciaOraria(
        this.parcheggioId,
        fascia.oraInizio,
        fascia.oraFine,
        'occupato'
      );
    });
    this.onConfermaClick(true);
    const sonoTutteOccupate = this.sonoTutteOccupatePerParcheggio(this.parcheggioId);
    if (sonoTutteOccupate){
      this.onTutteOccupate(true);
    }
    //console.log(sonoTutteOccupate);
    /*if(sonoTutteOccupate){
      console.log('sono tutte occupate');
      this.onTutteOccupate(true);
    }*/
   }
   this.chiudiFinestraModale();
  }

  chiudiFinestraModale() {
    this.onConfermaClick(false);
     this.bsModalRef.hide();
  }

  liberaFasciaOraria(fascia: any) {
    fascia.parcheggio = null; // Reimposta il parcheggio a null
    this.fasceOrarieService.setStatoFasciaOraria(
      this.parcheggioId,
      fascia.oraInizio,
      fascia.oraFine,
      'disponibile'
    );
  }

/*
  checkState(){
    this.fasceOrarie.forEach(fascia => {
      const stato_fascia = this.fasceOrarieService.getStatoFasciaOraria(
        fascia.oraInizio,
        fascia.oraFine)
      if (stato_fascia === 'occupato'){
        this.onConfermaClick(true); // true: sono tutte occupate
      }

    })
  }*/
  /*
  checkTutteOccupate(): boolean {
    return this.fasceOrarie.every(fascia => fascia.stato === 'occupato');
  }*/
  
  
  

}
