import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OnlineStateService {

  private isOnline$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(navigator.onLine)

  constructor() {
    window.addEventListener('offline', (e) => {
      this.isOnline$.next(false)
    });

    window.addEventListener('online', (e) => {
      this.isOnline$.next(true)
    });
  }

  isOnline(): Observable<boolean> {
    return this.isOnline$;
  }
}
