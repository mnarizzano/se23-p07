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


// Manages the map 
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
    public fasceOrarieService: FasceOrarieService,
    private location: Location,
    ) {}


  async ngOnInit() {
    this.authService.isAdmin().subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.initMap();
      await this.caricaParcheggiSalvati();
    }
  } 


  documentName: string = ''; 
  // Loads several parking slots from a csv file 
  loadFromCsv(documentName: string){
    const csvPath = `assets/${documentName}.csv`;
    this.http.get(csvPath, { responseType: 'text' })
      .subscribe((data: string) => {
        this.parseCsv(data);
        this.loadParking();
        this.saveParking();
        this.caricaParcheggiSalvati();
      }); 
  } 

  // Reads the content of a csv file
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
  } 

  // Initializes the map (using OpenStreetMao)
  initMap() {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.mappa = L.map(this.mapContainer.nativeElement).setView([44.4056, 8.9463], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
      }).addTo(this.mappa); 
    }
    
    // Right click on the map 
    this.mappa.on('contextmenu', (event: L.LeafletMouseEvent) => {
      // Checks if it is inside or not an existent rectangle
      let isInsideRectangle = false;
      for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
        if (rectangle.getBounds().contains(event.latlng)) {
          isInsideRectangle = true;
          break; // If the click is inside, exit 
        }
      }

      if (isInsideRectangle) {
        if (!this.isAdmin) {
        this.handleRectangleRightClick(event.latlng); // Show "Prenota" window 
        }
      if (this.isAdmin){
        this.makeInaccessible(event.latlng);
      }
      } else {
        if (this.isAdmin) {
        this.showAddBoxConfirmation(event); // Show "Aggiungi" window
        }
      }
    });   

    // Double click -> delBox
    this.mappa.on('click', (event: L.LeafletMouseEvent) => {
        const currentTime = new Date().getTime();
        
        if (this.isAdmin) {
          if (currentTime - this.lastClickTime < 300) {
            clearTimeout(this.clickTimeout);
            this.delBox(event.latlng); // double left-click on the rectangle -> delBox
          } else { // single left-click on the rectangle -> pop up window
              for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
                if (rectangle.getBounds().contains(event.latlng)) {
                  const parcheggio = this.rectangleParcheggioMap.get(rectangle);
                  if (parcheggio) {
                    this.showPropertyPopup(parcheggio); // Show parking properties 
                  }
                  break;
                }
              }
            }
          this.lastClickTime = currentTime;
        } 
    });
  } 

  // makes a parking slot inaccessible 
  makeInaccessible(latlng: L.LatLng) {
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

  // shows a popup window to make a parking slot inaccessible 
  showInaccessPopup(rectangle: L.Rectangle, parcheggio: Parcheggio) {
    const initialState = { parcheggio }; 
    const popupContent = `
      <button id="inaccessButton">Rendi inaccessibile</button>
    `;
    const popup = L.popup().setContent(popupContent);
    popup.setLatLng(rectangle.getBounds().getCenter()).openOn(this.mappa);

    // Manage if click on "Rendi inaccessibile" button 
    const inaccessButton = document.getElementById('inaccessButton');
    if (inaccessButton) {  
      inaccessButton.addEventListener('click', () => {
        // change the state into "inaccessibile"
        this.updateStateToInaccessible(parcheggio);
        this.mappa.closePopup(popup);     
    });
    }
  } 


  // updates the state of a parking slot into "inaccessible"
  updateStateToInaccessible(parcheggio: Parcheggio) {
    console.log('sto chiamando la funzione updateStateToInaccessible');
    const parcheggioId = parcheggio.pid;
    parcheggio.state = 'inaccessibile';
    // Update state into the database
    this.firebaseService.updateParcheggioState(parcheggio.pid, 'inaccessibile').then(() => {
      console.log('Stato del parcheggio aggiornato a "inaccessibile" nel database.');
      this.caricaParcheggiSalvati();
      const rectangle = Array.from(this.rectangleMarkerMap.keys()).find((rect) => {
        const associatedParcheggio = this.rectangleParcheggioMap.get(rect);
        return associatedParcheggio && associatedParcheggio.pid === parcheggio.pid;
      });
      if (rectangle) {
        console.log('Rectangle Style Before Change:', rectangle.options);
        rectangle.setStyle({ fillColor: 'yellow', color: 'yellow' });
      }
    });
  } 

  
  handleRectangleRightClick(latlng: L.LatLng) {
    // Iterates among the existing rectangles to veriy on which the user clicked on
    for (const [rectangle, marker] of this.rectangleMarkerMap.entries()) {
      if (rectangle.getBounds().contains(latlng)) {
        const parcheggio = this.rectangleParcheggioMap.get(rectangle);
        if (parcheggio) {
          this.showBookPopup(rectangle, parcheggio); 
        }
        break; 
      }
    }
  } 

  bsModalRef!: BsModalRef;
  rectangleParcheggioMap: Map<L.Rectangle, Parcheggio> = new Map();

  // loads the parking slots from the database with the relative attributes
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
          indirizzo: indirizzo, 
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
  } 

  // Adds a box that represents the parking slot
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
    const marker = L.marker(latlng, { icon: this.customIcon, draggable: true }).addTo(this.mappa);
    this.rectangleMarkerMap.set(rectangle, marker);

    // move marker
    marker.on('dragend', () => {
      const newLatLng = marker.getLatLng();
      this.moveParcheggio(marker, newLatLng);
    });
    
    this.getAddress(center.lat, center.lng).subscribe(indirizzo => {
      const parcheggio: Parcheggio = {
        pid: id,
        indirizzo: indirizzo, 
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

  // shows the modal window for confirming the adding of a parking slot
  showAddBoxConfirmation(event: L.LeafletMouseEvent) {
    this.bsModalRef = this.modalService.show(AddBoxConfirmationComponent);
  this.bsModalRef.content.onAddBox.subscribe(() => {
    this.addBox(event.latlng); 
    this.bsModalRef.hide(); 
  });
  } 

  // moves a parking slot from a position to another one
  moveParcheggio(marker: L.Marker, newLatLng: L.LatLng) {
    const associatedRectangle = Array.from(this.rectangleMarkerMap.keys()).find(key => this.rectangleMarkerMap.get(key) === marker);
    const associatedParcheggio = associatedRectangle ? this.rectangleParcheggioMap.get(associatedRectangle) : null;
    if (associatedRectangle && associatedParcheggio) {
      this.mappa.removeLayer(associatedRectangle);
      this.mappa.removeLayer(marker);
      this.firebaseService.deleteParcheggio(associatedParcheggio);

      const newBounds = L.latLngBounds([
        [newLatLng.lat + this.length, newLatLng.lng - this.width],
        [newLatLng.lat - this.length, newLatLng.lng + this.width],
      ]);
      const newRectangle = L.rectangle(newBounds).addTo(this.mappa);
      const newMarker = L.marker(newLatLng, { icon: this.customIcon, draggable: true }).addTo(this.mappa);
      this.rectangleMarkerMap.set(newRectangle, newMarker);
      const new_latlng = new L.LatLng(newLatLng.lat, newLatLng.lng);
      this.getAddress(newLatLng.lat, newLatLng.lng).subscribe((new_address: string)=> {
      console.log("new_address creato:", new_address);
      const new_parcheggio: Parcheggio = {
        pid: associatedParcheggio.pid,
        indirizzo: new_address, 
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

  // deletes the box from the map
  delBox(latlng: L.LatLng){
  this.mappa.eachLayer((layer: L.Layer) => {
    if (layer instanceof L.Rectangle && layer.getBounds().contains(latlng)) {
      this.showDeleteConfirmation(layer);
    }
  });
  } 

  private parcheggiDaEliminare: Parcheggio[] = [];

  // shows the modal window for confirming the deletion of the parking slot 
  showDeleteConfirmation(layer: L.Rectangle) {
    const modalRef: BsModalRef = this.modalService.show(DeleteConfirmationComponent);
    modalRef.content?.onClose.subscribe((result: boolean) => {
      if (result) {
        const associatedParcheggio = this.rectangleParcheggioMap.get(layer);
        if (associatedParcheggio) {
          this.mappa.removeLayer(layer);
          const associatedMarker = this.rectangleMarkerMap.get(layer);
          if (associatedMarker) {
            this.mappa.removeLayer(associatedMarker);
          }
          this.rectangleMarkerMap.delete(layer);
          this.rectangleParcheggioMap.delete(layer);
          this.markerAdded = false;
          this.parcheggiDaEliminare.push(associatedParcheggio);
        }
      }
    });
  } 

  mapMarker: any;
  markerAdded: boolean = false;

  // saves the parkign slots into the database 
  async saveParking() {
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
            // Verify if the parking slot is already in the database
            const parcheggioNelDatabase = parcheggiNelDatabase.find((dbParcheggio: Parcheggio) =>
              this.areCoordinatesEqual(dbParcheggio.coordinate, parcheggio.coordinate)
            );
            if (!parcheggioNelDatabase) {
              this.parcheggiSalvati.push(parcheggio);
              await this.firebaseService.addParcheggio(parcheggio);
            }
          } else {
            console.error('Utente non autenticato.');
          }
        });
      }
    });

    // Deletes the PS to be deleted from the database 
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

  // manages the click on the save button for saving the parking slots
  onSaveButtonClick() {
    const initialState = {}; 
    // Open "Save" window
    const modalRef: BsModalRef = this.modalService.show(SaveConfirmationComponent, { initialState });
    // Manage the event triggered from confirming
    modalRef.content.onConfirm.subscribe((result: boolean) => {
      if (result) {
        this.saveParking(); 
      }
    });
  } 

  // search an address localizing it on the map
  searchAddress() {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${this.searchQuery}`;

      const customIcon = L.icon({
        iconUrl: 'assets/icona.png', 
        iconSize: [32, 32], 
        iconAnchor: [16, 32], 
      });

    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          const marker = L.marker([lat, lon], {
            icon: customIcon,
          }).addTo(this.mappa)
          .bindPopup(result.display_name);

            this.mappa.setView([lat, lon], 16);

          // Open popup when mouse on marker (mouseover)
            marker.on('mouseover', () => {
              marker.openPopup();
            });

          // Close popup when mouse not on marker (mouseout)
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

  // takes the address from a pairs of coordinates
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

  parcheggiSalvati: Parcheggio[] = []; 
  parcheggioSelezionato: Parcheggio | null = null;

  // Loads the parkign slots 
  async caricaParcheggiSalvati() {
    await this.firebaseService.getParcheggi().then((parcheggi) => {
      this.parcheggiSalvati = parcheggi;
      this.mostraParcheggiSullaMappa();
      this.setColorsBasedOnState();
      console.log('Parcheggi salvati:', this.parcheggiSalvati);
    });
  } 

  // shows the parking slots on the map 
  mostraParcheggiSullaMappa() {
    for (const parcheggio of this.parcheggiSalvati) {
      this.addMarker(parcheggio);
      this.addBox(parcheggio.coordinate); 
    }
  } 

  // set the color of the rectangle depending on its state
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

  // adds a marker for each parking slot
  addMarker(parcheggio: Parcheggio) { 
    const marker = L.marker([parcheggio.coordinate.lat, parcheggio.coordinate.lng], {
      icon: this.customIcon, 
    }).addTo(this.mappa);
      for (const fasciaOraria in this.fasceOrarieService.fasceOrarie) {
        if (parcheggio.FasceOrarie.hasOwnProperty(fasciaOraria)) {
          this.fasceOrarieService.fasceOrarie[fasciaOraria].stato = parcheggio.FasceOrarie[fasciaOraria].stato;
        }
      }
  
    const popupContent = `
      <strong>Indirizzo:</strong> ${parcheggio.indirizzo}<br>
    `;
    marker.bindPopup(popupContent);
  }

  // selects a parking slots from the map
  selectParking(parcheggio: Parcheggio) {
    this.parcheggioSelezionato = parcheggio;
    this.updateMap(parcheggio);
  } 


  // updates the map 
  updateMap(parcheggio: Parcheggio) {
    this.mappa.setView([parcheggio.coordinate.lat, parcheggio.coordinate.lng], 16);
    const marker = L.marker([parcheggio.coordinate.lat, parcheggio.coordinate.lng], {
      icon: this.customIcon, 
    }).addTo(this.mappa);
    this.showPropertyPopup(parcheggio);
  } 

  // BOOKING 

  // shows the booking popup window
  showBookPopup(rectangle: L.Rectangle, parcheggio: Parcheggio) {
    const popupContent = `
      <button id="prenotaButton">Prenota</button>
    `;

    const popup = L.popup().setContent(popupContent);

    popup.setLatLng(rectangle.getBounds().getCenter()).openOn(this.mappa);

    // Click on "Prenota" 
    const prenotaButton = document.getElementById('prenotaButton');
    if (prenotaButton) {  
      prenotaButton.addEventListener('click', () => {
        
        this.openBookingModal(parcheggio); 
        this.mappa.closePopup(popup);    
    });
    }
  } 

  // opens the modal window for the booking of a PS
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

  // popup window that shows the property of a PS
  showPropertyPopup(parcheggio: Parcheggio) {
    const popupContent = `
      <strong>Indirizzo:</strong> ${parcheggio.indirizzo}<br>
      <strong>Coordinate:</strong> Lat: ${parcheggio.coordinate.lat}, Lng: ${parcheggio.coordinate.lng}<br>
      <strong>Stato:</strong> ${parcheggio.state}<br>
      <strong>Data di Salvataggio:</strong> ${parcheggio.data_salvataggio}<br>
    `;
    const popup = L.popup().setContent(popupContent);
    popup.setLatLng([parcheggio.coordinate.lat, parcheggio.coordinate.lng]).openOn(this.mappa);
  } 

  // Reloads the page
  updateData() {
    this.cdr.detectChanges();
  } 

  // Confirm the deletion of all the parking slots 
  confirmDeleteAllParcheggi() {
    const initialState = {};
    this.bsModalRef = this.modalService.show(DeleteAllConfirmationComponent, {
      initialState,
      class: 'modal-dialog-centered',
    });
    this.bsModalRef.content.onConfirm.subscribe(() => {
      this.firebaseService.deleteAllParcheggi(); 
      this.bsModalRef.hide(); // Close confirm window 
    });
  } 

  // Selects a csv file
  onFileSelected(event: any) {
    console.log('onFileSelected called');
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const csvData = e.target.result;
        console.log('prima di parseCsv');
        this.parseCsv(csvData);
        console.log('dopo parseCsv');
        this.loadParking();
        this.saveParking();
        this.caricaParcheggiSalvati();
      };

      reader.readAsText(file);
    }
  } 

}
