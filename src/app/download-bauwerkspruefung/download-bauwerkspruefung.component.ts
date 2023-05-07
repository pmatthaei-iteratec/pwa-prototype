import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-download-bauwerkspruefung',
  templateUrl: './download-bauwerkspruefung.component.html',
  styleUrls: ['./download-bauwerkspruefung.component.scss']
})
export class DownloadBauwerkspruefungComponent implements OnInit {
  ngOnInit(): void {
    screen.orientation.lock("landscape")
  }

}
