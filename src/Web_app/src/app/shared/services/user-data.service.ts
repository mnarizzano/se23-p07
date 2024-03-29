import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

  // Class to manage the user data 
export class UserDataService {
  constructor(private firestore: AngularFirestore) {}

  getUserData(userId: string): Observable<any> {
    return this.firestore.collection('users').doc(userId).valueChanges();
  }
}
