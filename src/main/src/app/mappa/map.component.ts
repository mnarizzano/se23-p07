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
import { BookingComponent } from '../booking/booking.component';
import 'leaflet-rotatedmarker';
import { Parcheggio } from '../shared/services/parking.interface';
import { FasceOrarieService } from '../fasce-orarie.service';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import * as csvParser  from 'csv-parser';
import { Location } from '@angular/common';





interface TimeSlot {
  startTime: string;
  endTime: string;
  selected: boolean;
}


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [FasceOrarieService]
})



export class MapComponent implements OnInit {
  isAdmin = false;
  mappa: any;
  searchQuery: string = '';
  lastClickTime: number = 0;
  clickTimeout: any;
  rectangleMarkerMap: Map<L.Rectangle, L.Marker> = new Map();
  width = 0.000021;
  length = 0.00003;
  showBookingModal: boolean = false;
  selectedTimeSlots: TimeSlot[] = [];
  csvData: any[] = [];
    
  // Crea un'icona personalizzata 
  customIcon = L.icon({
    iconUrl: 'assets/icona.png', 
    iconSize: [32, 32], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -20],
  });

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef; 

  constructor(private modalService: BsModalService, 
    private http: HttpClient, 
    public firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fasceOrarieService: FasceOrarieService,
    private location: Location,
    ) {}


  async ngOnInit() {
    // Controlla che l'utente sia un amministratore
    this.authService.isAdmin().subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.initMap();
      await this.caricaParcheggiSalvati();
    }
  } //OK


  documentName: string = ''; 
  // Carica i parcheggi dal CSV
  loadFromCsv(documentName: string){
    const csvPath = `assets/${documentName}.csv`;
    this.http.get(csvPath, { responseType: 'text' })
      .subscribe((data: string) => {
        this.parseCsv(data);
        this.loadParking();
        this.saveParking();
        this.caricaParcheggiSalvati();
      }); 
  } // OK
 
  // Lettura del file CSV 
  parseCsv(csvText: string): void {
      const rows = csvText.split('\n');
      const headers = rows[0].split(',');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        const rowData: any = {};

        for (let j = 0; j < headers.length; j++) {
          rowData[headers[j]] = row[j];
        }

        this.csvData.push(rowData);
      }

      console.log('Lettura del file CSV completata:', this.csvData);
  } // OK
    
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
        if (!this.isAdmin) {
        this.handleRectangleRightClick(event.latlng); // Mostra la finestra "Prenota"
        }
      if (this.isAdmin){
        this.makeInaccessible(event.latlng);
      }
      } else {
        if (this.isAdmin) {
        this.showAddBoxConfirmation(event); // Mostra la finestra "Aggiungi"
        }
      }
    });   

    // Double click -> delBox
    this.mappa.on('click', (event: L.LeafletMouseEvent) => {
        const currentTime = new Date().getTime();
        
        if (this.isAdmin) {
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
        } 
    });
  } // OK

  makeInaccessible(latlng: L.LatLng) {
    // Itera attraverso i rettangoli esistenti per verificare quale è stato cliccato
    for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
      if (rectangle.getBounds().contains(latlng)) {
        const parcheggio = this.rectangleParcheggioMap.get(rectangle);
        if (parcheggio) {
          this.showInaccessPopup(rectangle, parcheggio); 
        }
        break; 
      }
    }
  } 
      
  showInaccessPopup(rectangle: L.Rectangle, parcheggio: Parcheggio) {
    const initialState = { parcheggio }; // Passa il parcheggio come parte dello stato iniziale
    const popupContent = `
      <button id="inaccessButton">Rendi inaccessibile</button>
    `;

    // Crea una finestra popup e imposta il contenuto
    const popup = L.popup().setContent(popupContent);

    // Mostra la finestra popup vicino al rettangolo
    popup.setLatLng(rectangle.getBounds().getCenter()).openOn(this.mappa);

    // Aggiungi un gestore di eventi per il clic sul pulsante "rendi inaccessibile"
    const inaccessButton = document.getElementById('inaccessButton');
    if (inaccessButton) {  
      inaccessButton.addEventListener('click', () => {
        // cambia lo stato del parcheggio in "inaccessibile"
        this.updateStateToInaccessible(parcheggio);
        this.mappa.closePopup(popup); // Chiude la finestra pop up     
    });
    }
  }

  updateStateToInaccessible(parcheggio: Parcheggio) {
    console.log('sto chiamando la funzione updateStateToInaccessible');
    const parcheggioId = parcheggio.pid;
    parcheggio.state = 'inaccessibile';
    // Aggiorna lo stato nel database
    this.firebaseService.updateParcheggioState(parcheggio.pid, 'inaccessibile').then(() => {
      console.log('Stato del parcheggio aggiornato a "inaccessibile" nel database.');
      this.caricaParcheggiSalvati();

      // Trova il rettangolo associato al parcheggio
      const rectangle = Array.from(this.rectangleMarkerMap.keys()).find((rect) => {
        const associatedParcheggio = this.rectangleParcheggioMap.get(rect);
        return associatedParcheggio && associatedParcheggio.pid === parcheggio.pid;
      });

      // Cambia il colore del rettangolo in giallo
      if (rectangle) {
        console.log('Rectangle Style Before Change:', rectangle.options);
        rectangle.setStyle({ fillColor: 'yellow', color: 'yellow' });
      }
    });
  }

  handleRectangleRightClick(latlng: L.LatLng) {
    // Itera attraverso i rettangoli esistenti per verificare quale è stato cliccato
    for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
      if (rectangle.getBounds().contains(latlng)) {
        const parcheggio = this.rectangleParcheggioMap.get(rectangle);
        if (parcheggio) {
          this.showBookPopup(rectangle, parcheggio); 
        }
        break; 
      }
    }
  } // OK

  bsModalRef!: BsModalRef;
  rectangleParcheggioMap: Map<L.Rectangle, Parcheggio> = new Map();

  loadParking() {
    for (const item of this.csvData) {
      const coordinate = {
        lat: parseFloat(item.Latitudine),
        lng: parseFloat(item.Longitudine)
      };
      const latlng = new L.LatLng(coordinate.lat, coordinate.lng);
      const id =  this.firebaseService.generateParcheggioID(latlng);  
      const stato = 'disponibile';
      this.getAddress(coordinate.lat, coordinate.lng).subscribe(indirizzo => {
        const parcheggio: Parcheggio = {
          pid: id,
          indirizzo: indirizzo, // Aggiorna con l'indirizzo ottenuto
          coordinate: {
            lat: coordinate.lat,
            lng: coordinate.lng,
          },
          data_salvataggio: new Date().toISOString(),
          state: stato,
          FasceOrarie: {
            '09:00-10:00': {
              stato: 'disponibile',
            },
            '10:00-11:00': {
              stato: 'disponibile',
            },
            '11:00-12:00': {
              stato: 'disponibile',
            },
            '12:00-13:00': {
              stato: 'disponibile',
            },
            '13:00-14:00': {
              stato: 'disponibile',
            },
            '14:00-15:00': {
              stato: 'disponibile',
            },
            '15:00-16:00': {
              stato: 'disponibile',
            },
            '16:00-17:00': {
              stato: 'disponibile',
            },
            '17:00-18:00': {
              stato: 'disponibile',
            },
            '18:00-19:00': {
              stato: 'disponibile',
            }
          }
        };
        this.firebaseService.addParcheggio(parcheggio);
      });
  
    }
    console.log('loadParking() completato');
  } // OK

  addBox(coordinate: { lat: number; lng: number }) {
    const latlng = new L.LatLng(coordinate.lat, coordinate.lng);
    

    const bounds = L.latLngBounds([
      [latlng.lat + this.length, latlng.lng - this.width],
      [latlng.lat - this.length, latlng.lng + this.width],
    ]);

    const id =  this.firebaseService.generateParcheggioID(latlng);  
    const stato = 'disponibile';
    const center = bounds.getCenter();

    const rectangle = new L.Rectangle(bounds).addTo(this.mappa);  
    // Store the state and color in localStorage
    // localStorage.setItem(`parking-${id}`, JSON.stringify({ state: stato, color: 'green' }));

    // Crea il marker utilizzando l'icona personalizzata
    const marker = L.marker(latlng, { icon: this.customIcon, draggable: true }).addTo(this.mappa);

    // Associa il rettangolo al marker nella mappa
    this.rectangleMarkerMap.set(rectangle, marker);

    marker.on('dragend', () => {
      const newLatLng = marker.getLatLng();
      this.moveParcheggio(marker, newLatLng);
    });
    
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
        FasceOrarie: {
          '09:00-10:00': {
            stato: 'disponibile',
          },
          '10:00-11:00': {
            stato: 'disponibile',
          },
          '11:00-12:00': {
            stato: 'disponibile',
          },
          '12:00-13:00': {
            stato: 'disponibile',
          },
          '13:00-14:00': {
            stato: 'disponibile',
          },
          '14:00-15:00': {
            stato: 'disponibile',
          },
          '15:00-16:00': {
            stato: 'disponibile',
          },
          '16:00-17:00': {
            stato: 'disponibile',
          },
          '17:00-18:00': {
            stato: 'disponibile',
          },
          '18:00-19:00': {
            stato: 'disponibile',
          }
        }
      };
      this.rectangleParcheggioMap.set(rectangle, parcheggio);
    });
  } 

  // Notifica di conferma di addBox()
  showAddBoxConfirmation(event: L.LeafletMouseEvent) {
    this.bsModalRef = this.modalService.show(AddBoxConfirmationComponent);
  // Gestisci l'evento emesso dalla finestra  al momento dell'aggiunta
  this.bsModalRef.content.onAddBox.subscribe(() => {
    this.addBox(event.latlng); 
    this.bsModalRef.hide(); 
  });
  }

  // Sposta un parcheggio
  moveParcheggio(marker: L.Marker, newLatLng: L.LatLng) {
    // Trova il parcheggio associato al marker
    const associatedRectangle = Array.from(this.rectangleMarkerMap.keys()).find(key => this.rectangleMarkerMap.get(key) === marker);
    const associatedParcheggio = associatedRectangle ? this.rectangleParcheggioMap.get(associatedRectangle) : null;

    if (associatedRectangle && associatedParcheggio) {
      // Rimuove il vecchio rettangolo e marker dalla mappa
      this.mappa.removeLayer(associatedRectangle);
      this.mappa.removeLayer(marker);
      // Rimuove il vecchio parcheggio dal database
      this.firebaseService.deleteParcheggio(associatedParcheggio);

      // Crea un nuovo rettangolo e marker con le nuove coordinate
      const newBounds = L.latLngBounds([
        [newLatLng.lat + this.length, newLatLng.lng - this.width],
        [newLatLng.lat - this.length, newLatLng.lng + this.width],
      ]);

      const newRectangle = L.rectangle(newBounds).addTo(this.mappa);

      const newMarker = L.marker(newLatLng, { icon: this.customIcon, draggable: true }).addTo(this.mappa);

      // Aggiorna il rettangolo e il marker associati
      this.rectangleMarkerMap.set(newRectangle, newMarker);

      // Nuovo parcheggio
      const new_latlng = new L.LatLng(newLatLng.lat, newLatLng.lng);
      this.getAddress(newLatLng.lat, newLatLng.lng).subscribe((new_address: string)=> {

      console.log("new_address creato:", new_address);
        
      const new_parcheggio: Parcheggio = {
        pid: associatedParcheggio.pid,//new_id,
        indirizzo: new_address, // Aggiorna con l'indirizzo ottenuto
        coordinate: {
          lat: newLatLng.lat,
          lng: newLatLng.lng,
        },
        data_salvataggio: new Date().toISOString(),
        state: 'disponibile',
        FasceOrarie: {
          '09:00-10:00': {
            stato: 'disponibile',
          },
          '10:00-11:00': {
            stato: 'disponibile',
          },
          '11:00-12:00': {
            stato: 'disponibile',
          },
          '12:00-13:00': {
            stato: 'disponibile',
          },
          '13:00-14:00': {
            stato: 'disponibile',
          },
          '14:00-15:00': {
            stato: 'disponibile',
          },
          '15:00-16:00': {
            stato: 'disponibile',
          },
          '16:00-17:00': {
            stato: 'disponibile',
          },
          '17:00-18:00': {
            stato: 'disponibile',
          },
          '18:00-19:00': {
            stato: 'disponibile',
          }
        }
      };

      this.rectangleParcheggioMap.set(newRectangle, new_parcheggio);
      this.firebaseService.addParcheggio(new_parcheggio);
      console.log("Parcheggio con indirizzo aggiornato:", new_parcheggio.indirizzo);
      });
      
    }
  }

  delBox(latlng: L.LatLng){
  this.mappa.eachLayer((layer: L.Layer) => {
    if (layer instanceof L.Rectangle && layer.getBounds().contains(latlng)) {
      this.showDeleteConfirmation(layer);
    }
  });
  }

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
              FasceOrarie: {
                '09:00-10:00': {
                  stato: 'disponibile',
                },
                '10:00-11:00': {
                  stato: 'disponibile',
                },
                '11:00-12:00': {
                  stato: 'disponibile',
                },
                '12:00-13:00': {
                  stato: 'disponibile',
                },
                '13:00-14:00': {
                  stato: 'disponibile',
                },
                '14:00-15:00': {
                  stato: 'disponibile',
                },
                '15:00-16:00': {
                  stato: 'disponibile',
                },
                '16:00-17:00': {
                  stato: 'disponibile',
                },
                '17:00-18:00': {
                  stato: 'disponibile',
                },
                '18:00-19:00': {
                  stato: 'disponibile',
                }
              }
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
  } // OK

  parcheggiSalvati: Parcheggio[] = []; 
  parcheggioSelezionato: Parcheggio | null = null;

  async caricaParcheggiSalvati() {
    await this.firebaseService.getParcheggi().then((parcheggi) => {
      this.parcheggiSalvati = parcheggi;
      this.mostraParcheggiSullaMappa();
      this.setColorsBasedOnState();
      console.log('Parcheggi salvati:', this.parcheggiSalvati);
    });
  }

  mostraParcheggiSullaMappa() {
    // Itera attraverso i parcheggi salvati e aggiungi i marker sulla mappa per ciascun parcheggio
    for (const parcheggio of this.parcheggiSalvati) {
      this.addMarker(parcheggio);
      this.addBox(parcheggio.coordinate); 
      /*
      // Imposta il colore del rettangolo in base allo stato
    const rectangle = Array.from(this.rectangleParcheggioMap.keys()).find((rect) => {
      const associatedParcheggio = this.rectangleParcheggioMap.get(rect);
      return associatedParcheggio && associatedParcheggio.pid === parcheggio.pid;
    });

    if (rectangle) {
      if (parcheggio.state === 'disponibile') {
        rectangle.setStyle({ fillColor: 'green', color: 'green' });
      } else if (parcheggio.state === 'occupato') {
        rectangle.setStyle({ fillColor: 'red', color: 'red' });
      }
    } */
    }
    
  }
  
  setColorsBasedOnState() {
    Array.from(this.rectangleMarkerMap.keys()).forEach((rectangle) => {
      const associatedParcheggio = this.rectangleParcheggioMap.get(rectangle);
      if (associatedParcheggio) {
        const parcheggio = this.parcheggiSalvati.find((p) => p.pid === associatedParcheggio.pid);
        if (parcheggio) {
          if (parcheggio.state === 'disponibile') {
            rectangle.setStyle({ fillColor: 'green', color: 'green' });
          } else if (parcheggio.state === 'occupato') {
            rectangle.setStyle({ fillColor: 'red', color: 'red' });
          } else if (parcheggio.state === 'inaccessibile') {
            rectangle.setStyle({ fillColor: 'yellow', color: 'yellow' });
          }
        }
      }
    });
  }

  addMarker(parcheggio: Parcheggio) { 
    // Aggiungi un marker nella posizione del parcheggio 
    const marker = L.marker([parcheggio.coordinate.lat, parcheggio.coordinate.lng], {
      icon: this.customIcon, // Utilizza l'icona personalizzata
    }).addTo(this.mappa);

    // Assume che parcheggio sia l'oggetto del parcheggio che stai mostrando sulla mappa
    for (const fasciaOraria in this.fasceOrarieService.fasceOrarie) {
      if (parcheggio.FasceOrarie.hasOwnProperty(fasciaOraria)) {
        this.fasceOrarieService.fasceOrarie[fasciaOraria].stato = parcheggio.FasceOrarie[fasciaOraria].stato;
      }
    }
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

  // PRENOTAZIONE

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
        
        this.openBookingModal(parcheggio); // Apre la finestra modale
        this.mappa.closePopup(popup); // Chiude la finestra pop up     
    });
    }
  }

  openBookingModal(parcheggio: Parcheggio) {
    this.firebaseService.getFasceOrarieParcheggio(parcheggio.pid).then(fasceOrarie => {
      const initialState = { parcheggio, fasceOrarie };
      const modalRef: BsModalRef = this.modalService.show(BookingComponent, {initialState});
      modalRef.content?.onConferma.subscribe((result: boolean) => {
        if (result) {
          this.caricaParcheggiSalvati();
        }

      });
   });
  }

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

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const csvData = e.target.result;
        this.parseCsv(csvData);
        this.loadParking();
        this.saveParking();
        this.caricaParcheggiSalvati();
      };

      reader.readAsText(file);
    }
  }






}
