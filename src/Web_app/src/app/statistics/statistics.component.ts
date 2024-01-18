import { Component, OnInit } from '@angular/core';
import { AngularFirestore }  from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { firebaseConfig } from '../../environments/environment'; 
import { Chart, CategoryScale, BarController, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})

  // Manages the statistics page 
export class StatisticsComponent implements OnInit {
  averageDuration: number;
  mostUsedDays: Record<string, number>;
  mostUsedParkingLots: Record<string, number>;
  parkingLotAddresses: Record<string, string>;
  daysOfWeek: string[] = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  mostUsedDay: string[] = []; 
  mostUsedParkingLotsSorted: { key: string, value: number }[] = [];
 
  constructor(private firestore: AngularFirestore) { 
    this.averageDuration = 0;
    this.mostUsedDays = {};
    this.mostUsedParkingLots = {};
    this.parkingLotAddresses = {}; 
    firebase.initializeApp(firebaseConfig);
    
  }

  ngOnInit(): void {
    Chart.register(CategoryScale, BarController, LinearScale, Title, Tooltip, Legend);
    this.getParkingLotAddresses(); 
    this.calculateStatistics();
  } 

  // Compute the statistics
  calculateStatistics() {
    this.calculateAverageParkingDuration();
    this.calculateMostUsedDays(() => {
      this.createBarChart();
    });
    this.calculateMostUsedParkingLots(() => {
      this.createParkingLotBarChart();
    });
  }

  // Compute the average parking duration
  calculateAverageParkingDuration() {
    this.firestore.collection('transazioni').get().subscribe(querySnapshot => {
      let totalDuration = 0;
      let numberOfTransactions = 0;

      querySnapshot.forEach(doc => {
        const data: any = doc.data();
        const timestamp = data.data_entrata;
        const entryTime = timestamp.toDate();
        const timestamp2 = data.data_uscita
        const exitTime = timestamp2.toDate();
        const durationInHours = (exitTime - entryTime) / (1000 * 60 * 60);
        totalDuration += durationInHours;
        numberOfTransactions++;
      });

      this.averageDuration = totalDuration / numberOfTransactions;
    });
  }

  // get all the addresses of the saved parking slots
  getParkingLotAddresses() {
    const database = firebase.database();
    const parcheggiRef = database.ref('/parcheggi');

    parcheggiRef.once('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        const parkingLotId = childSnapshot.key;
        const parkingLotData = childSnapshot.val();
        const parkingLotAddress = parkingLotData.indirizzo;
        this.parkingLotAddresses[parkingLotId] = parkingLotAddress;
      });
    });
  }

  // get the address of a PS for showing the most used parking slots
  getParkingLotAddress(parkingLotId: string): string {
    const address = this.parkingLotAddresses[parkingLotId];
    return address || 'Indirizzo non disponibile';
  }

  // Compute the most used days
  calculateMostUsedDays(callback: () => void) {
    const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    const dayCount: Record<string, number> = {};
    let maxCount: number = 0;
    const mostUsedDays: string[] = [];
  
    // Initialize the count for each day 
    daysOfWeek.forEach(day => {
      dayCount[day] = 0;
    });
  
    this.firestore.collection('transazioni').get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data: any = doc.data();
        const timestamp = data.data_entrata;
        const entryTime = timestamp.toDate();
        const dayOfWeek = daysOfWeek[entryTime.getDay()];
        dayCount[dayOfWeek] += 1;
        
        if (dayCount[dayOfWeek] > maxCount) {
          maxCount = dayCount[dayOfWeek];
          mostUsedDays.length = 0; 
        }
        
        if (dayCount[dayOfWeek] === maxCount) {
          mostUsedDays.push(dayOfWeek); 
        }
      });
  
      this.mostUsedDays = dayCount;
      this.mostUsedDay = mostUsedDays; 
      callback();
    });
  }

  // create the chart of the most used days
  createBarChart() {
    const chartData = {
      labels: this.daysOfWeek,
      datasets: [{
        label: 'Parcheggi utilizzati',
        data: this.daysOfWeek.map(day => this.mostUsedDays[day]),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
    
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    
    const barChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Parcheggi utilizzati'
            }
          },
          x: {
            type: 'category',
          },
        }
      }
    });
  }

  // create the chart of the most used Parking slots
  createParkingLotBarChart() {
    const parkingLotChartData = {
      labels: this.mostUsedParkingLotsSorted.map(parkingLot => this.getParkingLotAddress(parkingLot.key)),
      datasets: [{
        label: 'Parcheggi più utilizzati',
        data: this.mostUsedParkingLotsSorted.map(parkingLot => parkingLot.value),
        backgroundColor: 'rgba(30, 144, 255, 0.2)',
        borderColor: 'rgba(30, 144, 255, 1)',
        borderWidth: 1
      }]
    };

    const parkingLotCtx = document.getElementById('parkingLotChart') as HTMLCanvasElement;
    const parkingLotChart = new Chart(parkingLotCtx, {
      type: 'bar',
      data: parkingLotChartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Frequenza'
            }
          },
          x: {
            type: 'category'
          }
        }
      }
    });
}

  // compute the most used parking slots
  calculateMostUsedParkingLots(callback: () => void) {
    const parkingLotCount: Record<string, number> = {};
    const parkingLotAddresses: Record<string, string> = {}; // mappa ID parcheggio -> Indirizzo
  
    this.firestore.collection('parcheggi').get().subscribe(parcheggiSnapshot => {
      parcheggiSnapshot.forEach(parcheggioDoc => {
        const parcheggioData: any = parcheggioDoc.data();
        const parkingLotId = parcheggioData.id_parcheggio;
        const parkingLotAddress = parcheggioData.indirizzo;
        parkingLotAddresses[parkingLotId] = parkingLotAddress;
      });
  
      // Counting of parkings 
      this.firestore.collection('transazioni').get().subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data: any = doc.data();
          const parkingLotId = data.id_parcheggio;
          parkingLotCount[parkingLotId] = (parkingLotCount[parkingLotId] || 0) + 1;
        });
  
        const mostUsedParkingLotIds = Object.keys(parkingLotCount)
          .sort((a, b) => parkingLotCount[b] - parkingLotCount[a]) 
          .slice(0, 10); // First 10
  
        const mostUsedParkingLotsSorted = mostUsedParkingLotIds.map(parkingLotId => ({
          key: parkingLotId,
          value: parkingLotCount[parkingLotId]
        }));
  
        this.mostUsedParkingLotsSorted = mostUsedParkingLotsSorted;
        this.mostUsedParkingLots = parkingLotCount;
        callback();
      });
      
    });
  }
  
}
