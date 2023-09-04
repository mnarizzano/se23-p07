import { Injectable, NgZone } from '@angular/core';
import { User } from '../services/user.model';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: User | null = null; // Save logged in user data
  
  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in local storage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          phoneNumber: user.phoneNumber || '',
        
        };
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
        this.userData = null;
      }
    });
  }
  // Sign in with email/password
  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        if (result.user) {
          
          this.afAuth.authState.subscribe((user) => {
            if (user) {
              this.router.navigate(['home']);
            }
          });
        } else {
          window.alert('L\'utente non è stato trovato.');
        }
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  
  SignUp(email: string, password: string, user: User) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        if (result.user) {
          // Se result.user è valido
          user.uid = result.user.uid;
          this.SetUserData(user);
          /* Call the SendVerificationMail() function when a new user signs 
          up and returns a promise */
          return this.SendVerificationMail(); // Restituisci la promessa dal metodo
        } else {
          // Se result.user è null o undefined, gestisci l'errore qui
          window.alert('Errore durante la creazione dell\'account.');
          throw new Error('Errore durante la creazione dell\'account.');
        }
      })
      .catch((error) => {
        // Gestisci gli errori relativi alla creazione dell'account qui
        window.alert(error.message);
        throw error;
      });
  }
  
  
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((user: any) => user.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
        return;
      })
      .catch((error) => {
        // Gestisci gli errori relativi all'invio dell'email di verifica
        console.error('Errore durante l\'invio della verifica dell\'email:', error);
        throw error;
      });
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }
  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
      this.router.navigate(['home']);
    });
  }
  // Auth logic to run auth providers
  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        if (result.user) {
          this.router.navigate(['home']);
          this.SetUserData(result.user);
        } else {
          window.alert('L\'utente non è stato trovato.');
        }
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
    };
  
    return userRef.set(userData, { merge: true });
  }
  
  // Sign out
  SignOut() {
    return this.afAuth.signOut()
      .then(() => {
        localStorage.removeItem('user');
        this.router.navigate(['sign-in']);
      })
      .catch((error) => {
        console.error('Errore durante il logout:', error);
      });
  }
  
}