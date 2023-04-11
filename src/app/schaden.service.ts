import {Injectable} from '@angular/core';
import {db, Schaden} from "./db";
import {FormGroup} from "@angular/forms";
import {from, map, Observable, of} from "rxjs";
import {liveQuery, PromiseExtended} from "dexie";

@Injectable({
  providedIn: 'root'
})
export class SchadenService {

  constructor() {
  }

  save(form: FormGroup) : void {
    const count = form.value.count.value ?? 1
    const bild = form.value.bild as File;
    const schaeden: Schaden[] = [...Array(count).keys()].map((id: number) => ({
      title: `${form.value.title} ${id}`,
      bild: form.value.bild,
      path: `${bild.name} ${bild.webkitRelativePath}`,
      synced: 0
    }))
    liveQuery(async ()=>await db.schaeden.bulkAdd([...schaeden])).subscribe() // TODO Better solution
  }

  update(schaden: Schaden): Observable<number> {
    console.log("Update: ", schaden)
    return from(liveQuery(async ()=>await db.schaeden.update(schaden.id!!, schaden)))
  }

  getAll(): Observable<Schaden[]> {
    return from(liveQuery(async () => await db.schaeden.toArray()));
  }

  getAllUnsynced(): Observable<Schaden[]> {
    return from(liveQuery(async() => await db.schaeden.where({synced: 0}).toArray()))
  }

  async countAllUnsynced(): Promise<number> {
    return db.schaeden.where({synced: 0}).count();
  }

  get(id: number): Observable<Schaden> { // TODO: Correct null handling
    return from(liveQuery(async()=> await db.schaeden.get(id))).pipe(map( value => value!!))
  }

  delete(id: number): void {
    from(liveQuery(async ()=> await db.schaeden.delete(id))).subscribe({
      next: _ => console.log(`Schaden with id ${id} successfully deleted.`),
      error: err => console.log(`Deletion of Schaden with id ${id} failed: ${err}.`)
    })
  }
}
