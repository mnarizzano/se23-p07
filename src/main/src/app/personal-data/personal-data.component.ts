import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from '../user-data.service';

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

  constructor(private userDataService: UserDataService) {}

  ngOnInit() {}

  updateInfo() {
    
    this.editingAddress = true;
    this.editedAddress = this.userData.address;
  

    this.editingPhoneNumber = true;
    this.editedPhoneNumber = this.userData.phoneNumber;
}

  saveEditedAddress() {
    this.userData.address = this.editedAddress;
    this.editingAddress = false;
  }

  saveEditedPhoneNumber() {
    this.userData.phoneNumber = this.editedPhoneNumber;
    this.editingPhoneNumber = false;
  }

 
}
