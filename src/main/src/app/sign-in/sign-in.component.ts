import { Component, OnInit } from '@angular/core';
import { AuthService } from "../shared/services/auth.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})

export class SignInComponent implements OnInit {
  userNameValue: string = '';
  userPasswordValue: string = '';
  constructor(
    public authService: AuthService
  ) { }
  ngOnInit() {
    this.signInOnEnter;
   }

  signInOnEnter() {
    // Chiamare la funzione di accesso quando l'utente preme "Invio"
    this.authService.SignIn(this.userNameValue, this.userPasswordValue);
  }
}