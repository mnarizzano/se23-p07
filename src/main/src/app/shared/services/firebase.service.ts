// firebase.service.ts

import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { firebaseConfig } from '../../../environments/environment'; 
import { Parcheggio } from './parking.interface';
import { SHA256 } from 'crypto-js';
import { MapComponent } from '../../mappa/map.component';

@Injectable({
    providedIn: 'root',
  })
  export class FirebaseService {
    constructor() {
      firebase.initializeApp(firebaseConfig);
    }
  
    generateParcheggioID(coordinate: { lat: number, lng: number }): string {
      const latStr = coordinate.lat.toString();
      const lngStr = coordinate.lng.toString();
      // Calcola l'hash SHA-256 delle coordinate
      const hashed = SHA256(latStr + lngStr).toString();
      return `parcheggio_${hashed}`;
    }

    // Aggiungi un parcheggio al database Firebase
    addParcheggio(parcheggio: Parcheggio): Promise<void> {
      const parcheggiRef = firebase.database().ref('parcheggi');

      // Genera un ID univoco 
      const id = this.generateParcheggioID(parcheggio.coordinate);
      parcheggio.pid = id;

    // Aggiungi l'ID al parcheggio prima di salvarlo
    parcheggio.pid = id;
      
     // Salva il parcheggio nel database
    return parcheggiRef.child(id).set(parcheggio).then(() => {
      console.log('Parcheggio aggiunto e salvato su Firebase:', parcheggio);
    });
  }

    // Recupera tutti i parcheggi dal database Firebase
  getParcheggi(): Promise<Parcheggio[]> {
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

  deleteParcheggio(parcheggio: Parcheggio): Promise<void> {
    if (!parcheggio || !parcheggio.pid) {
      // Gestisci il caso in cui parcheggio.uid sia mancante o non valido
      console.error('ID del parcheggio non valido o mancante.');
      return Promise.reject('ID del parcheggio non valido o mancante.');
    }
    const parcheggiRef = firebase.database().ref('parcheggi');
   
    // Utilizza il metodo child per specificare il nodo da eliminare
    const parcheggioRef = parcheggiRef.child(parcheggio.pid);
  
    // Rimuovi il parcheggio dal database Firebase
    return parcheggioRef.remove().then(() => {
      console.log('Parcheggio eliminato da Firebase:', parcheggio.pid);
    });
  }
  

  async updateParcheggioState(pid: string, newState: string) {
    try {
      // Ottieni il riferimento al nodo del database per il parcheggio specifico
      const parcheggioRef = firebase.database().ref(`parcheggi/${pid}`);
  
      // Leggi il parcheggio dal database
      const snapshot = await parcheggioRef.once('value');
      const parcheggio = snapshot.val();
  
      // Aggiorna lo stato del parcheggio
      parcheggio.state = newState;
  
      // Effettua l'aggiornamento nel database
      await parcheggioRef.update(parcheggio);  
      console.log(`Stato del parcheggio ${pid} aggiornato a ${newState}`);
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato del parcheggio:', error);
    }
  }

  // Aggiungi questa funzione per aggiornare il parcheggio nel database
  updateParcheggio(parcheggio: Parcheggio) {
    // Ottieni un riferimento al nodo specifico del database che contiene il tuo parcheggio
    const parcheggioRef = firebase.database().ref(`parcheggi/${parcheggio.pid}`);


    // Effettua l'aggiornamento nel database
    return parcheggioRef.update(parcheggio);
  }


  async deleteAllParcheggi() {
  try {
    const parcheggiSalvati = await this.getParcheggi(); // Ottieni tutti i parcheggi salvati
    const deletePromises: Promise<void>[] = [];

    parcheggiSalvati.forEach((parcheggio) => {
      // Aggiungi la promise di eliminazione alla lista delle promesse
      deletePromises.push(this.deleteParcheggio(parcheggio));
    });

    // Esegui tutte le promesse di eliminazione in parallelo
    await Promise.all(deletePromises);

    console.log('Tutti i parcheggi sono stati eliminati con successo.');
  } catch (error) {
    console.error('Errore durante l\'eliminazione dei parcheggi:', error);
  }
  

}



  
  
  

  
}
  

  
