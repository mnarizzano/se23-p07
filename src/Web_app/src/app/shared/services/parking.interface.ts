export interface Parcheggio {
    pid: string,
    indirizzo: string;
    coordinate: {
      lat: number;
      lng: number;
    };
    data_salvataggio: string;
    state: 'disponibile' | 'occupato' | 'inaccessibile';    
    FasceOrarie: { [key: string]: { stato: string}
   };
  }