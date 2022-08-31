import {Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {SwUpdate} from "@angular/service-worker";
import {BehaviorSubject, filter} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UpdateNotificationService {
  private updateQueue: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null)

  constructor(private updates: SwUpdate, private snackBar: MatSnackBar) {

    updates.versionUpdates.subscribe(evt => { // TODO: Prevent spam in snackbar
      switch (evt.type) {
        case 'NO_NEW_VERSION_DETECTED':
          this.updateQueue.next(`App is up-to-date`);

          break;
        case 'VERSION_DETECTED':
          this.updateQueue.next(`Downloading new app version: ${evt.version.hash}`);

          break;
        case 'VERSION_READY':
          setTimeout(() => {
            this.updateQueue.next(`
              Current app version: ${evt.currentVersion.hash} \n
              New app version ready for use: ${evt.latestVersion.hash}
              `
            );
          }, 3000) // Wait here because VERSION_DETECTED and VERSION_READY are close

          break;
        case 'VERSION_INSTALLATION_FAILED':
          this.updateQueue.next(`Failed to install app version '${evt.version.hash}': ${evt.error}`);

          break;
      }
    });

    this.updateQueue.pipe(filter(Boolean)).subscribe((msg) => this.snackBar.open(msg, undefined, {
      duration: 2500, panelClass: ['success-snackbar']
    }))
  }

}
