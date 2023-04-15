import {Injectable} from '@angular/core';
import {OnlineStateService} from "./online-state.service";
import {SchadenService} from "./schaden.service";
import {catchError, filter, forkJoin, map, mergeMap, Observable, of, takeWhile} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Schaden} from "./db";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {

  constructor(private onlineStateService: OnlineStateService, private schadenService: SchadenService, private snackBar: MatSnackBar, private http: HttpClient) {
    const unsycned$ = this.onlineStateService.isOnline().pipe(
      takeWhile(isOnline => isOnline),
      mergeMap((_) => this.schadenService.getAllUnsynced()),
    )

    unsycned$.pipe(filter(schaeden => schaeden.length > 0)).subscribe({
      next: value => {
        const ref$ = this.snackBar.open(`${value.length} unsychronisierte Schäden gefunden.`, 'Sync')
        const sub = ref$.onAction().pipe(
          mergeMap(() => this.schadenService.getAllUnsynced()),
          mergeMap((schaeden: Schaden[]) => forkJoin(schaeden.map(schaden => this.sync(schaden))))
        ).subscribe({
          next: (value) => {
            this.snackBar.open(`${value.filter(item => item !== null)} Schäden synchronisiert.`)
            sub.unsubscribe()
          },
          error: err => this.snackBar.open(err)
        });
      }
    })

    const test = this.onlineStateService.isOnline().pipe(
      takeWhile(isOnline => isOnline),
      mergeMap((_) => this.schadenService.getAllUnsynced()),
      mergeMap(schaeden => forkJoin(schaeden.map(schaden => this.sync(schaden)))
      )
    )

  }

  sync(schaden: Schaden): Observable<Schaden | null> {
    return this.http.post("http://localhost:8081/api/schaden", schaden).pipe(
      map(res => ({...schaden, synced: 1} as Schaden)),
      mergeMap((schaden) => this.schadenService.update(schaden)),
      mergeMap((key) => this.schadenService.get(key)),
      catchError(() => of(null))
    );
  }

}
