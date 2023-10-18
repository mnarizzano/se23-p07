import { Injectable } from '@angular/core';
import { FirebaseService } from './shared/services/firebase.service';
import { Parcheggio } from './shared/services/parking.interface';

@Injectable({
  providedIn: 'root',
})

export class FasceOrarieService {
  private statoParcheggio: { [key: string]: string } = {};
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

  async getStatoFasciaOraria(parcheggioId: string, fasciaOraria: string) {
    try {
      const parcheggio = await this.firebaseService.getParcheggioById(parcheggioId);
  
      if (parcheggio && parcheggio.FasceOrarie && parcheggio.FasceOrarie[fasciaOraria]) {
        return parcheggio.FasceOrarie[fasciaOraria].stato;
      }
  
      return 'disponibile';
    } catch (error) {
      console.error('Errore durante il recupero del parcheggio:', error);
      return 'disponibile'; // Gestione dell'errore
    }
  }

  setStatoFasciaOraria(parcheggio: Parcheggio, fasciaOraria: string, stato: string): void {
    // Chiamata al metodo updateFasciaOraria di FirebaseService
    this.firebaseService.updateFasciaOraria(parcheggio, fasciaOraria, stato)
      .then(() => {
        // Aggiorna lo stato delle fasce orarie nell'oggetto parcheggio.FasceOrarie
        if (parcheggio && parcheggio.FasceOrarie) {
          parcheggio.FasceOrarie[fasciaOraria].stato = stato;
        }
        // Aggiorna lo stato del parcheggio basato sullo stato delle fasce orarie
        this.updateStatoParcheggio(parcheggio.pid);
      })
      .catch(error => {
        console.error('Errore nell\'aggiornamento dello stato della fascia oraria:', error);
      });
  }

  updateStatoParcheggio(parcheggioId: string) {
    this.firebaseService.getParcheggioById(parcheggioId)
      .then((parcheggio) => {
        if (parcheggio && parcheggio.FasceOrarie) {
          const fasceOrarie = parcheggio.FasceOrarie;
  
          // Verifica se tutte le fasce orarie sono "occupate"
          const tutteOccupate = Object.keys(fasceOrarie).every(fascia => fasceOrarie[fascia].stato === 'occupato');
  
          // Imposta lo stato del parcheggio in base al risultato
          parcheggio.state = tutteOccupate ? 'occupato' : 'disponibile';
  
          // Aggiorna il parcheggio nel database
          this.firebaseService.updateParcheggio(parcheggio);
        }
      })
      .catch((error) => {
        console.error('Errore nell\'aggiornamento dello stato del parcheggio:', error);
      });
  }
  
  async getStatoParcheggio(parcheggio: Parcheggio): Promise<string> {
    return parcheggio.state;
  }

  areAllFasceOccupate(fasceOrarie: { [key: string]: { stato: string } }) {
    // Ottieni tutti i valori degli stati delle fasce orarie
    const statiFasce = Object.values(fasceOrarie).map(fascia => fascia.stato);
    
    // Verifica se tutti gli stati sono "occupati"
    return statiFasce.every(stato => stato === 'occupato');
  }

  
    

  
}






