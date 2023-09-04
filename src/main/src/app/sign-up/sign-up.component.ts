import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/services/user.model'; 

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  
  constructor(public authService: AuthService) { }

  user: User = new User(); 
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  address: string = '';
  phoneNumber: string = '';
  userPwd: string = '';

  ngOnInit() {
    const state = history.state;
    if (state && state.user) {
      this.user = state.user;
      this.email = this.user.email || '';
    }
  }
  
  onSignUp() {
    if (this.firstName && this.lastName && this.email && this.phoneNumber && this.userPwd) {
      const user: User = {
        uid: '', // Lascia vuoto uid poiché verrà generato da Firebase
        email: this.email,
        displayName: this.firstName + ' ' + this.lastName,
        photoURL: '',
        phoneNumber: this.phoneNumber,
      };
      // Chiama la funzione SignUp del servizio AuthService
      this.authService.SignUp(this.email, this.userPwd, user)
    } else {
      console.log("Compila tutti i campi obbligatori");
    }
  }
}
