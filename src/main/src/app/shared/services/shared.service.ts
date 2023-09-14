import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Parcheggio } from './parking.interface';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private parcheggioSubject: BehaviorSubject<Parcheggio | null> = new BehaviorSubject<Parcheggio | null>(null);

  // Metodo per ottenere un observable per le modifiche dello stato del parcheggio
  getUpdateStateObservable(): Observable<Parcheggio | null> {
    return this.parcheggioSubject.asObservable();
  }

  // Metodo per aggiornare lo stato del parcheggio
  updateState(parcheggio: Parcheggio): void {
    this.parcheggioSubject.next(parcheggio);
  }
}




