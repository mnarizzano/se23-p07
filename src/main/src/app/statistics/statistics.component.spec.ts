import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { firebaseConfig } from '../../environments/environment';
import { of } from 'rxjs';
import { AppModule } from '../app.module';
import { StatisticsComponent } from './statistics.component';
import { Chart, CategoryScale, BarController, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/compat/database';



describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let firestoreMock: any;

  const mockData = [
    {
      data: () => ({
        data_entrata: {
          toDate: () => new Date("2023-09-16T14:00:00+02:00"),
        },
        data_uscita: {
          toDate: () => new Date("2023-09-16T16:00:00+02:00"),
        },
        id_parcheggio: "parcheggio_2a09e3ded9d46d90598f3ed1e4210d4a9519c6d6068ef7d7badacfdebd5b3338",
        id_utente: "yI4IQ2E7MwYAaN7uGDepMA54sX93",
      }),
    },
  ];

  beforeEach(() => {
    firestoreMock = {
      collection: (collectionName: string) => {
        if (collectionName === 'transazioni') {
          return {
            get: jasmine.createSpy().and.returnValue(of({
              forEach: (callback: (value: any, index: number, array: any[]) => void) =>
                mockData.forEach((value, index, array) => callback(value, index, array)),
            })),
          };
        } 
  
        return null;
      },
    };

    TestBed.configureTestingModule({
      declarations: [StatisticsComponent],
      imports: [
        AppModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule,
        AngularFireDatabaseModule,
      ],

      providers: [
        { provide: AngularFirestore, useValue: firestoreMock },
      ],
      
    });

    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
  });


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize component properties', () => {
    expect(component.averageDuration).toBe(0);
    expect(component.mostUsedDays).toEqual({});
    expect(component.mostUsedParkingLots).toEqual({});
    expect(component.parkingLotAddresses).toEqual({});
    expect(component.daysOfWeek).toEqual(['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']);
    expect(component.mostUsedDay).toEqual([]);
    expect(component.mostUsedParkingLotsSorted).toEqual([]);
  });

  it('should call Chart.register, getParkingLotAddresses, and calculateStatistics on ngOnInit',  () => {
    
    const chartRegisterSpy = spyOn(Chart, 'register');

    
    const getParkingLotAddressesSpy = spyOn(component, 'getParkingLotAddresses');

    
    const calculateStatisticsSpy = spyOn(component, 'calculateStatistics');

    
    component.ngOnInit();

   
    expect(chartRegisterSpy).toHaveBeenCalledWith(CategoryScale, BarController, LinearScale, Title, Tooltip, Legend);
    expect(getParkingLotAddressesSpy).toHaveBeenCalled();
    expect(calculateStatisticsSpy).toHaveBeenCalled();
  });

  it('should return parking lot address if available', () => {
   
    const parkingLotId = 'exampleParkingLot';
    const expectedAddress = '123 Main St';
    component.parkingLotAddresses[parkingLotId] = expectedAddress;

   
    const result = component.getParkingLotAddress(parkingLotId);

    
    expect(result).toBe(expectedAddress);
  });

  it('should return default message if parking lot address is not available', () => {
    const parkingLotId = 'nonExistentParkingLot';
    const result = component.getParkingLotAddress(parkingLotId);
    expect(result).toBe('Indirizzo non disponibile');
  });

  it('should calculate average parking duration', fakeAsync(() => {
    firestoreMock.collection('transazioni').get.and.returnValue(of({
      forEach: (callback: (value: any, index: number, array: any[]) => void) => mockData.forEach(callback),
    }));
    component.calculateAverageParkingDuration();
    tick();
    expect(component.averageDuration).toBe(2);
  }));

  it('should calculate most used days', fakeAsync(() => {
    // Set up the Firestore mock data
    const firestoreData = [
      {
        data: () => ({
          data_entrata: {
            toDate: () => new Date("2023-09-17T14:00:00+02:00"), // Domenica
          },
        
        }),
      },
    ];
    
  
    firestoreMock.collection('transazioni').get.and.returnValue(of({
      forEach: (callback: (value: any, index: number, array: any[]) => void) => firestoreData.forEach(callback),
    }));
  
    
    const callbackSpy = jasmine.createSpy('callback');
  
    // Call the method that triggers the Firestore query
    component.calculateMostUsedDays(callbackSpy);
  
    // Simulate the passage of time until all asynchronous operations are complete
    tick();
  
    // Assert that mostUsedDays and mostUsedDay are calculated correctly
    expect(component.mostUsedDays).toEqual({
      'Lunedì': 0, 
      'Martedì': 0,
      'Mercoledì': 0,
      'Giovedì': 0,
      'Venerdì': 0,
      'Sabato': 0,
      'Domenica': 1,

    });
    expect(component.mostUsedDay).toEqual(['Domenica']); // Adjust based on your data
  
    // Assert that the callback function is called
    expect(callbackSpy).toHaveBeenCalled();
  }));
});





