import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../shared/services/user-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})

export class PersonalDataComponent implements OnInit {
  userData: any = {};
  editingAddress: boolean = false;
  editingPhoneNumber: boolean = false;
  editedAddress: string = '';
  editedPhoneNumber: string = '';

  constructor(
    private userDataService: UserDataService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        const userId = user.uid;
        this.userDataService.getUserData(userId).subscribe((userData) => {
          if (userData) {
            this.userData = userData; // Assegna i dati dell'utente alla variabile userData
          }
        });
      } else {
        // L'utente non è autenticato, puoi gestire questo caso in base alle tue esigenze
      }
    });
  }

  updateInfo() {
    this.editingAddress = true;
    this.editedAddress = this.userData.address;

    this.editingPhoneNumber = true;
    this.editedPhoneNumber = this.userData.phoneNumber;
  }

  saveEditedAddress() {
    this.userData.address = this.editedAddress;
    this.editingAddress = false;

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        const userId = user.uid;
        this.firestore.collection('users').doc(userId).update({ address: this.editedAddress })
          .then(() => {
            console.log('Campo "address" aggiornato con successo nel database.');
          })
          .catch((error) => {
            console.error('Errore nell\'aggiornamento del campo "address" nel database:', error);
          });
      }
    });
  }

  saveEditedPhoneNumber() {
    this.userData.phoneNumber = this.editedPhoneNumber;
    this.editingPhoneNumber = false;
  
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        const userId = user.uid;
        this.firestore.collection('users').doc(userId).update({ phoneNumber: this.editedPhoneNumber })
          .then(() => {
            console.log('Campo "phoneNumber" aggiornato con successo nel database.');
          })
          .catch((error) => {
            console.error('Errore nell\'aggiornamento del campo "phoneNumber" nel database:', error);
          });
      }
    });
  }
  
}
