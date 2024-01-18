import { Component, OnInit } from '@angular/core';
import { AuthService } from "../shared/services/auth.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})

  // Manages the sign-in page
export class SignInComponent implements OnInit {
  userNameValue: string = '';
  userPasswordValue: string = '';
  constructor(
    public authService: AuthService
  ) { }
  ngOnInit() {
    this.signInOnEnter;
   }

   // Call signIn when user press Enter
  signInOnEnter() { 
    this.authService.SignIn(this.userNameValue, this.userPasswordValue);
  }
}
