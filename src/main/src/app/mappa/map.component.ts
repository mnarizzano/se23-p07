import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef  } from '@angular/core';
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
import { AddBoxConfirmationComponent } from '../add-box-confirmation/add-box-confirmation.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeleteAllConfirmationComponent } from '../delete-all-confirmation/delete-all-confirmation.component';







interface Parcheggio {
  pid: string;
  indirizzo: any;
  coordinate: {
    lat: number;
    lng: number;
  }, 
  data_salvataggio: string;
  state: 'disponibile' | 'occupato' | 'inaccessibile';
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
  rectangleMarkerMap: Map<L.Rectangle, L.Marker> = new Map();
  width = 0.000021;
  length = 0.00003;

  // Crea un'icona personalizzata utilizzando l'immagine "icona.png"
customIcon = L.icon({
  iconUrl: 'assets/icona.png', 
  iconSize: [32, 32], 
  iconAnchor: [16, 32], 
  popupAnchor: [0, -20],
});


  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  

  constructor(private modalService: BsModalService, 
    private http: HttpClient, 
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    ) {}


    ngOnInit() {
      if (this.mapContainer && this.mapContainer.nativeElement) {
      this.initMap();
      this.caricaParcheggiSalvati();
    }
    
  }
  
    initMap() {
      // Inizializza la mappa
      if (this.mapContainer && this.mapContainer.nativeElement) {
        this.mappa = L.map(this.mapContainer.nativeElement).setView([44.4056, 8.9463], 15);
        // Aggiunge un layer con mappa da OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
        }).addTo(this.mappa); 
      }
      
      // Clic destro sulla mappa 
      this.mappa.on('contextmenu', (event: L.LeafletMouseEvent) => {
        // Verifica se il clic destro è avvenuto all'interno o all'esterno di un rettangolo esistente
        let isInsideRectangle = false;
        for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
          if (rectangle.getBounds().contains(event.latlng)) {
            isInsideRectangle = true;
            break; // Esci dal ciclo se il clic è avvenuto all'interno di un rettangolo
          }
        }

        if (isInsideRectangle) {
          this.handleRectangleRightClick(event.latlng); // Mostra la finestra "Prenota"
        } else {
          this.showAddBoxConfirmation(event); // Mostra la finestra "Aggiungi"
        }
  });

      // Double click -> delBox
      this.mappa.on('click', (event: L.LeafletMouseEvent) => {
          const currentTime = new Date().getTime();

          if (currentTime - this.lastClickTime < 300) {
            clearTimeout(this.clickTimeout);
            this.delBox(event.latlng); // double click sinistro sul rettangolo -> delBox
          } else { // Click sinistro singolo sul rettangolo -> pop up window
              for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
                if (rectangle.getBounds().contains(event.latlng)) {
                  const parcheggio = this.rectangleParcheggioMap.get(rectangle);
                  if (parcheggio) {
                    this.showPropertyPopup(parcheggio); // Mostra le proprietà del parcheggio
                  }
                  break;
                }
              }
            }
          this.lastClickTime = currentTime;
          
      });
    }


    handleRectangleRightClick(latlng: L.LatLng) {
      // Itera attraverso i rettangoli esistenti per verificare quale è stato cliccato
      for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
        if (rectangle.getBounds().contains(latlng)) {
          const parcheggio = this.rectangleParcheggioMap.get(rectangle);
          if (parcheggio) {
            this.showBookPopup(rectangle, parcheggio); // Passa il rettangolo e il parcheggio alla funzione showBookPopup
          }
          break; 
        }
      }
    }

    

// Aggiunta del rettangolo
bsModalRef!: BsModalRef;


rectangleParcheggioMap: Map<L.Rectangle, Parcheggio> = new Map();


addBox(coordinate: { lat: number; lng: number }) {
  const latlng = new L.LatLng(coordinate.lat, coordinate.lng);
  

  const bounds = L.latLngBounds([
    [latlng.lat + this.length, latlng.lng - this.width],
    [latlng.lat - this.length, latlng.lng + this.width],
  ]);

  const id =  this.firebaseService.generateParcheggioID(latlng);  
  const stato = 'disponibile';

  const rectangle = L.rectangle(bounds, { color: 'yellow', weight: 2 }).addTo(this.mappa);

  // Crea il marker utilizzando l'icona personalizzata
  const marker = L.marker(latlng, { icon: this.customIcon, draggable: true }).addTo(this.mappa);

  // Associa il rettangolo al marker nella mappa
  this.rectangleMarkerMap.set(rectangle, marker);

  marker.on('dragend', () => {
    const newLatLng = marker.getLatLng();
    this.moveParcheggio(marker, newLatLng);
  });
  
  const center = bounds.getCenter();
  this.getAddress(center.lat, center.lng).subscribe(indirizzo => {
    const parcheggio: Parcheggio = {
      pid: id,
      indirizzo: indirizzo, // Aggiorna con l'indirizzo ottenuto
      coordinate: {
        lat: center.lat,
        lng: center.lng,
      },
      data_salvataggio: new Date().toISOString(),
      state: stato,
    };
    this.rectangleParcheggioMap.set(rectangle, parcheggio);
  });
}

// Mostra la finestra  di conferma di addBox()
showAddBoxConfirmation(event: L.LeafletMouseEvent) {
  this.bsModalRef = this.modalService.show(AddBoxConfirmationComponent);
// Gestisci l'evento emesso dalla finestra  al momento dell'aggiunta
this.bsModalRef.content.onAddBox.subscribe(() => {
  this.addBox(event.latlng); // Aggiunge il rettangolo
  this.bsModalRef.hide(); // Chiude la finestra dopo l'aggiunta
});
}

// Sposta un parcheggio
moveParcheggio(marker: L.Marker, newLatLng: L.LatLng) {
  // Trova il parcheggio associato al marker
  const associatedRectangle = Array.from(this.rectangleMarkerMap.keys()).find(key => this.rectangleMarkerMap.get(key) === marker);
  const associatedParcheggio = associatedRectangle ? this.rectangleParcheggioMap.get(associatedRectangle) : null;

  if (associatedRectangle && associatedParcheggio) {
    // Rimuovi il vecchio rettangolo e marker dalla mappa
    this.mappa.removeLayer(associatedRectangle);
    this.mappa.removeLayer(marker);
    // Rimuovi il vecchio parcheggio dal database
    this.firebaseService.deleteParcheggio(associatedParcheggio);

    // Crea un nuovo rettangolo e marker con le nuove coordinate
    const newBounds = L.latLngBounds([
      [newLatLng.lat + this.length, newLatLng.lng - this.width],
      [newLatLng.lat - this.length, newLatLng.lng + this.width],
    ]);

    const newRectangle = L.rectangle(newBounds, { color: 'yellow', weight: 2 }).addTo(this.mappa);

    const newMarker = L.marker(newLatLng, { icon: this.customIcon, draggable: true }).addTo(this.mappa);

    // Aggiorna il rettangolo e il marker associati
    this.rectangleMarkerMap.set(newRectangle, newMarker);

    // Nuovo parcheggio
    const new_latlng = new L.LatLng(newLatLng.lat, newLatLng.lng);
    const new_id = this.firebaseService.generateParcheggioID(new_latlng);
    const new_address = this.getAddress(newLatLng.lat, newLatLng.lng);
    console.log("new_address creato:", new_address);

    const new_parcheggio: Parcheggio = {
      pid: new_id,
      indirizzo: new_address, // Aggiorna con l'indirizzo ottenuto
      coordinate: {
        lat: newLatLng.lat,
        lng: newLatLng.lng,
      },
      data_salvataggio: new Date().toISOString(),
      state: 'disponibile',
    };

    this.rectangleParcheggioMap.set(newRectangle, new_parcheggio);
    this.firebaseService.addParcheggio(new_parcheggio);
    console.log("Parcheggio con indirizzo aggiornato:", new_parcheggio.indirizzo);
  }
}


// Eliminare rettangolo
delBox(latlng: L.LatLng){
this.mappa.eachLayer((layer: L.Layer) => {
  if (layer instanceof L.Rectangle && layer.getBounds().contains(latlng)) {
    this.showDeleteConfirmation(layer);
  }
});
}

// Dichiarare un array temporaneo per memorizzare i parcheggi da eliminare
private parcheggiDaEliminare: Parcheggio[] = [];

// Notifica di conferma di delBox()
showDeleteConfirmation(layer: L.Rectangle) {
  const modalRef: BsModalRef = this.modalService.show(DeleteConfirmationComponent);
  modalRef.content?.onClose.subscribe((result: boolean) => {
    if (result) {
      // Recupera il parcheggio associato al rettangolo
      const associatedParcheggio = this.rectangleParcheggioMap.get(layer);

      if (associatedParcheggio) {
        // Rimuovi sia il rettangolo che il marker dalla mappa
        this.mappa.removeLayer(layer);

        // Recupera il marker associato al parcheggio e rimuovilo
        const associatedMarker = this.rectangleMarkerMap.get(layer);
        if (associatedMarker) {
          this.mappa.removeLayer(associatedMarker);
        }

        // Rimuovi l'associazione dalla mappa
        this.rectangleMarkerMap.delete(layer);
        this.rectangleParcheggioMap.delete(layer);

        this.markerAdded = false;

        // Aggiungi il parcheggio associato all'array dei parcheggi da eliminare
        this.parcheggiDaEliminare.push(associatedParcheggio);
      }
    }
  });
}

mapMarker: any;
markerAdded: boolean = false;

// Salvataggio delle modifiche ai parcheggi
async saveParking() {
  // Ottieni tutti i parcheggi memorizzati nel database
  const parcheggiNelDatabase = await this.firebaseService.getParcheggi();
  
  this.mappa.eachLayer(async (layer: L.Layer) => {
    if (layer instanceof L.Rectangle) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      const id = ``;

      this.getAddress(center.lat, center.lng).subscribe(async (indirizzo) => {
        const user = this.authService.userData;

        if (user) {
          const parcheggio: Parcheggio = {
            pid: id,
            indirizzo: indirizzo,
            coordinate: {
              lat: center.lat,
              lng: center.lng,
            },
            data_salvataggio: new Date().toISOString(),
            state: 'disponibile',
          };

          parcheggio.pid = this.firebaseService.generateParcheggioID(parcheggio.coordinate);  
          // Verifica se il parcheggio è già presente nel database
          const parcheggioNelDatabase = parcheggiNelDatabase.find((dbParcheggio: Parcheggio) =>
            this.areCoordinatesEqual(dbParcheggio.coordinate, parcheggio.coordinate)
          );

          if (!parcheggioNelDatabase) {
            // Se il parcheggio non è presente nel database, aggiungilo
            this.parcheggiSalvati.push(parcheggio);
            await this.firebaseService.addParcheggio(parcheggio);
          }
        } else {
          console.error('Utente non autenticato.');
        }
      });

    }
  });

  // Elimina i parcheggi in parcheggiDaEliminare dal database
  this.parcheggiDaEliminare.forEach(async (parcheggioDaEliminare: Parcheggio) => {
  console.log('parcheggio da eliminare:',parcheggioDaEliminare );
    await this.firebaseService.deleteParcheggio(parcheggioDaEliminare);
  });
  this.caricaParcheggiSalvati();
  this.updateData();
}

// Funzione di utilità per confrontare le coordinate
private areCoordinatesEqual(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): boolean {
  return coord1.lat === coord2.lat && coord1.lng === coord2.lng;
}

onSaveButtonClick() {
  const initialState = {}; 
  // Apre la finestra  di conferma
  const modalRef: BsModalRef = this.modalService.show(SaveConfirmationComponent, { initialState });
  // Gestisci l'evento emesso dalla finestra al momento della conferma
  modalRef.content.onConfirm.subscribe((result: boolean) => {
    if (result) {
      // Salvataggio dei dati del parcheggio nel database
      this.saveParking(); // 
    }
  });
}


// Ricerca dell'indirizzo
searchAddress() {
  const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${this.searchQuery}`;

    // Crea un'icona personalizzata utilizzando l'immagine "icona.png"
    const customIcon = L.icon({
      iconUrl: 'assets/icona.png', // Assicurati che il percorso sia corretto
      iconSize: [32, 32], // Dimensioni dell'immagine
      iconAnchor: [16, 32], // Posizione dell'ancora dell'icona (al centro in basso)
    });

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
        const marker = L.marker([lat, lon], {
          icon: customIcon,
        }).addTo(this.mappa)
        .bindPopup(result.display_name);

        // Centra la mappa sull'indirizzo trovato
          this.mappa.setView([lat, lon], 16);

        // Apri il popup quando passi il mouse sul marker (evento mouseover)
          marker.on('mouseover', () => {
            marker.openPopup();
          });

        // Chiudi il popup quando il mouse esce dal marker (evento mouseout)
          marker.on('mouseout', () => {
            marker.closePopup();
          });
  
      } else {
        console.log('Indirizzo non trovato');
      }
    })
    .catch(error => {
      console.error('Errore durante la ricerca dell\'indirizzo:', error);
    });

    console.log("Search button clicked")
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
      return('');
    })
  );
}

// Lista dei parcheggi
parcheggiSalvati: Parcheggio[] = []; 
parcheggioSelezionato: Parcheggio | null = null;

caricaParcheggiSalvati() {
  this.firebaseService.getParcheggi().then((parcheggi) => {
    this.parcheggiSalvati = parcheggi;
    this.mostraParcheggiSullaMappa();
  });
}

mostraParcheggiSullaMappa() {
  // Itera attraverso i parcheggi salvati e aggiungi i marker sulla mappa per ciascun parcheggio
  for (const parcheggio of this.parcheggiSalvati) {
    this.addMarker(parcheggio);
    this.addBox(parcheggio.coordinate);
  }
}



addMarker(parcheggio: Parcheggio) { 
  // Aggiungi un marker nella posizione del parcheggio 
  const marker = L.marker([parcheggio.coordinate.lat, parcheggio.coordinate.lng], {
    icon: this.customIcon, // Utilizza l'icona personalizzata
  }).addTo(this.mappa);

  // Aggiungi il popup al marker con le informazioni del parcheggio
  const popupContent = `
    <strong>Indirizzo:</strong> ${parcheggio.indirizzo}<br>
  `;
  marker.bindPopup(popupContent);
}



// Interazione parcheggi - mappa
selectParking(parcheggio: Parcheggio) {
  this.parcheggioSelezionato = parcheggio;
  this.updateMap(parcheggio);
}



updateMap(parcheggio: Parcheggio) {
  // Centra la mappa sulla posizione del parcheggio
  this.mappa.setView([parcheggio.coordinate.lat, parcheggio.coordinate.lng], 16);
  // Aggiungi un marker nella posizione del parcheggio con l'icona personalizzata
  const marker = L.marker([parcheggio.coordinate.lat, parcheggio.coordinate.lng], {
    icon: this.customIcon, // Utilizza l'icona personalizzata
  }).addTo(this.mappa);
  this.showPropertyPopup(parcheggio);
}


showBookPopup(rectangle: L.Rectangle, parcheggio: Parcheggio) {
  const popupContent = `
    <button id="prenotaButton">Prenota</button>
  `;

  // Crea una finestra popup e imposta il contenuto
  const popup = L.popup().setContent(popupContent);

  // Mostra la finestra popup vicino al rettangolo
  popup.setLatLng(rectangle.getBounds().getCenter()).openOn(this.mappa);

  // Aggiungi un gestore di eventi per il clic sul pulsante "Prenota"
  const prenotaButton = document.getElementById('prenotaButton');
  if (prenotaButton) {
    prenotaButton.addEventListener('click', () => {
      this.updateState(parcheggio); // Passa il parcheggio corretto quando il pulsante viene cliccato
      this.mappa.closePopup(popup); // Chiudi la popup dopo aver cliccato sul pulsante
      // Aggiorna la lista dei parcheggi salvati
     this.caricaParcheggiSalvati();
    });
  }
}

updateState(parcheggio: Parcheggio) {
  if (parcheggio.state === 'disponibile') {
    console.log('Parcheggio:', parcheggio);
    parcheggio.state = 'occupato';
    // Aggiorna lo stato nel database
    this.firebaseService.updateParcheggioState(parcheggio.pid, 'occupato').then(() => {
      console.log('Stato del parcheggio aggiornato a "occupato" nel database.');
      this.caricaParcheggiSalvati();

    // Trova il rettangolo associato al parcheggio
    const rectangle = Array.from(this.rectangleMarkerMap.keys()).find((rect) => {
      const associatedParcheggio = this.rectangleParcheggioMap.get(rect);
      return associatedParcheggio && associatedParcheggio.pid === parcheggio.pid;
    });

    // Cambia il colore del rettangolo in rosso
    if (rectangle) {
      rectangle.setStyle({ fillColor: 'red', color: 'red' });
    }
  });    
    
  }
}


/* Cose da aggiustare:
- se clicco su un elemento della lista, poi non riesco a fare drag and drop
- se elimino un parcheggio, rimane il marker. Devo aggiornare la pagina manualmente. Idem se faccio drag and drop, rimane il marker precedente.
- aggiustare il colore dei bordi del rettangolo quando diventa occupato
- fare in modo che dopo che è diventato occupato, venga visualizzato sempre rosso.
- aggiungere un tasto in fondo alla pagina per selezionare alcuni parcheggi ed eliminarli tutti assieme dal database
- far si che il rettangolo possa ruotare
*/

// Mostra le proprietà del parcheggio
showPropertyPopup(parcheggio: Parcheggio) {
  const popupContent = `
    <strong>Indirizzo:</strong> ${parcheggio.indirizzo}<br>
    <strong>Coordinate:</strong> Lat: ${parcheggio.coordinate.lat}, Lng: ${parcheggio.coordinate.lng}<br>
    <strong>Stato:</strong> ${parcheggio.state}<br>
    <strong>Data di Salvataggio:</strong> ${parcheggio.data_salvataggio}<br>
  `;

  // Crea una finestra popup e imposta il contenuto
  const popup = L.popup().setContent(popupContent);

  // Mostra la finestra popup vicino al parcheggio
  popup.setLatLng([parcheggio.coordinate.lat, parcheggio.coordinate.lng]).openOn(this.mappa);
}

updateData() {
  // Esegui il Change Detection manualmente per riflettere le modifiche nell'interfaccia utente
  this.cdr.detectChanges();
}

confirmDeleteAllParcheggi() {
  const initialState = {};
  this.bsModalRef = this.modalService.show(DeleteAllConfirmationComponent, {
    initialState,
    class: 'modal-dialog-centered',
  });

  this.bsModalRef.content.onConfirm.subscribe(() => {
    this.firebaseService.deleteAllParcheggi(); // Chiamare la funzione per eliminare tutti i parcheggi
    this.bsModalRef.hide(); // Chiudi la finestra di conferma
  });
}





}
