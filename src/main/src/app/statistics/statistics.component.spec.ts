
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StatisticsComponent } from './statistics.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Chart } from 'chart.js';
import { AppModule } from '../app.module';
import { CategoryScale, BarController, LinearScale, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, BarController, LinearScale, Title, Tooltip, Legend);
import { of } from 'rxjs';
import { firebaseConfig } from '../../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';




describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let angularFirestoreMock: jasmine.SpyObj<AngularFirestore>;

  beforeEach(() => {
    // Crea un mock per AngularFirestore
    angularFirestoreMock = jasmine.createSpyObj('AngularFirestore', ['collection', 'doc']);

    TestBed.configureTestingModule({
      declarations: [StatisticsComponent],
      providers: [
        { provide: AngularFirestore, useValue: angularFirestoreMock },
      ],
      imports: [
        AppModule, 
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule,],
    }).compileComponents();

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


/*
  it('should calculate most used parking lots', (done) => {
    component.calculateMostUsedParkingLots(() => {
      // Assicurati che la proprietà mostUsedParkingLotsSorted sia definita
      expect(component.mostUsedParkingLotsSorted).toBeDefined();
      
      // Assicurati che la proprietà mostUsedParkingLots sia definita
      expect(component.mostUsedParkingLots).toBeDefined();

      // Esegui qui altre asserzioni se necessario, ad esempio:
      // Verifica che mostUsedParkingLotsSorted sia un array
      expect(Array.isArray(component.mostUsedParkingLotsSorted)).toBe(true);

      // Verifica che mostUsedParkingLots sia un oggetto
      expect(typeof component.mostUsedParkingLots).toBe('object');

      done(); // Chiamata per segnalare la fine del test asincrono
    });
  });
*/




});





