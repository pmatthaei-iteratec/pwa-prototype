import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {SchadenService} from "../schaden.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-schaden-form',
  templateUrl: './schaden-form.component.html',
  styleUrls: ['./schaden-form.component.scss']
})
export class SchadenFormComponent {

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

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    public schadenService: SchadenService,
  ) {
    this.bildCtrl = this.fb.control(null)
    this.countCtrl = this.fb.control(null)
    this.form = this.fb.group({
      title: this.fb.control(null, Validators.required),
      bild: this.bildCtrl,
      count: this.countCtrl,
      bwp: this.fb.control(null)
    })
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

}
