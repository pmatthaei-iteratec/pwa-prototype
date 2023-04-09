import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {db, Schaden} from "./db";
import {liveQuery, PromiseExtended} from "dexie";
import {Control, FeatureGroup, featureGroup, latLng, Map, tileLayer} from "leaflet";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {OnlineStateService} from "./online-state.service";
import {Observable} from "rxjs";
import {UpdateNotificationService} from "./update-notification.service";
import DrawConstructorOptions = Control.DrawConstructorOptions;
import {SchadenService} from "./schaden.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef;
  @ViewChild('canvas') canvasRef!: ElementRef;
  @ViewChild('imageFileInput') imageFileInput!: ElementRef;
  @ViewChild('frontCameraInput') frontCameraInput!: ElementRef;

  private canvas: any;
  private video: any;
  public videoCapable = true;
  public pictureTaken = false;
  public downloadLink!: string;
  private mediaStream: any;

  form: FormGroup
  bildCtrl: FormControl
  countCtrl: FormControl

  availableSpace!: string
  selected: Schaden | undefined

  schaeden$ = this.schadenService.getAll()

  isOnline$: Observable<boolean>

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, public schadenService: SchadenService, private onlineStateService: OnlineStateService, private updateNotificationService: UpdateNotificationService) {
    this.bildCtrl = this.fb.control(null)
    this.countCtrl = this.fb.control(null)
    this.form = this.fb.group({
      title: this.fb.control(null, Validators.required),
      bild: this.bildCtrl,
      count: this.countCtrl
    })
    this.isOnline$ = this.onlineStateService.isOnline()
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.video = this.videoRef.nativeElement;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: {facingMode: {exact: "environment"}},
        audio: false
      }).then((stream) => {
        this.mediaStream = stream;
        this.videoCapable = true;
        const that = this;
        this.video.srcObject = this.mediaStream;
        this.video.play().then((value: any) => {
          that.canvas.width = that.video.videoWidth;
          that.canvas.height = that.video.videoHeight;
        });
      })
        .catch(err => {
          this.videoCapable = false;
        });
    }
  }

  captureImage() {
    this.canvasRef.nativeElement.height = this.videoRef.nativeElement.videoHeight;
    this.canvasRef.nativeElement.width = this.videoRef.nativeElement.videoWidth;
    const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    this.pictureTaken = true;
    this.downloadLink = this.canvas.toDataURL();
    this.canvas.toBlob((blob: Blob) => {
      this.bildCtrl.patchValue(blob)
    });
    this.video.pause();
    for (const track of this.mediaStream.getTracks()) {
      track.stop();
    }
    this.video.srcObject = null;
  }

  setFile(event: any): void {
    const selectedFile = event?.target.files || event.srcElement.files;
    if (selectedFile !== null && selectedFile !== '' && selectedFile.length > 0) {
      const file = selectedFile[0];
      this.bildCtrl.patchValue(file)
      this.clearFile();
    }
  }

  public clearFile(): void {
    this.imageFileInput.nativeElement.value = null;
    this.frontCameraInput.nativeElement.value = null;
  }

  // LEAFLET
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
    ],
    zoom: 5,
    center: latLng(46.879966, -121.726909)
  };

  drawnItems: FeatureGroup = featureGroup();

  drawOptions = {
    draw: {rectangle: {showArea: false}}, // Fix
    edit: {
      featureGroup: this.drawnItems
    }
  } as DrawConstructorOptions;

  public onDrawCreated(e: any) {
    this.drawnItems.addLayer(e.layer);
  }


  onMapReady(map: Map) {
    map.invalidateSize()
  }

  async showEstimatedQuota(): Promise<string> {
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

  async onSelect(schaden: Schaden) {
    this.selected = schaden?.id ? await db.schaeden.get(schaden.id) : undefined;
  }

  getAsDataURL(bild: Blob): SafeUrl {
    let objectURL = URL.createObjectURL(bild);
    return this.sanitizer.bypassSecurityTrustUrl(objectURL);
  }

  openFile = async () => {
    const [handle] = await (window as any).showOpenFilePicker({
      startIn: 'pictures'
    });
    handle.getFile().then(console.log)
    return handle.getFile();
  };

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
}
