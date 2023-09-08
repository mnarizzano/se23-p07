import { Component, OnInit } from '@angular/core';
import { AngularFirestore }  from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { firebaseConfig } from '../../environments/environment'; 


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
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
    this.getParkingLotAddresses(); 
    this.calculateStatistics();
  }
  

  calculateStatistics() {
    this.calculateAverageParkingDuration();
    this.calculateMostUsedDays();
    this.calculateMostUsedParkingLots();
  }

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

  getParkingLotAddresses() {
    // Ora puoi accedere ai dati dei parcheggi dall'altro database Firebase
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
  getParkingLotAddress(parkingLotId: string): string {
    const address = this.parkingLotAddresses[parkingLotId];
    return address || 'Indirizzo non disponibile';
  }
  

  calculateMostUsedDays() {
    const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    const dayCount: Record<string, number> = {};
    let maxCount: number = 0;
    const mostUsedDays: string[] = [];
  
    // Inizializza il conteggio per ciascun giorno a 0 all'inizio
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
          mostUsedDays.length = 0; // Cancella l'array se trovi un nuovo massimo
        }
        
        if (dayCount[dayOfWeek] === maxCount) {
          mostUsedDays.push(dayOfWeek); // Aggiungi il giorno al massimo
        }
      });
  
      this.mostUsedDays = dayCount;
      this.mostUsedDay = mostUsedDays; // Ora mostUsedDay è un array di giorni più utilizzati
    });
  }
  
  calculateMostUsedParkingLots() {
    const parkingLotCount: Record<string, number> = {};
    const parkingLotAddresses: Record<string, string> = {}; // Manteniamo una mappa ID parcheggio -> Indirizzo
  
    // Prima, recuperiamo le informazioni sugli indirizzi dei parcheggi
    this.firestore.collection('parcheggi').get().subscribe(parcheggiSnapshot => {
      parcheggiSnapshot.forEach(parcheggioDoc => {
        const parcheggioData: any = parcheggioDoc.data();
        const parkingLotId = parcheggioData.id_parcheggio;
        const parkingLotAddress = parcheggioData.indirizzo;
        parkingLotAddresses[parkingLotId] = parkingLotAddress;
      });
  
      // Ora, calcoliamo il conteggio dei parcheggi e otteniamo gli indirizzi
      this.firestore.collection('transazioni').get().subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data: any = doc.data();
          const parkingLotId = data.id_parcheggio;
          parkingLotCount[parkingLotId] = (parkingLotCount[parkingLotId] || 0) + 1;
        });
  
        // Adesso puoi accedere agli indirizzi dei parcheggi usando parkingLotAddresses
        // Ad esempio, per ottenere l'indirizzo del parcheggio più utilizzato:
        const mostUsedParkingLotIds = Object.keys(parkingLotCount)
          .sort((a, b) => parkingLotCount[b] - parkingLotCount[a]) // Ordina in base all'utilizzo decrescente
          .slice(0, 10); // Prendi solo i primi 10
  
        const mostUsedParkingLotsSorted = mostUsedParkingLotIds.map(parkingLotId => ({
          key: parkingLotId,
          value: parkingLotCount[parkingLotId]
        }));
  
        this.mostUsedParkingLotsSorted = mostUsedParkingLotsSorted;
        this.mostUsedParkingLots = parkingLotCount;
      });
    });
  }
  
  
  
}
