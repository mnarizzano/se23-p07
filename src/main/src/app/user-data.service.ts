// user-data.service.ts
import { Injectable } from '@angular/core';
import { SignUpComponent } from './sign-up/sign-up.component';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private userData: any = {};

  setUserData(data: any) {
    this.userData = data;
  }

  getUserData() {
    return this.userData;
  }
}
