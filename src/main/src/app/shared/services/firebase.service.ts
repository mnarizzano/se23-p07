// firebase.service.ts

import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { firebaseConfig } from '../../../environments/environment'; 
import { Parcheggio } from './parking.interface';

@Injectable({
    providedIn: 'root',
  })
  export class FirebaseService {
    constructor() {
      firebase.initializeApp(firebaseConfig);
    }
  
    // Aggiungi un parcheggio al database Firebase
    addParcheggio(parcheggio: Parcheggio): Promise<void> {
      const parcheggiRef = firebase.database().ref('parcheggi');
      
      return parcheggiRef.push(parcheggio).then(() => {
        console.log('Parcheggio aggiunto e salvato su Firebase:', parcheggio);
      });
    }
  }
