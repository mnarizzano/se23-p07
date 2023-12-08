import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FirebaseService } from '../shared/services/firebase.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../shared/services/auth.service';
import { FasceOrarieService } from '../fasce-orarie.service';
import { Location } from '@angular/common';
import { AppModule } from '../app.module';
import { of } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core'; 
import { Parcheggio } from '../shared/services/parking.interface';
import * as L from 'leaflet';
import { AddBoxConfirmationComponent } from '../add-box-confirmation/add-box-confirmation.component';
import { LeafletMouseEvent } from 'leaflet';
import { ChangeDetectorRef } from '@angular/core';
import { BookingComponent } from '../booking/booking.component';







describe('MapComponent', () => {
  
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let modalService: BsModalService; 
  let firebaseService: FirebaseService; 
  let authService: jasmine.SpyObj<AuthService>;
  let fasceOrarieService: FasceOrarieService; 
  let location: Location; 
  let httpTestingController: HttpTestingController;
  let cdr: ChangeDetectorRef;
  
  const mockModalRef = {
    content: {
      onConferma: of(true), 
    },
  };



  beforeEach(waitForAsync(() => {
    modalService = jasmine.createSpyObj('BsModalService', ['show']);
    firebaseService = {
      generateParcheggioID: jasmine.createSpy('generateParcheggioID'),
      addParcheggio: jasmine.createSpy('addParcheggio'),
      getParcheggi: jasmine.createSpy('getParcheggi'),
      deleteParcheggio: jasmine.createSpy('deleteParcheggio'),
      updateParcheggioState: jasmine.createSpy('updateParcheggioState'),
      updateParcheggio: jasmine.createSpy('updateParcheggio'),
      deleteAllParcheggi: jasmine.createSpy('deleteAllParcheggi'),
      getParcheggioById: jasmine.createSpy('getParcheggioById'),
      getFasceOrarieParcheggio: jasmine.createSpy('getFasceOrarieParcheggio'),
      updateFasciaOraria: jasmine.createSpy('updateFasciaOraria'),
    };

    const fasceOrarieService: Partial<FasceOrarieService> = {
      fasceOrarie: { // Simula il tuo oggetto fasceOrarie
        '08:00-09:00': { stato: 'disponibile' },
        '09:00-10:00': { stato: 'disponibile' },
        '10:00-11:00': { stato: 'disponibile' },
        '11:00-12:00': { stato: 'disponibile' },
        '12:00-13:00': { stato: 'disponibile' },
        '13:00-14:00': { stato: 'disponibile' },
        '14:00-15:00': { stato: 'disponibile' },
        '15:00-16:00': { stato: 'disponibile' },
        '16:00-17:00': { stato: 'disponibile' },
        '17:00-18:00': { stato: 'disponibile' },
        '18:00-19:00': { stato: 'disponibile' },
        '19:00-20:00': { stato: 'disponibile' }
      },
      getFasceOrarie: jasmine.createSpy('getFasceOrarie'),
      getStatoFasciaOraria: jasmine.createSpy('getStatoFasciaOraria'),
      setStatoFasciaOraria: jasmine.createSpy('setStatoFasciaOraria'),
      updateStatoParcheggio: jasmine.createSpy('updateStatoParcheggio'),
      getStatoParcheggio: jasmine.createSpy('getStatoParcheggio'),
      areAllFasceOccupate: jasmine.createSpy('areAllFasceOccupate'),

    };
    authService = jasmine.createSpyObj('AuthService', ['isAdmin']);
   // fasceOrarieService = jasmine.createSpyObj('FasceOrarieService', ['isAdmin']);
    location = jasmine.createSpyObj('Location', ['isAdmin']);

    TestBed.configureTestingModule({
      declarations: [MapComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BsModalService, useValue: modalService },
        { provide: FirebaseService, useValue: firebaseService },
        { provide: HttpClient, useClass: HttpClient },
        { provide: AuthService, useValue: authService },
        { provide: FasceOrarieService, useValue: fasceOrarieService },
        { provide: Location, useValue: location },
        {
          provide: ChangeDetectorRef,
          useValue: {
            detectChanges: jasmine.createSpy('detectChanges'),
          },
        },
      ],
      imports: [HttpClientModule, AppModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    firebaseService = TestBed.inject(FirebaseService);
    httpTestingController = TestBed.inject(HttpTestingController); // Ottieni il controller per le richieste HTTP

  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initial isAdmin value of false', () => {
    expect(component.isAdmin).toBeFalse();
  });

  it('should initialize the component', async () => {
    // Simula il servizio AuthService per restituire true (utente amministratore)
    const authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.isAdmin.and.returnValue(of(true));
  
    // Controlla che la proprietà isAdmin sia inizializzata correttamente
    expect(component.isAdmin).toBe(false);
  
    // Simula la presenza di mapContainer
    component.mapContainer = { nativeElement: document.createElement('div') };
  
    // Simula il comportamento della funzione initMap (ad esempio, con uno spy)
    spyOn(component, 'initMap');
  
    // Simula il comportamento della funzione caricaParcheggiSalvati (ad esempio, con uno spy)
    spyOn(component, 'caricaParcheggiSalvati').and.returnValue(Promise.resolve());
  
    // Esegui ngOnInit
    await component.ngOnInit();
  
    // Verifica che initMap sia stato chiamato
    expect(component.initMap).toHaveBeenCalled();
  
    // Verifica che caricaParcheggiSalvati sia stato chiamato
    expect(component.caricaParcheggiSalvati).toHaveBeenCalled();
  });

  it('should load data from CSV', () => {
    // Define the CSV data you want to simulate
    const csvData = 'csv_data_here';

    // Spy on the functions you want to test
    const parseCsvSpy = spyOn(component, 'parseCsv');
    const loadParkingSpy = spyOn(component, 'loadParking');
    const saveParkingSpy = spyOn(component, 'saveParking');
    const caricaParcheggiSalvatiSpy = spyOn(component, 'caricaParcheggiSalvati');

    // Call loadFromCsv with a mock documentName
    component.loadFromCsv('mock_document');

    // Expect that the http.get method is called with the correct URL
    const req = httpTestingController.expectOne('assets/mock_document.csv');
    expect(req.request.method).toBe('GET');

    // Respond to the request with the CSV data
    req.flush(csvData);

    // Expect that the parseCsv function was called with the CSV data
    expect(parseCsvSpy).toHaveBeenCalledWith(csvData);

    // Expect that the loadParking, saveParking, and caricaParcheggiSalvati functions were called
    expect(loadParkingSpy).toHaveBeenCalled();
    expect(saveParkingSpy).toHaveBeenCalled();
    expect(caricaParcheggiSalvatiSpy).toHaveBeenCalled();
  });
  
  it('should parse CSV data', () => {
    const csvText = 'Header1,Header2,Header3\nValue1,Value2,Value3\nValue4,Value5,Value6';
    component.parseCsv(csvText);

    // Verifica che this.csvData sia stato popolato correttamente
    expect(component.csvData).toEqual([
      { Header1: 'Value1', Header2: 'Value2', Header3: 'Value3' },
      { Header1: 'Value4', Header2: 'Value5', Header3: 'Value6' }
    ]);
  });

  it('should call initMap() function', () => {
    component.isAdmin = true;
    component.lastClickTime = 0;
    component.rectangleMarkerMap = new Map();
    component.rectangleParcheggioMap = new Map();
    component.mapContainer = {
      nativeElement: document.createElement('div'),
    };

    component.initMap();

    expect(component.mappa).toBeDefined();
  });








it('should handle right-click on rectangle', () => {
  const latlng: L.LatLng = L.latLng(42.3601, -71.0589);

  // Create a sample rectangle and marker
  const rectangle = L.rectangle([
    [42.3600, -71.0590],
    [42.3602, -71.0588],
  ]);
  const marker = L.marker([42.3601, -71.0589]);

  // Create a sample Parcheggio object
  const parcheggio: Parcheggio = {
    pid: 'samplePid',
    indirizzo: 'Sample Address',
    coordinate: {
      lat: 42.3601,
      lng: -71.0589,
    },
    data_salvataggio: '2023-11-07',
    state: 'disponibile',
    FasceOrarie: {},
  };

  // Manually iterate over the data
  component.rectangleMarkerMap.set(rectangle, marker);

  for (const [rect, mark] of component.rectangleMarkerMap) {
    spyOn(rect.getBounds(), 'contains').and.returnValue(true);
    spyOn(component.rectangleParcheggioMap, 'get').and.returnValue(parcheggio);
  }

  spyOn(component, 'showBookPopup');

  component.handleRectangleRightClick(latlng);

  // Verify that showBookPopup is called with the correct arguments
  expect(component.showBookPopup).toHaveBeenCalledWith(rectangle, parcheggio);
});






  it('should get address from lat/lng', () => {
    const lat = 42.3601; // Latitudine fittizia
    const lng = -71.0589; // Longitudine fittizia

    // Chiamata mock alla tua funzione
    component.getAddress(lat, lng).subscribe((address: string) => {
      expect(address).toBe('Il tuo indirizzo previsto');
    });

    // Cattura la richiesta HTTP e simula una risposta
    const req = httpTestingController.expectOne((request) => {
      return request.url.includes(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    });

    const mockResponse = { display_name: 'Il tuo indirizzo previsto' };
    req.flush(mockResponse);

    // Assicurati che non ci siano altre richieste HTTP rimanenti
    httpTestingController.verify();
  });
  
  it('should load parking', () => {
    // Simula la risposta della funzione getAddress
    spyOn(component, 'getAddress').and.returnValue(of('Indirizzo Simulato'));

    // Simula il comportamento di csvData (sostituisci con i tuoi dati CSV di test)
    component.csvData = [
      { Latitudine: '42.3601', Longitudine: '-71.0589' },
      // Aggiungi altri dati CSV di test se necessario
    ];

    component.loadParking();

    // Assicurati che generateParcheggioID sia stato chiamato con i dati appropriati
    expect(firebaseService.generateParcheggioID).toHaveBeenCalledWith(jasmine.any(Object));

    // Assicurati che addParcheggio sia stato chiamato con i dati appropriati
    expect(firebaseService.addParcheggio).toHaveBeenCalledWith(jasmine.any(Object));

    // Assicurati che getAddress sia stato chiamato
    expect(component.getAddress).toHaveBeenCalled();
  });


});
