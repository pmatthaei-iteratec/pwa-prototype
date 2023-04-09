import { Injectable } from '@angular/core';
import {db, Schaden} from "./db";
import {FormGroup} from "@angular/forms";
import {from, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SchadenService {

  constructor() { }

  async save(form: FormGroup) {
    const count = form.value.count.value ?? 1
    const bild = form.value.bild as File;
    const schaeden: Schaden[] = [...Array(count).keys()].map((id: number) => ({
      title: `${form.value.title} ${id}`,
      bild: form.value.bild,
      path: `${bild.name} ${bild.webkitRelativePath}`
    }))
    await db.schaeden.bulkAdd([...schaeden]);
  }

  getAll(): Observable<Schaden[]> {
    return from(db.schaeden.toArray());
  }

  get(id: number): Observable<Schaden | undefined> {
    return from(db.schaeden.get(id));
  }

  delete(id: number): Observable<void> {
    return from(db.schaeden.delete(id));
  }
}
