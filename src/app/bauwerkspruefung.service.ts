import {Injectable} from '@angular/core';
import {from, Observable} from "rxjs";
import {Bauwerkspruefung, db} from "./db";
import {liveQuery} from "dexie";

@Injectable({
  providedIn: 'root'
})
export class BauwerkspruefungService {

  constructor() {
  }

  getAll(): Observable<Bauwerkspruefung[]> {
    return from(liveQuery(async () => await db.bauwerkspruefungen.toArray()));
  }
}
