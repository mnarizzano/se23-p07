import { FirebaseService } from './firebase.service';
import { SHA256 } from 'crypto-js'; // Assicurati che questa sia la giusta importazione
import { Parcheggio } from './parking.interface';


describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    service = new FirebaseService(); // Inizializza il tuo servizio Firebase
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a valid parcheggio ID', () => {
    const coordinates = { lat: 12.34, lng: 56.78 };
    const generatedId = service.generateParcheggioID(coordinates);

    // Verifica che l'ID generato abbia il formato corretto
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

    // Aggiungi il parcheggio
    await service.addParcheggio(parcheggio);

    // Recupera tutti i parcheggi
    const parcheggi = await service.getParcheggi();

    // Verifica che il parcheggio aggiunto sia presente nell'elenco dei parcheggi
    const parcheggioAggiunto = parcheggi.find(p => p.pid === parcheggio.pid);
    expect(parcheggioAggiunto).toBeTruthy();

    // Verifica altre aspetti del parcheggio, se necessario
    // expect(parcheggioAggiunto.proprietà).toEqual(valore_atteso);
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

    // Aggiungi il parcheggio
    await service.addParcheggio(parcheggio);

    // Aggiorna lo stato del parcheggio
    await service.updateParcheggioState(parcheggio.pid, newState);

    // Recupera il parcheggio aggiornato
    const updatedParcheggio = await service.getParcheggioById(parcheggio.pid);

    // Verifica che lo stato sia stato aggiornato correttamente
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

    // Aggiungi il parcheggio
    await service.addParcheggio(parcheggio);

    // Elimina il parcheggio
    await service.deleteParcheggio(parcheggio);

    // Verifica che il parcheggio sia stato eliminato recuperandolo per ID
    const deletedParcheggio = await service.getParcheggioById(parcheggio.pid);
    expect(deletedParcheggio).toBeNull();
  });

  it('should delete all parcheggi', async () => {
    // Elimina tutti i parcheggi
    await service.deleteAllParcheggi();

    // Verifica che non ci siano più parcheggi
    const parcheggi = await service.getParcheggi();
    expect(parcheggi.length).toBe(0);
  });
});
