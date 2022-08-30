import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {db, Schaden} from "./db";
import {liveQuery} from "dexie";
import {FeatureGroup, featureGroup, latLng, Map, tileLayer} from "leaflet";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {OnlineStateService} from "./online-state.service";
import {Observable} from "rxjs";

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

  schaeden$ = liveQuery(
    () => this.getSchaeden()
  );

  isOnline$: Observable<boolean>

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, private onlineStateService: OnlineStateService) {
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

    this.showEstimatedQuota().then((available) => {
      this.availableSpace = available
    })

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: {facingMode: {exact: "environment"}},
        audio: false
      })
        .then(stream => {
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

  async save() {
    const count = +this.countCtrl.value ?? 1
    const schaeden: Schaden[] = [...Array(count).keys()].map((id: number) => ({
      title: `${this.form.value.title} ${id}`,
      bild: this.form.value.bild
    }))
    await db.schaeden.bulkAdd([...schaeden]);
  }

  async getSchaeden() {
    return await db.schaeden.toArray()
  }

  async getSchaden() {
    return await db.schaeden.get(this.selected?.id ?? -1);
  }

  async deleteSchaden(id?: number) {
    id ? await db.schaeden.delete(id) : undefined
  }

  setFile(event: any) {
    const selectedFile = event?.target.files || event.srcElement.files;
    if (selectedFile !== null && selectedFile !== '' && selectedFile.length > 0) {
      const file = selectedFile[0];
      this.bildCtrl.patchValue(file)
      this.clearFile();
    }
  }

  public clearFile() {
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
    edit: {
      featureGroup: this.drawnItems
    }
  };

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
}
