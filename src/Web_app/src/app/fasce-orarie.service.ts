import { Injectable } from '@angular/core';
import { FirebaseService } from './shared/services/firebase.service';
import { Parcheggio } from './shared/services/parking.interface';

@Injectable({
  providedIn: 'root',
})

  // Class for managing the time slots of the parking slots
export class FasceOrarieService {
  fasceOrarie: { [key: string]: { stato: string} } = {

    '09:00-10:00': { stato: 'disponibile'},
    '10:00-11:00': { stato: 'disponibile'},
    '11:00-12:00': { stato: 'disponibile'},
    '12:00-13:00': { stato: 'disponibile'},
    '13:00-14:00': { stato: 'disponibile'},
    '14:00-15:00': { stato: 'disponibile'},
    '15:00-16:00': { stato: 'disponibile'},
    '16:00-17:00': { stato: 'disponibile'},
    '17:00-18:00': { stato: 'disponibile'},
    '18:00-19:00': { stato: 'disponibile'},
  };

  constructor(private firebaseService: FirebaseService) {}

  getFasceOrarie(): { [key: string]: { stato: string} } {
    return this.fasceOrarie;
  }

// get a state of a time slot
  async getStatoFasciaOraria(parcheggioId: string, fasciaOraria: string) {
    try {
      const parcheggio = await this.firebaseService.getParcheggioById(parcheggioId);
  
      if (parcheggio && parcheggio.FasceOrarie && parcheggio.FasceOrarie[fasciaOraria]) {
        return parcheggio.FasceOrarie[fasciaOraria].stato;
      }
  
      return 'disponibile';
    } catch (error) {
      console.error('Errore durante il recupero del parcheggio:', error);
      return 'disponibile'; 
    }
  }

  // set the state of a time slot
  setStatoFasciaOraria(parcheggio: Parcheggio, fasciaOraria: string, stato: string): void {
    this.firebaseService.updateFasciaOraria(parcheggio, fasciaOraria, stato)
      .then(() => {
        if (parcheggio && parcheggio.FasceOrarie) {
          parcheggio.FasceOrarie[fasciaOraria].stato = stato;
        }
        this.updateStatoParcheggio(parcheggio.pid);
      })
      .catch(error => {
        console.error('Errore nell\'aggiornamento dello stato della fascia oraria:', error);
      });
  }

  // update the state of a PS to "occupato" if all the relative time slots have the state "occupato"
  updateStatoParcheggio(parcheggioId: string) {
    this.firebaseService.getParcheggioById(parcheggioId)
      .then((parcheggio) => {
        if (parcheggio && parcheggio.FasceOrarie) {
          const fasceOrarie = parcheggio.FasceOrarie;
          const tutteOccupate = Object.keys(fasceOrarie).every(fascia => fasceOrarie[fascia].stato === 'occupato');
          parcheggio.state = tutteOccupate ? 'occupato' : 'disponibile';
          this.firebaseService.updateParcheggio(parcheggio);
        }
      })
      .catch((error) => {
        console.error('Errore nell\'aggiornamento dello stato del parcheggio:', error);
      });
  }
  
  // get the state of a parking slot
  async getStatoParcheggio(parcheggio: Parcheggio): Promise<string> {
    return parcheggio.state;
  }


  // checks if all the time slots of a PS have the state "occupato"
  areAllFasceOccupate(fasceOrarie: { [key: string]: { stato: string } }) {
    const statiFasce = Object.values(fasceOrarie).map(fascia => fascia.stato);
    return statiFasce.every(stato => stato === 'occupato');
  }
  
}






