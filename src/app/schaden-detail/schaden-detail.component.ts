import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Schaden} from "../db";
import {SchadenService} from "../schaden.service";
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from "@angular/material/legacy-dialog";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-schaden-detail',
  templateUrl: './schaden-detail.component.html',
  styleUrls: ['./schaden-detail.component.scss']
})
export class SchadenDetailComponent implements OnInit {
  selected$?: Observable<Schaden>

  constructor(@Inject(MAT_DIALOG_DATA) public data: {id: number}, private sanitizer: DomSanitizer, private schadenService: SchadenService) {
    this.selected$ = this.schadenService.get(data.id)
  }

  ngOnInit(): void {
  }

  getAsDataURL(bild: Blob): SafeUrl {
    let objectURL = URL.createObjectURL(bild);
    return this.sanitizer.bypassSecurityTrustUrl(objectURL);
  }
}
