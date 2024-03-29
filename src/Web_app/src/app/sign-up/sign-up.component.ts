import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/services/user.model'; 

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})

  // Manages the sign-up page 
export class SignUpComponent implements OnInit {
  
  constructor(public authService: AuthService) { }

  user: User = new User(); 
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  address: string = '';
  phoneNumber: string = '';
  userPwd: string = '';
  isAdmin: boolean = false; 

  ngOnInit() {
    const state = history.state;
    if (state && state.user) {
      this.user = state.user;
      this.email = this.user.email || '';
    }
  }

  // Choose the role of the user
  toggleAdmin() {
    this.isAdmin = !this.isAdmin;
  }  

  // Manages the registration of a new user
  onSignUp() {
    if (this.firstName && this.lastName && this.email && this.phoneNumber && this.userPwd) {
      const user: User = {
        uid: '', 
        email: this.email,
        displayName: this.firstName + ' ' + this.lastName,
        photoURL: '',
        phoneNumber: this.phoneNumber,
      };
      const role: string = this.isAdmin ? 'admin' : 'user';
      this.authService.SignUp(this.email, this.userPwd, user, role)
    } else {
      console.log("Compila tutti i campi obbligatori");
    }
  }

}
