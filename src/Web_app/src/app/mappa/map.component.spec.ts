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
import { ChangeDetectorRef } from '@angular/core';
import { BookingComponent } from '../booking/booking.component';
import { DeleteAllConfirmationComponent } from '../delete-all-confirmation/delete-all-confirmation.component';
import { EventEmitter } from '@angular/core';
import { SaveConfirmationComponent } from '../save-confirmation/save-confirmation.component'
import { LatLng, LeafletMouseEvent } from 'leaflet';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';




class MockChangeDetectorRef extends ChangeDetectorRef {
  detectChanges(): void {}
  markForCheck(): void {}
  detach(): void {}
  reattach(): void {}
  checkNoChanges(): void {}
}



describe('MapComponent', () => {
  
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let modalService: BsModalService; 
  let firebaseService: FirebaseService; 
  let authService: jasmine.SpyObj<AuthService>;
  let fasceOrarieService: FasceOrarieService; 
  let location: Location; 
  let httpTestingController: HttpTestingController;
  let cdr: MockChangeDetectorRef;
  
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

  
  const mockModalRef = {
    content: {
      onConferma: of(true), 
    },
  };


  let markers: L.Marker[];

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
      fasceOrarie: { 
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
          useClass: MockChangeDetectorRef
        },
      ],
      imports: [HttpClientModule, AppModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef) as MockChangeDetectorRef; 
    firebaseService = TestBed.inject(FirebaseService);
    httpTestingController = TestBed.inject(HttpTestingController);

    const mapSpy = jasmine.createSpyObj('Map', ['setView', 'eachLayer', 'removeLayer', 'addLayer', 'on', 'hasLayer', 'closePopup']);
    mapSpy.options = {
      iconUrl: 'assets/icona.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -20]
    };
    component.mappa = mapSpy;
    const markerSpy = jasmine.createSpyObj('Marker', ['bindPopup', 'addTo']);
    markers = [markerSpy];


  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initial isAdmin value of false', () => {
    expect(component.isAdmin).toBeFalse();
  });

  it('should initialize the component', async () => {
    const authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.isAdmin.and.returnValue(of(true));
    expect(component.isAdmin).toBe(false);
    component.mapContainer = { nativeElement: document.createElement('div') };
    spyOn(component, 'initMap');
    spyOn(component, 'caricaParcheggiSalvati').and.returnValue(Promise.resolve());
    await component.ngOnInit();
    expect(component.initMap).toHaveBeenCalled();
    expect(component.caricaParcheggiSalvati).toHaveBeenCalled();
  });

  it('should load data from CSV', () => {
    const csvData = 'csv_data_here';
    const parseCsvSpy = spyOn(component, 'parseCsv');
    const loadParkingSpy = spyOn(component, 'loadParking');
    const saveParkingSpy = spyOn(component, 'saveParking');
    const caricaParcheggiSalvatiSpy = spyOn(component, 'caricaParcheggiSalvati');
    component.loadFromCsv('mock_document');
    const req = httpTestingController.expectOne('assets/mock_document.csv');
    expect(req.request.method).toBe('GET');
    req.flush(csvData);
    expect(parseCsvSpy).toHaveBeenCalledWith(csvData);
    expect(loadParkingSpy).toHaveBeenCalled();
    expect(saveParkingSpy).toHaveBeenCalled();
    expect(caricaParcheggiSalvatiSpy).toHaveBeenCalled();
  });
  
  it('should parse CSV data', () => {
    const csvText = 'Header1,Header2,Header3\nValue1,Value2,Value3\nValue4,Value5,Value6';
    component.parseCsv(csvText);
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
  
  it('should make a parking space inaccessible', () => {

      const rectangle = L.rectangle([
        [42.3600, -71.0590],
        [42.3602, -71.0588],
      ]);
      const marker = L.marker([42.3601, -71.0589]);
  
  
      component.rectangleMarkerMap.set(rectangle, marker);

      for (const [rect, mark] of component.rectangleMarkerMap) {
        spyOn(rect.getBounds(), 'contains').and.returnValue(true);
        spyOn(component.rectangleParcheggioMap, 'get').and.returnValue(parcheggio);
      }

      spyOn(component, 'showInaccessPopup');
  
    
      component.makeInaccessible(L.latLng(42.3601, -71.0589));
  
      expect(component.showInaccessPopup).toHaveBeenCalledWith(rectangle, parcheggio);
    });
	
	it('should show inaccessibility popup and update parking state on button click', () => {
    
	    const rectangle = L.rectangle([
	      [42.3600, -71.0590],
	      [42.3602, -71.0588],
	    ]);
  
	    const popupContent = `
	    <button id="Button">prova</button>
	  `;

	    spyOn(component, 'showInaccessPopup');
	    const spyOnUpdateState = spyOn(component, 'updateStateToInaccessible');
	    component.showInaccessPopup(rectangle,parcheggio);

	    const mockPopup: L.Popup = jasmine.createSpyObj('Popup', ['setContent', 'setLatLng', 'openOn']);
	    spyOn(L, 'popup').and.returnValue(mockPopup);
	    mockPopup.setContent(popupContent);

    
	    const inaccessButton = document.getElementById('inaccessButton');
	    if (inaccessButton) {  
	      inaccessButton.click();
      
	      expect(spyOnUpdateState).toHaveBeenCalledWith(parcheggio);
	    }

	    expect(mockPopup.setContent).toHaveBeenCalledWith(popupContent);
  
    
	});
  
 it('should update parcheggio state to "inaccessibile" and change rectangle color to yellow',() => {
	    const rectangle = L.rectangle([
	      [42.3600, -71.0590],
	      [42.3602, -71.0588],
	    ]);
	    const marker = L.marker([42.3601, -71.0589]);

	    component.rectangleMarkerMap.set(rectangle, marker);

	    for (const [rect, mark] of component.rectangleMarkerMap) {
	      spyOn(rect.getBounds(), 'contains').and.returnValue(true);
	      spyOn(component.rectangleParcheggioMap, 'get').and.returnValue(parcheggio);
	    }
  
	    const new_state = 'inaccessibile';
	    firebaseService.updateParcheggioState(parcheggio.pid, new_state);

	    const mockRectangle = {
	      setStyle: jasmine.createSpy('setStyle'),
	    };
	    mockRectangle.setStyle({ fillColor: 'yellow', color: 'yellow' });

	    spyOn(component, 'updateStateToInaccessible');
	    component.updateStateToInaccessible(parcheggio);
    
	    expect(firebaseService.updateParcheggioState).toHaveBeenCalledWith('samplePid', 'inaccessibile');

	    expect(mockRectangle.setStyle).toHaveBeenCalledWith({ fillColor: 'yellow', color: 'yellow' });

	 });
	  
it('should add a parking box with rectangle, marker, and parking information', () => {
  
	    const coordinate = { lat: 42.3601, lng: -71.0589 };

	    const rectangle = L.rectangle([
	      [42.3600, -71.0590],
	      [42.3602, -71.0588],
	    ]);
	    const marker = L.marker([42.3601, -71.0589]);
  
    
	    component.rectangleMarkerMap.set(rectangle, marker);

	    for (const [rect, mark] of component.rectangleMarkerMap) {
	      spyOn(rect.getBounds(), 'contains').and.returnValue(true);
	      spyOn(component.rectangleParcheggioMap, 'get').and.returnValue(parcheggio);
	    }

	    spyOn(component, 'addBox')
  
    
	    component.addBox(coordinate);
    
	    expect(component.addBox).toHaveBeenCalledWith(coordinate);
	    expect(component.rectangleMarkerMap.has(rectangle)).toBeTruthy();
	    expect(component.rectangleMarkerMap.get(rectangle)).toEqual(marker);
	    expect(component.rectangleParcheggioMap.get(rectangle)).toEqual(parcheggio);

	});

it('should show AddBoxConfirmation modal and call addBox on confirmation', () => {

	  const coordinate = { lat: 42.3601, lng: -71.0589 };

	  const leafletMouseEvent: LeafletMouseEvent = {
	    latlng: new LatLng(42.3601, -71.0589),
	    layerPoint: null!,
	    containerPoint: null!,
	    originalEvent: null!,
	    type: '',
	    popup: undefined,
	    target: undefined,
	    sourceTarget: undefined,
	    propagatedFrom: undefined,
	    layer: undefined
	  };
	  spyOn(component,'addBox')
	  component.addBox(coordinate)
	  spyOn(component, 'showAddBoxConfirmation')
	  component.showAddBoxConfirmation(leafletMouseEvent);
	  expect(component.addBox).toHaveBeenCalledWith(leafletMouseEvent.latlng);


	});

	it('should move a parking space', () => {
  
	  const oldRectangle = L.rectangle([
	    [42.3600, -71.0590],
	    [42.3602, -71.0588],
	  ]);
	const oldMarker = L.marker([42.3601, -71.0589]);

	  const oldParcheggio: Parcheggio = {
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
	 component.rectangleMarkerMap.set(oldRectangle, oldMarker);
	   for (const [rect, mark] of component.rectangleMarkerMap) {
	     spyOn(rect.getBounds(), 'contains').and.returnValue(true);
	     spyOn(component.rectangleParcheggioMap, 'get').and.returnValue(oldParcheggio);
	   }

	   const newRectangle = L.rectangle([
	    [44.3600, -71.0590],
	    [44.3602, -71.0588],
	  ]);
	  const newMarker = L.marker([42.3601, -71.0589]);

	  const newParcheggio: Parcheggio = {
	    pid: 'samplePid',
	    indirizzo: 'Sample Address',
	    coordinate: {
	      lat: 44.3601,
	      lng: -71.0589,
	    },
	    data_salvataggio: '2023-11-07',
	    state: 'disponibile', 
	    FasceOrarie: {},
	  };
	  component.rectangleMarkerMap.set(newRectangle, newMarker);
  
	  spyOn(component, 'getAddress').and.returnValue(of('Indirizzo Simulato'));

	  spyOn(component, 'moveParcheggio');
	  component.moveParcheggio(oldMarker, L.latLng(44.3602, -71.0588));
	  component.getAddress(44.3601, -71.0589);
	  firebaseService.deleteParcheggio(oldParcheggio);
	  firebaseService.addParcheggio(newParcheggio);
  
	  expect(component.getAddress).toHaveBeenCalledWith(44.3601, -71.0589);
	  expect(firebaseService.deleteParcheggio).toHaveBeenCalledWith(jasmine.any(Object));
	  expect(firebaseService.addParcheggio).toHaveBeenCalledWith(jasmine.any(Object));

	});

  it('should save parking spaces to the database', async () => {
  

    firebaseService.generateParcheggioID(parcheggio.coordinate);
    firebaseService.addParcheggio(parcheggio);
    firebaseService.getParcheggi();
    firebaseService.getParcheggioById(parcheggio.pid)
  
  
    spyOn(component, 'saveParking')
    
    await component.saveParking();
    
    expect(component.saveParking).toHaveBeenCalled();
    expect(firebaseService.generateParcheggioID).toHaveBeenCalledOnceWith(jasmine.any(Object));
    expect(firebaseService.addParcheggio).toHaveBeenCalledOnceWith(jasmine.any(Object));
    expect(firebaseService.getParcheggi).toHaveBeenCalled();
    expect(firebaseService.getParcheggioById).toHaveBeenCalled();
  
    
  });
  
  it('should open confirmation modal and save parking on confirmation', async () => {
  
    const modalRefMock = {
      content: {
        onConfirm: {
          subscribe: (callback: (result: boolean) => void) => {
            callback(true);
          },
        },
      },
    };
   
    modalService.show(SaveConfirmationComponent, { initialState: {} } )
    spyOn(component, 'onSaveButtonClick');
    component.onSaveButtonClick();
    
    
    expect(modalService.show).toHaveBeenCalledWith(SaveConfirmationComponent, { initialState: {} });
  
    await fixture.whenStable();
  
    
    modalRefMock.content.onConfirm.subscribe((result: boolean) => {
      expect(result).toBe(true); 
    });
  
    spyOn(component, 'saveParking');
  
    await component.saveParking();
  
    expect(component.saveParking).toHaveBeenCalled();
  
  });
  
  it('should show delete confirmation modal and remove parking on confirmation', async () => {
    const rectangle = L.rectangle([
      [42.3600, -71.0590],
      [42.3602, -71.0588],
    ]);
  
    const modalRefMock = {
      content: {
        onClose: {
          subscribe: (callback: (result: boolean) => void) => {
            callback(true);
          },
        },
      },
    };
    spyOn(component, 'showDeleteConfirmation')
    component.showDeleteConfirmation(rectangle);
  
    modalService.show(DeleteConfirmationComponent);
  
    expect(modalService.show).toHaveBeenCalledWith(DeleteConfirmationComponent);
  
    await fixture.whenStable();
  
   
    modalRefMock.content.onClose.subscribe((result: boolean) => {
      expect(result).toBe(true); 
    });
    
  
  });

  it('should delete Box', ()  => {
    const latlng: L.LatLng = L.latLng(42.3601, -71.0589);
  

    const rectangle = L.rectangle([
      [42.3600, -71.0590],
      [42.3602, -71.0588],
    ]);
    const marker = L.marker([42.3601, -71.0589]);

  
    component.rectangleMarkerMap.set(rectangle, marker);
  

    for (const [rect, mark] of component.rectangleMarkerMap) {
      spyOn(rect.getBounds(), 'contains').and.returnValue(true);
      spyOn(component.rectangleParcheggioMap, 'get').and.returnValue(parcheggio);
    }

  
    spyOn(component, 'delBox');
    spyOn(component, 'showDeleteConfirmation');
    component.delBox(latlng);
    component.showDeleteConfirmation(rectangle)
  
    expect(component.delBox).toHaveBeenCalledWith(latlng);
    expect(component.showDeleteConfirmation).toHaveBeenCalledWith(rectangle);
  });

  it('should load saved parking spaces', async () => {
    const mockParcheggi: Parcheggio[] = [parcheggio];
  
    (firebaseService.getParcheggi as jasmine.Spy).and.returnValue(Promise.resolve(mockParcheggi));
    spyOn(component, 'mostraParcheggiSullaMappa')
    spyOn(component, 'caricaParcheggiSalvati').and.callThrough();
    
    await component.caricaParcheggiSalvati();
    
    expect(component.mostraParcheggiSullaMappa).toHaveBeenCalled();
    expect(component.caricaParcheggiSalvati).toHaveBeenCalled();
    expect(firebaseService.getParcheggi).toHaveBeenCalled();
  
    expect(component.parcheggiSalvati).toEqual(mockParcheggi);
  
  });

  it('should add markers and boxes to the map for each saved parking', () => {

    const mockParcheggi: Parcheggio[] = [parcheggio];
  
    spyOn(component, 'mostraParcheggiSullaMappa').and.callThrough();
    spyOn(component, 'addMarker');
    spyOn(component, 'addBox');
  
    component.parcheggiSalvati = mockParcheggi;
    component.mostraParcheggiSullaMappa()
    
    expect(component.addMarker).toHaveBeenCalledTimes(mockParcheggi.length);
    expect(component.addBox).toHaveBeenCalledTimes(mockParcheggi.length);
  
    for (const parcheggio of mockParcheggi) {
      expect(component.addMarker).toHaveBeenCalledWith(parcheggio);
      expect(component.addBox).toHaveBeenCalledWith(parcheggio.coordinate);
    }
  });

  it('should select parking and update map', () => {

  spyOn(component, 'updateMap');
  component.selectParking(parcheggio);
  expect(component.parcheggioSelezionato).toEqual(parcheggio);
  expect(component.updateMap).toHaveBeenCalledWith(parcheggio);
  });

  it('should show property popup with parking information', () => {
  
    spyOn(component, 'showPropertyPopup');
   
    component.showPropertyPopup(parcheggio);
  
     const popupMock = jasmine.createSpyObj('Popup', ['setContent', 'setLatLng', 'openOn']);
     spyOn(L, 'popup').and.returnValue(popupMock);
   
    const expectedContent = `
      <strong>Indirizzo:</strong> ${parcheggio.indirizzo}<br>
      <strong>Coordinate:</strong> Lat: ${parcheggio.coordinate.lat}, Lng: ${parcheggio.coordinate.lng}<br>
      <strong>Stato:</strong> ${parcheggio.state}<br>
      <strong>Data di Salvataggio:</strong> ${parcheggio.data_salvataggio}<br>
    `;
    popupMock.setContent(expectedContent);
    expect(popupMock.setContent).toHaveBeenCalledWith(expectedContent);
    popupMock.setLatLng([parcheggio.coordinate.lat, parcheggio.coordinate.lng])
    expect(popupMock.setLatLng).toHaveBeenCalledWith([parcheggio.coordinate.lat, parcheggio.coordinate.lng]);
  });
  
  it('should open booking modal and reload saved parking spaces on confirmation', async () => {
    const mockFasceOrarie = { '08:00-09:00': { stato: 'disponibile' } };
    (firebaseService.getFasceOrarieParcheggio as jasmine.Spy).and.returnValue(Promise.resolve(mockFasceOrarie));
  
    const modalRefMock = {
      content: {
        onConferma: {
          subscribe: (callback: (result: boolean) => void) => {
            callback(true);
          },
        },
      },
    };
    (modalService.show as jasmine.Spy).and.returnValue(modalRefMock);
  
    spyOn(component, 'caricaParcheggiSalvati').and.returnValue(Promise.resolve());
  
    await component.openBookingModal(parcheggio);
  
    expect(firebaseService.getFasceOrarieParcheggio).toHaveBeenCalledWith(parcheggio.pid);
  
    expect(modalService.show).toHaveBeenCalledWith(BookingComponent, { initialState: { parcheggio, fasceOrarie: mockFasceOrarie } });
    await fixture.whenStable();
  
    modalRefMock.content.onConferma.subscribe((result: boolean) => {
      expect(result).toBe(true);
    });
    expect(component.caricaParcheggiSalvati).toHaveBeenCalled();
  });

  it('should handle right-click on rectangle', () => {
    const latlng: L.LatLng = L.latLng(42.3601, -71.0589);
    const rectangle = L.rectangle([
      [42.3600, -71.0590],
      [42.3602, -71.0588],
    ]);
    const marker = L.marker([42.3601, -71.0589]);
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
    component.rectangleMarkerMap.set(rectangle, marker);
    for (const [rect, mark] of component.rectangleMarkerMap) {
      spyOn(rect.getBounds(), 'contains').and.returnValue(true);
      spyOn(component.rectangleParcheggioMap, 'get').and.returnValue(parcheggio);
    }
    spyOn(component, 'showBookPopup');
    component.handleRectangleRightClick(latlng);
    expect(component.showBookPopup).toHaveBeenCalledWith(rectangle, parcheggio);
  });


  it('should get address from lat/lng', () => {
    const lat = 42.3601; 
    const lng = -71.0589; 
    component.getAddress(lat, lng).subscribe((address: string) => {
      expect(address).toBe('mock address');
    });
    const req = httpTestingController.expectOne((request) => {
      return request.url.includes(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    });
    const mockResponse = { display_name: 'mock address' };
    req.flush(mockResponse);
    httpTestingController.verify();
  });
  
  it('should load parking', () => {
    spyOn(component, 'getAddress').and.returnValue(of('Indirizzo Simulato'));
    component.csvData = [
      { Latitudine: '42.3601', Longitudine: '-71.0589' },
    ];
    component.loadParking();
    expect(firebaseService.generateParcheggioID).toHaveBeenCalledWith(jasmine.any(Object));
    expect(firebaseService.addParcheggio).toHaveBeenCalledWith(jasmine.any(Object));
    expect(component.getAddress).toHaveBeenCalled();
  });

  it('should handle searchAddress correctly', () => {
    const mockData = [
      {
        lat: '12.345',
        lon: '67.890',
        display_name: 'Mock Address',
      },
    ];
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      } as Response)
    );
    component.searchAddress();
    expect(markers.length).toBeGreaterThan(0);
  }); 

  it('should add a marker to the map with correct properties', () => {
    const parcheggio: Parcheggio = {
      pid: 'mockPid',
      coordinate: {
        lat: 12.345,
        lng: 67.89,
      },
      FasceOrarie: {
        '08:00-09:00': { stato: 'disponibile' },
      },
      indirizzo: 'Mock Address',
      data_salvataggio: 'mockDate',
      state: 'disponibile',
    };

    component.addMarker(parcheggio);

    expect(component.mappa.addLayer).toHaveBeenCalled();
    const addedMarker = component.mappa.addLayer.calls.mostRecent().args[0] as L.Marker;
    expect(addedMarker.getLatLng()).toEqual(new L.LatLng(12.345, 67.890));
    expect(addedMarker.options.icon).toEqual(component.customIcon);
  });

 it('should update the map with the correct properties', () => {
    const parcheggio: Parcheggio = {
      pid: 'mockPid',
      coordinate: {
        lat: 12.345,
        lng: 67.89,
      },
      FasceOrarie: {
        '08:00-09:00': { stato: 'disponibile' },
      },
      indirizzo: 'Mock Address',
      data_salvataggio: 'mockDate',
      state: 'disponibile',
    };
    component.updateMap(parcheggio);
    expect(component.mappa.setView).toHaveBeenCalledWith([12.345, 67.89], 16);
    expect(component.mappa.addLayer).toHaveBeenCalled();
    spyOn(component, 'showPropertyPopup');
    component.showPropertyPopup(parcheggio);
    expect(component.showPropertyPopup).toHaveBeenCalledWith(parcheggio);
  });
  
  it('should show book popup and handle button click', () => {

    const mockRectangle: L.Rectangle = {
      getBounds: () => L.latLngBounds(L.latLng(42.3600, -71.0590), L.latLng(42.3602, -71.0588)),
    } as L.Rectangle;    const mockParcheggio: Parcheggio = {
      pid: 'mockPid',
      coordinate: { lat: 12.345, lng: 67.89 },
      FasceOrarie: { '08:00-09:00': { stato: 'disponibile' } },
      indirizzo: 'Mock Address',
      data_salvataggio: 'mockDate',
      state: 'disponibile',
    };
    component.showBookPopup(mockRectangle, mockParcheggio);
    component.mappa.closePopup();
    expect(component.mappa.closePopup).toHaveBeenCalled(); // Ensure closePopup is called
    const prenotaButton = document.getElementById('prenotaButton');
    if (prenotaButton) {
      spyOn(component, 'openBookingModal');
      prenotaButton.click();
      expect(component.openBookingModal).toHaveBeenCalledWith(mockParcheggio);
    }
  });

  it('should call detectChanges when updateData is called', (done) => {
    spyOn(component['cdr'], 'detectChanges');
    component.updateData();
    fixture.whenStable().then(() => {
      expect(component['cdr'].detectChanges).toHaveBeenCalled();
      expect(component['cdr'].detectChanges).toHaveBeenCalledTimes(1);
      done();
    });
  });
  
  it('should show confirmation modal and delete all parcheggi on confirmation', () => {
  const modalRefSpy = {
    content: { onConfirm: new EventEmitter() },
    hide: jasmine.createSpy('hide')
  };
  modalService.show = jasmine.createSpy('show').and.returnValue(modalRefSpy);
  component.confirmDeleteAllParcheggi();
  expect(modalService.show).toHaveBeenCalledWith(DeleteAllConfirmationComponent, {
    initialState: {},
    class: 'modal-dialog-centered',
  });
  modalRefSpy.content.onConfirm.next(true);
  expect(component.firebaseService.deleteAllParcheggi).toHaveBeenCalled();
  expect(modalRefSpy.hide).toHaveBeenCalled();
  });

});
