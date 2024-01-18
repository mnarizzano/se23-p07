import { TestBed } from '@angular/core/testing';
import { SharedService } from './shared.service';
import { Parcheggio } from './parking.interface';

describe('SharedService', () => {
  let service: SharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedService],
    });
    service = TestBed.inject(SharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update and get the parking state', () => {
    const parcheggio: Parcheggio = {
      pid: '1',
      indirizzo: 'Via Test',
      coordinate: { lat: 0, lng: 0 },
      data_salvataggio: '2023-10-20',
      state: 'disponibile',
      FasceOrarie: {},
    };

    service.updateState(parcheggio);

    // Get the updated parking state
    service.getUpdateStateObservable().subscribe((updatedParcheggio) => {
      expect(updatedParcheggio).toEqual(parcheggio);
    });
  });
  
});
