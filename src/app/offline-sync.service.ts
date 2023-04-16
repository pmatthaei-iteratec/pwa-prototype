import {Injectable} from '@angular/core';
import {OnlineStateService} from "./online-state.service";
import {
  BehaviorSubject,
  catchError,
  filter,
  forkJoin,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  Subscription,
  takeWhile
} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {

  private unsycnedDatasets: BehaviorSubject<(Observable<any[]>)[]> = new BehaviorSubject<(Observable<any[]>)[]>([])
  private updateQuota$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  private readonly quota$: Observable<string>
  private readonly totalUnsyncedData$: Observable<number>;

  constructor(private onlineStateService: OnlineStateService, private snackBar: MatSnackBar, private http: HttpClient) {

    this.quota$ = this.updateQuota$.pipe(
      filter(update => update),
      mergeMap(_ => from(this.estimateQuota()))
    )

    this.totalUnsyncedData$ = this.unsycnedDatasets.pipe(mergeMap(v => merge(...v)), map(v => v.length))

  }

  register<T>(input: { unsyncedData$: Observable<T[]>, syncEndpoint: string, onUpdate: (entity: T) => Observable<number>, onRead: (key: number) => Observable<T> }): Subscription {
    const unsycned$ = this.onlineStateService.isOnline().pipe(
      takeWhile(isOnline => isOnline),
      mergeMap((_) => input.unsyncedData$),
    )

    this.unsycnedDatasets.next([...this.unsycnedDatasets.value, input.unsyncedData$])
    return unsycned$.pipe(filter(schaeden => schaeden.length > 0)).subscribe({
      next: value => {
        const ref$ = this.snackBar.open(`${value.length} unsychronisierte Schäden gefunden.`, 'Sync')
        const sub = ref$.onAction().pipe(
          mergeMap(() => input.unsyncedData$),
          mergeMap((entities: T[]) => forkJoin(entities.map(entity => this.sync(entity, input.syncEndpoint, input.onUpdate, input.onRead))))
        ).subscribe({
          next: (value) => {
            this.snackBar.open(`${value.filter(item => item !== null)} Schäden synchronisiert.`)
            sub.unsubscribe()
          },
          error: err => this.snackBar.open(err)
        });
      }
    })
  }

  sync<T>(entity: T, syncEndpoint: string, onUpdate: (entity: T) => Observable<number>, onRead: (key: number) => Observable<T>): Observable<T | null> {
    return this.http.post(syncEndpoint, entity).pipe(
      map(res => ({...entity, synced: 1})),
      mergeMap((schaden) => onUpdate(schaden)),
      mergeMap((key) => onRead(key)),
      catchError(() => of(null))
    );
  }

  updateQuota(): void {
    this.updateQuota$.next(true)
  }

  private async estimateQuota(): Promise<string> {
    if (navigator.storage && navigator.storage.estimate) {
      const {usage, quota} = await navigator.storage.estimate();
      if (quota && usage) {
        const availableSpaceInBytes = quota - usage;
        const availableSpaceInMB = availableSpaceInBytes / (1024 * 1024);
        return `${availableSpaceInMB.toFixed(0)} MB available.`
      } else {
        return `- MB available.`
      }
    } else {
      return "StorageManager not found"
    }
  }

  getQuota(): Observable<string> {
    return this.quota$
  }

  getTotalUnsyncedData(): Observable<number> {
    return this.totalUnsyncedData$
  }
}
