import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class OnlineStateService {

  private isOnline$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(navigator.onLine)

  constructor(private snackBar: MatSnackBar) {
    window.addEventListener('offline', (e) => {
      this.isOnline$.next(false)
      this.snackBar.open(`Offline`, undefined, {duration: 3000});
    });

    window.addEventListener('online', (e) => {
      this.isOnline$.next(true)
      this.snackBar.open(`Online`, undefined, {duration: 3000});
    });
  }

  isOnline(): Observable<boolean> {
    return this.isOnline$;
  }
}
