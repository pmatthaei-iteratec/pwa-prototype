import {Injectable} from '@angular/core';
import {OnlineStateService} from "./online-state.service";
import {SchadenService} from "./schaden.service";
import {
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  ObservedValueOf,
  of,
  OperatorFunction,
  takeWhile, tap
} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Schaden} from "./db";

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {

  constructor(private onlineStateService: OnlineStateService, private schadenService: SchadenService, private http: HttpClient) {
    const test = this.onlineStateService.isOnline().pipe(
      takeWhile(isOnline => isOnline),
      mergeMap((_) => this.schadenService.getAll()),
      mergeMap(schaeden => forkJoin(schaeden.map(schaden => this.sync(schaden)))
      )
    )

  }

  sync(schaden: Schaden): Observable<Schaden> {
    return this.http.post("http://localhost:8081/api/schaden", schaden).pipe(
      map(res => ({...schaden, synced: 1} as Schaden)),
      mergeMap((schaden)=> this.schadenService.update(schaden)),
      mergeMap((key)=> this.schadenService.get(key)),
    );
  }

}
