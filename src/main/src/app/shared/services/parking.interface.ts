export interface Parcheggio {
    pid: string,
    indirizzo: string;
    coordinate: {
      lat: number;
      lng: number;
    };
    data_salvataggio: string;
    state: 'disponibile' | 'occupato' | 'inaccessibile';
    /*statiFasceOrarie: {
      '1': 'disponibile',
      '2': 'disponibile',
      '3': 'disponibile',
      '4': 'disponibile',
      '5': 'disponibile',
      '6': 'disponibile',
      '7': 'disponibile',
      '8': 'disponibile',
      '9': 'disponibile',
      '10': 'disponibile',
    }, */
  }