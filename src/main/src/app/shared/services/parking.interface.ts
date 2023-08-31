export interface Parcheggio {
    uid: string;
    indirizzo: string;
    coordinate: {
      lat: number;
      lng: number;
    };
    data_salvataggio: string;
  }