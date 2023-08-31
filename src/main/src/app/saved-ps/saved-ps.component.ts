import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-saved-ps',
  templateUrl: './saved-ps.component.html',
  styleUrls: ['./saved-ps.component.css']
})
export class SavedPSComponent {

  userParkings: any[] = [];
 
  
  //constructor(private parkingService: ParkingService) {}
  constructor(private router: Router) {}

  ngOnInit() {
    const userId = 'user_id_here';
    this.userParkings = [
      { id: 'd7d3h9', indirizzo: 'Piazza Paolo da Novi 4, Genova', data: '23/08/2023' },// Dati di esempio
    ];
   // this.userParkings =  this.parkingService.getParkings(userId);
  }

  /*generateOpenStreetMapLink(address: string): string {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.openstreetmap.org/search?query=${encodedAddress}`;
  }*/
  navigateToMap(address: string) {
    console.log('navigateToMap()');
}

}
