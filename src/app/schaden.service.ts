import {Injectable} from '@angular/core';
import {db, Schaden} from "./db";
import {FormGroup} from "@angular/forms";
import {forkJoin, from, map, mergeMap, Observable} from "rxjs";
import {liveQuery} from "dexie";
import {OfflineSyncService} from "./offline-sync.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class SchadenService {

  private syncEndpoint = "http://localhost:8081/api/schaden";

  constructor(private syncService: OfflineSyncService, private snackBar: MatSnackBar) {
    db.schaeden.hook.creating.subscribe(() => {
      syncService.updateQuota()
    })
    db.schaeden.hook.updating.subscribe(() => {
      syncService.updateQuota()
    })
    db.schaeden.hook.deleting.subscribe(() => {
      syncService.updateQuota()
    })

    this.syncService.register<Schaden>(
      this.getAllUnsynced(),
      this.syncEndpoint,
      this.update,
      this.get
    )

  }

  save(form: FormGroup): void {
    const count = form.value?.count?.value ?? 1
    const bild = form.value.bild as File;
    const schaeden: Schaden[] = [...Array(count).keys()].map((id: number) => ({
      title: `${form.value.title} ${id}`,
      bild: form.value.bild,
      path: bild ? `${bild.name} ${bild.webkitRelativePath}` : undefined,
      synced: 0
    }))
    liveQuery(async () => await db.schaeden.bulkAdd([...schaeden])).subscribe() // TODO Better solution
  }

  update(schaden: Schaden): Observable<number> {
    return from(liveQuery(async () => await db.schaeden.update(schaden.id!!, schaden)))
  }

  getAll(): Observable<Schaden[]> {
    return from(liveQuery(async () => await db.schaeden.toArray()));
  }

  getAllUnsynced(): Observable<Schaden[]> {
    return from(liveQuery(async () => await db.schaeden.where({synced: 0}).toArray()))
  }

  async countAllUnsynced(): Promise<number> {
    return db.schaeden.where({synced: 0}).count();
  }

  get(id: number): Observable<Schaden> { // TODO: Correct null handling
    return from(liveQuery(async () => await db.schaeden.get(id))).pipe(map(value => value!!))
  }

  delete(id: number): void {
    from(liveQuery(async () => await db.schaeden.delete(id))).subscribe({
      next: _ => console.log(`Schaden with id ${id} successfully deleted.`),
      error: err => console.log(`Deletion of Schaden with id ${id} failed: ${err}.`)
    })
  }

  syncAllSchaeden(): void {
    const sub = this.getAllUnsynced().pipe(
      mergeMap((schaeden: Schaden[]) =>
        forkJoin(schaeden.map(
            schaden => this.syncService.sync(
              schaden,
              this.syncEndpoint,
              this.update,
              this.get
            )
          )
        )
      )
    ).subscribe({
      next: value => {
        this.snackBar.open(`${value.filter(item => item !== null)} Schäden synchronisiert.`)
        sub.unsubscribe()
      }
    })
  }

  syncSchaden(schaden: Schaden): void {
    this.syncService.sync(schaden,
      this.syncEndpoint,
      this.update,
      this.get
    ).subscribe({
        next: value => this.snackBar.open(`Successfully synced ${schaden.title}`, undefined, {duration: 1500}),
        error: err => this.snackBar.open(`Sync aborted for ${schaden.title}: ${err}`, undefined, {duration: 1500}),
      }
    )
  }
}
