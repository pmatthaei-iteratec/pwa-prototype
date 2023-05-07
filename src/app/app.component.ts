import {Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {OnlineStateService} from "./online-state.service";
import {from, Observable} from "rxjs";
import {SchadenService} from "./schaden.service";
import {OfflineSyncService} from "./offline-sync.service";
import {liveQuery} from "dexie";
import {SchadenDetailComponent} from "./schaden-detail/schaden-detail.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BauwerkspruefungService} from "./bauwerkspruefung.service";
import {Bauwerkspruefung} from "./db";
import {DownloadBauwerkspruefungComponent} from "./download-bauwerkspruefung/download-bauwerkspruefung.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  schaeden$ = this.schadenService.getAll()
  isOnline$: Observable<boolean>
  unsyncedCount$: Observable<number>
  estimatedQuota$: Observable<string>
  totalUnsyncedData$: Observable<number>;

  bauwerkspruefungen$: Observable<Bauwerkspruefung[]>

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    public schadenService: SchadenService,
    public bauwerkspruefungService: BauwerkspruefungService,
    private syncService: OfflineSyncService,
    private onlineStateService: OnlineStateService
  ) {

    this.isOnline$ = this.onlineStateService.isOnline()

    this.bauwerkspruefungen$ = bauwerkspruefungService.getAll()

    this.unsyncedCount$ = from(liveQuery(() => schadenService.countAllUnsynced()))
    this.estimatedQuota$ = this.syncService.getQuota()
    this.totalUnsyncedData$ = this.syncService.getTotalUnsyncedData()
  }

  ngOnInit() {
  }

  openFile = async () => {
    const [handle] = await (window as any).showOpenFilePicker({
      startIn: 'pictures'
    });
    handle.getFile().then(console.log)
    return handle.getFile();
  };

  onSelect(id: number): void {
    this.dialog.open(SchadenDetailComponent, {data: {id}, width: '100%', height: '100vh'})
  }

  async returnPathDirectories() {
    const dirHandle = await (window as any).showDirectoryPicker({startIn: 'pictures'});
    // await this.verifyPermission()

    // Get a file handle by showing a file picker:
    const [handle] = await (window as any).showOpenFilePicker({
      startIn: dirHandle
    });
    if (!handle) {
      // User cancelled, or otherwise failed to open a file.
      return;
    }

    // Check if handle exists inside directory our directory handle
    const relativePaths = await dirHandle.resolve(handle);
    console.log(relativePaths);

    if (relativePaths === null) {
      console.log("Not inside");

      // Not inside directory handle
    } else {
      // relativePaths is an array of names, giving the relative path

      for (const name of relativePaths) {
        // log each entry
        console.log(name);
      }
    }

  }

  async verifyPermission(fileHandle: any, readWrite?: boolean): Promise<boolean> {
    const options: any = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    // Check if permission was already granted. If so, return true.
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    // Request permission. If the user grants permission, return true.
    if ((await fileHandle.requestPermission(options)) === 'granted') {
      return true;
    }
    // The user didn't grant permission, so return false.
    return false;
  }

  openDownloadForm() {
    console.log("open")
    this.dialog.open(DownloadBauwerkspruefungComponent, {data: {}, width: '100%', height: '60vh'})
  }
}
