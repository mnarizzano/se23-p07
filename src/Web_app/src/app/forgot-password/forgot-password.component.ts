import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})

  // For managing the case in which the user forgots the password
export class ForgotPasswordComponent implements OnInit {
  // Call to the authentication service
  constructor(
    public authService: AuthService
  ) { }
  ngOnInit() {
  }
}
