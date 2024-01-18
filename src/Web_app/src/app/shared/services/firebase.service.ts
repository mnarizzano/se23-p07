import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { firebaseConfig } from '../../../environments/environment'; 
import { Parcheggio } from './parking.interface';
import { SHA256 } from 'crypto-js';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root',
  })

    // Manages the interaction with the firebase database 
  export class FirebaseService {

    constructor() {
      firebase.initializeApp(firebaseConfig);
    }

    // updates the time slots of each parking slot
    async updateFasciaOraria(parcheggio: Parcheggio, fasciaOraria: string, stato: string) {
      try {
        const fasciaKey = `${fasciaOraria}`;
        const parcheggioRef = firebase.database().ref(`parcheggi/${parcheggio.pid}/FasceOrarie/${fasciaKey}`);
        // Update state in database 
        await parcheggioRef.update({ stato });
        console.log(`Stato della fascia oraria ${fasciaKey} aggiornato a ${stato}`);
        if (parcheggio && parcheggio.FasceOrarie) {
          parcheggio.FasceOrarie[fasciaKey].stato = stato;
        }
      } catch (error) {
        console.error('Errore nell\'aggiornamento dello stato della fascia oraria:', error);
      }
    }

    // get the time slots of a PS
    async getFasceOrarieParcheggio(parcheggioId: string): Promise<any> {
      const fasceOrarieRef = firebase.database().ref(`parcheggi/${parcheggioId}/FasceOrarie`);
      const snapshot = await fasceOrarieRef.once('value');
      return snapshot.val();
    }

    // generates a unique PS identifier
    generateParcheggioID(coordinate: { lat: number, lng: number }): string {
      const latStr = coordinate.lat.toString();
      const lngStr = coordinate.lng.toString();
      const hashed = SHA256(latStr + lngStr).toString();
      return `parcheggio_${hashed}`;
    }

    // Add parking to database 
    addParcheggio(parcheggio: Parcheggio): Promise<void> {
      const parcheggiRef = firebase.database().ref('parcheggi');
      const id = this.generateParcheggioID(parcheggio.coordinate);
      parcheggio.pid = id;
      return parcheggiRef.child(id).set(parcheggio).then(() => {
      console.log('Parcheggio aggiunto e salvato su Firebase:', parcheggio);
    });
    }

    // Get parkings from database 
  async getParcheggi(): Promise<Parcheggio[]> {
    const parcheggiRef = firebase.database().ref('parcheggi');
    return parcheggiRef.once('value').then((snapshot) => {
      const parcheggi: Parcheggio[] = [];
      snapshot.forEach((childSnapshot) => {
        const parcheggio = childSnapshot.val();
        parcheggi.push(parcheggio);
      });
      return parcheggi;
    });
  }

    // Delete PS 
  deleteParcheggio(parcheggio: Parcheggio): Promise<void> {
    if (!parcheggio || !parcheggio.pid) {
      console.error('ID del parcheggio non valido o mancante.');
      return Promise.reject('ID del parcheggio non valido o mancante.');
    }
    const parcheggiRef = firebase.database().ref('parcheggi');
    const parcheggioRef = parcheggiRef.child(parcheggio.pid);
    return parcheggioRef.remove().then(() => {
      console.log('Parcheggio eliminato da Firebase:', parcheggio.pid);
    });
  }

    // update a PS state
  async updateParcheggioState(pid: string, newState: string) {
    try {
      const parcheggioRef = firebase.database().ref(`parcheggi/${pid}`);
      const snapshot = await parcheggioRef.once('value');
      const parcheggio = snapshot.val();
      parcheggio.state = newState;
      await parcheggioRef.update(parcheggio);  
      console.log(`Stato del parcheggio ${pid} aggiornato a ${newState}`);
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato del parcheggio:', error);
    }
  }

    // update a parking slot
  updateParcheggio(parcheggio: Parcheggio) {
    const parcheggioRef = firebase.database().ref(`parcheggi/${parcheggio.pid}`);
    return parcheggioRef.update(parcheggio);
  }

    // deletes all the parking slots from the database
  async deleteAllParcheggi() {
  try {
    const parcheggiSalvati = await this.getParcheggi(); 
    const deletePromises: Promise<void>[] = [];

    parcheggiSalvati.forEach((parcheggio) => {
      deletePromises.push(this.deleteParcheggio(parcheggio));
    });
    await Promise.all(deletePromises);

    console.log('Tutti i parcheggi sono stati eliminati con successo.');
  } catch (error) {
    console.error('Errore durante l\'eliminazione dei parcheggi:', error);
  }
  

}

    // get a parking slot filtering the ID
getParcheggioById(parcheggioId: string): Promise<Parcheggio | null> {
  const parcheggiRef = firebase.database().ref('parcheggi').child(parcheggioId);
  return parcheggiRef.once('value').then((snapshot) => {
    const parcheggio = snapshot.val();
    return parcheggio as Parcheggio;
  });
}

}
  

  
