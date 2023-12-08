import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingComponent } from './booking.component';
import { FirebaseService } from '../shared/services/firebase.service';
import { FasceOrarieService } from '../fasce-orarie.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

describe('BookingComponent', () => {
  
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;
  let bsModalRef: BsModalRef;
  let firebaseService: FirebaseService;
  let fasceOrarieService: FasceOrarieService;

  beforeEach(() => {

    const firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', [
      'getFasceOrarieParcheggio',
      'updateFasciaOraria',
      'updateParcheggioState',
      'getParcheggioById',
    ]);

    const fasceOrarieServiceSpy = jasmine.createSpyObj('FasceOrarieService', [
      'getFasceOrarie',
      'getStatoFasciaOraria',
      'setStatoFasciaOraria',
      'updateStatoParcheggio',
      'getStatoParcheggio',
      'areAllFasceOccupate',
    ]);

    TestBed.configureTestingModule({
      declarations: [BookingComponent],
      providers: [
        { provide: FirebaseService, useValue: firebaseServiceSpy },
        { provide: FasceOrarieService, useValue: fasceOrarieServiceSpy },
        BsModalRef,
      ],
    });
    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    bsModalRef = TestBed.inject(BsModalRef);
    firebaseService = TestBed.inject(FirebaseService);
    fasceOrarieService = TestBed.inject(FasceOrarieService);
    // fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call onConfermaClick and hide modal', () => {
    spyOn(component, 'onConfermaClick').and.callThrough(); 
    spyOn(bsModalRef, 'hide');  
    component.onConfermaClick(true);
    expect(component.onConfermaClick).toHaveBeenCalledWith(true);
    expect(bsModalRef.hide).toHaveBeenCalled();
  });

  it('should updateSelectedFasce correctly', () => {
    component.selectedFasce = ['fascia1', 'fascia2'];
    component.updateSelectedFasce('fascia3');
    expect(component.selectedFasce).toEqual(['fascia1', 'fascia2', 'fascia3']);
    component.updateSelectedFasce('fascia1');
    expect(component.selectedFasce).toEqual(['fascia2', 'fascia3']);
  });

});


