import {Injectable} from '@angular/core';
import {OnlineStateService} from "./online-state.service";
import {SchadenService} from "./schaden.service";
import {forkJoin, from, mergeMap, takeWhile} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {

  constructor(private onlineStateService: OnlineStateService, private schadenService: SchadenService, private http: HttpClient) {
    const test = this.onlineStateService.isOnline().pipe(
      takeWhile(isOnline => isOnline),
      mergeMap((_) => from(this.schadenService.getAll())),
      mergeMap(schaeden => forkJoin(schaeden.map(schaden => this.http.post("", schaden))))
    )
  }
}
