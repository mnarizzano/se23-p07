import { Component, OnInit } from '@angular/core';
import { AuthService } from "../shared/services/auth.service";
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  constructor( public authService: AuthService, private userDataService: UserDataService ) { }
  firstName: string = '';  
  lastName: string = '';
  email: string = '';
  address: string = '';
  phoneNumber: string = '';

  ngOnInit() {
    const state = history.state;
    if (state && state.userData) {
      const userData = state.userData;
      this.firstName = userData.firstName;
      this.lastName = userData.lastName;
      this.email = userData.email;
      this.address = userData.address;
      this.phoneNumber = userData.phoneNumber;
    }
  }
  
  
  onSubmit() {
    // Elabora i dati del form e salvali
    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      address: this.address,
      phoneNumber: this.phoneNumber
    };

    // Salva i dati nel servizio UserDataService
    this.userDataService.setUserData(userData);
}
}