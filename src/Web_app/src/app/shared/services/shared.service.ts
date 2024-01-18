import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Parcheggio } from './parking.interface';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private parcheggioSubject: BehaviorSubject<Parcheggio | null> = new BehaviorSubject<Parcheggio | null>(null);

  // Get an observable for changes in the state
  getUpdateStateObservable(): Observable<Parcheggio | null> {
    return this.parcheggioSubject.asObservable();
  }

  updateState(parcheggio: Parcheggio): void {
    this.parcheggioSubject.next(parcheggio);
  }
  
}




