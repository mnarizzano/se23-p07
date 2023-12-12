import { FirebaseService } from './firebase.service';
import { SHA256 } from 'crypto-js'; 
import { Parcheggio } from './parking.interface';

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    service = new FirebaseService(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a valid parcheggio ID', () => {
    const coordinates = { lat: 12.34, lng: 56.78 };
    const generatedId = service.generateParcheggioID(coordinates);

    // Check the format of ID 
    expect(generatedId).toEqual(`parcheggio_${SHA256(coordinates.lat.toString() + coordinates.lng.toString())}`);
  });

  it('should add and retrieve parcheggio', async () => {
    const parcheggio: Parcheggio = {
      pid: '1',
      indirizzo: 'Via Test',
      coordinate: { lat: 0, lng: 0 },
      data_salvataggio: '2023-10-20',
      state: 'disponibile',
      FasceOrarie: {},
    };

    await service.addParcheggio(parcheggio);

    const parcheggi = await service.getParcheggi();

    const parcheggioAggiunto = parcheggi.find(p => p.pid === parcheggio.pid);
    expect(parcheggioAggiunto).toBeTruthy();
  });

  it('should update parcheggio state', async () => {
    const parcheggio: Parcheggio = {
      pid: '1',
      indirizzo: 'Via Test',
      coordinate: { lat: 0, lng: 0 },
      data_salvataggio: '2023-10-20',
      state: 'disponibile',
      FasceOrarie: {},
    };
    const newState = 'occupato';
    await service.addParcheggio(parcheggio);
    await service.updateParcheggioState(parcheggio.pid, newState);
    const updatedParcheggio = await service.getParcheggioById(parcheggio.pid);
    expect(updatedParcheggio?.state).toBe(newState);
  });

  it('should delete parcheggio', async () => {
    const parcheggio: Parcheggio = {
      pid: '1',
      indirizzo: 'Via Test',
      coordinate: { lat: 0, lng: 0 },
      data_salvataggio: '2023-10-20',
      state: 'disponibile',
      FasceOrarie: {},
    };
    await service.addParcheggio(parcheggio);
    await service.deleteParcheggio(parcheggio);
    const deletedParcheggio = await service.getParcheggioById(parcheggio.pid);
    expect(deletedParcheggio).toBeNull();
  });

  it('should delete all parcheggi', async () => {
    await service.deleteAllParcheggi();
    const parcheggi = await service.getParcheggi();
    expect(parcheggi.length).toBe(0);
  });
});
