import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FasceOrarieService {
  private tutteOccupate: boolean = false;
  private statoFasceOrarie: { [key: string]: string } = {};
  constructor() {
    // Carica lo stato delle fasce orarie da localStorage al momento della creazione del servizio
    const statoSalvato = localStorage.getItem('statoFasceOrarie');
    if (statoSalvato) {
      this.statoFasceOrarie = JSON.parse(statoSalvato);
    }
  }

  getStatoFasciaOraria(parcheggioId: string, oraInizio: string, oraFine: string): string {
    const key = `${parcheggioId}-${oraInizio}-${oraFine}`;
    return this.statoFasceOrarie[key] || 'disponibile';
  }  

  /*
  getStatoFasciaOraria(oraInizio: string, oraFine: string): string {
    const key = `${oraInizio}-${oraFine}`;
    return this.statoFasceOrarie[key] || 'disponibile';
  } */

  setStatoFasciaOraria(parcheggioId: string, oraInizio: string, oraFine: string, stato: string): void {
    const key = `${parcheggioId}-${oraInizio}-${oraFine}`;
    this.statoFasceOrarie[key] = stato;
    // Salva lo stato delle fasce orarie in localStorage
    localStorage.setItem('statoFasceOrarie', JSON.stringify(this.statoFasceOrarie));
  }

  /*
  setStatoFasciaOraria(oraInizio: string, oraFine: string, stato: string): void {
    const key = `${oraInizio}-${oraFine}`;
    this.statoFasceOrarie[key] = stato;
    // Salva lo stato delle fasce orarie in localStorage
    localStorage.setItem('statoFasceOrarie', JSON.stringify(this.statoFasceOrarie));
  }
  */

  sonoTutteOccupate(): boolean {
    // Verifica se tutte le fasce orarie sono "occupate"
    return this.tutteOccupate = Object.values(this.statoFasceOrarie).every(stato => stato === 'occupato');
  }


  setTutteOccupate(value: boolean) {
    this.tutteOccupate = value;
  }

  getTutteOccupate() {
    return this.tutteOccupate;
  }

/*
  sonoTutteOccupatePerParcheggio(parcheggioId: string): boolean {
    // Verifica se tutte le fasce orarie per il parcheggio specifico sono "occupate"
    return this.fasceOrarie.some((fascia) => {
      return fascia.parcheggioId === parcheggioId && fascia.stato !== 'occupato';
    });
  }*/
  
  
}
