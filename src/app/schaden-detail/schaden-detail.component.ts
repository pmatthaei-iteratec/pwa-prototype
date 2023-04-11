import {Component, Inject, OnInit, Sanitizer} from '@angular/core';
import {from, Observable} from "rxjs";
import {Schaden} from "../db";
import {SchadenService} from "../schaden.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {liveQuery} from "dexie";

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
