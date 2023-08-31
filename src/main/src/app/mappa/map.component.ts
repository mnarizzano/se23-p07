import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {BsModalService, BsModalRef } from 'ngx-bootstrap/modal'; 
import * as L from 'leaflet';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { FirebaseService } from '../shared/services/firebase.service'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { SaveConfirmationComponent } from '../save-confirmation/save-confirmation.component'




interface Parcheggio {
  uid: string;
  indirizzo: string;
  coordinate: {
    lat: number;
    lng: number;
  }, 
  data_salvataggio: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})



export class MapComponent implements OnInit {
  mappa: any;
  searchQuery: string = '';
  lastClickTime: number = 0;
  clickTimeout: any;

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  parcheggiSalvati: Parcheggio[] = []; 
  
 


  constructor(private modalService: BsModalService, 
    private http: HttpClient, 
    private firebaseService: FirebaseService,
    private authService: AuthService
    ) {}
  

  ngOnInit() {
    if (this.mapContainer && this.mapContainer.nativeElement) {
    this.initMap();
  }

}

  initMap() {
    // Inizializza la mappa
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.mappa = L.map(this.mapContainer.nativeElement).setView([44.4056, 8.9463], 15);
      // Aggiunge un layer con mappa da OopenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
      }).addTo(this.mappa);

      /*
      // Click -> addMarker
      this.map.on('click', (event: L.LeafletMouseEvent) => {
        this.addMarker(event.latlng);
      }); */

      
    }
      // Click -> addBox 
      // Double click -> delBox
      this.mappa.on('click', (event: L.LeafletMouseEvent) => {
        const currentTime = new Date().getTime();

        if (currentTime - this.lastClickTime < 300) {
          clearTimeout(this.clickTimeout);
          this.delBox(event.latlng);
        } else {
          this.clickTimeout = setTimeout(() => {
            this.addBox(event.latlng);
          }, 300);
        }

        this.lastClickTime = currentTime;
        
    })
  }
 
  
  searchAddress() {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${this.searchQuery}`;

    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        /*
        // Rimuovi tutti i marcatori precedenti
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      }); */
        if (data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          // Aggiungi un marcatore per l'indirizzo trovato
          L.marker([lat, lon]).addTo(this.mappa)
          .bindPopup(result.display_name)
          .openPopup();

          // Centra la mappa sull'indirizzo trovato
            this.mappa.setView([lat, lon], 16);
    
        } else {
          console.log('Indirizzo non trovato');
        }
      })
      .catch(error => {
        console.error('Errore durante la ricerca dell\'indirizzo:', error);
      });

      console.log("Search button clicked")
  }


mapMarker: any;
markerAdded: boolean = false;

// Aggiungere rettangolo
addBox(latlng: L.LatLng) {
  const width = 0.00003; // Metà della larghezza (1.5)
  const height = 0.00002; // Metà dell'altezza (1)

  const bounds = L.latLngBounds([
    [latlng.lat + height, latlng.lng - width],
    [latlng.lat - height, latlng.lng + width],
  ]);

  const rectangle = L.rectangle(bounds, { color: 'red', weight: 2 }).addTo(this.mappa);
}



salvaParcheggi() {
  this.mappa.eachLayer((layer: L.Layer) => {
    if (layer instanceof L.Rectangle) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();

      this.getAddress(center.lat, center.lng).subscribe(indirizzo => {
        const user = this.authService.userData;

        if (user){
          const parcheggio: Parcheggio = {
            uid: user.uid,
            indirizzo: indirizzo,
            coordinate: {
              lat: center.lat,
              lng: center.lng
            },
            data_salvataggio: new Date().toISOString() 
          };
          this.firebaseService.addParcheggio(parcheggio).then(() => {
            console.log('Parking add and saved to database', parcheggio);
          });

        } else {
        console.error('Utente non autenticato.');
      }

        
      });
    }
    
  });
}

onSaveButtonClick() {
  const initialState = {}; // Puoi passare dati iniziali alla finestra modale se necessario

  // Apre la finestra modale di conferma
  const modalRef: BsModalRef = this.modalService.show(SaveConfirmationComponent, { initialState });

  // Gestisci l'evento emesso dalla finestra modale al momento della conferma
  modalRef.content.onConfirm.subscribe((result: boolean) => {
    if (result) {
      // Esegui l'azione di salvataggio dei dati del parcheggio nel database
      this.salvaParcheggi(); // Personalizza questa funzione in base al tuo codice
    }
  });
}

getAddress(lat: number, lng: number): Observable<string> {
  const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  return this.http.get<any>(geocodeUrl).pipe(
    map((response: any) => { 
      if (response && response.display_name) {
        return response.display_name;
      } else {
        return 'Indirizzo non trovato';
      }
    }),
    catchError(error => {
      console.error('Errore durante la geocodifica:', error);
      return('Errore nella geocodifica');
    })
  );
}






// Eliminare rettangolo
  delBox(latlng: L.LatLng){
      this.mappa.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Rectangle && layer.getBounds().contains(latlng)) {
          this.showDeleteConfirmation(layer);
        }
      });
  }


// Notifica di conferma
  showDeleteConfirmation(layer: L.Rectangle) {
    const modalRef: BsModalRef = this.modalService.show(DeleteConfirmationComponent);
    modalRef.content?.onClose.subscribe((result: boolean) => {
    if (result) {
      this.mappa.removeLayer(layer);
      this.markerAdded = false;
    } 
  });
 }

 showNotice(){
 
}

}


