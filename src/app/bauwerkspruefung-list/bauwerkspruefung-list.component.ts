import {Component, Input} from '@angular/core';
import {Bauwerkspruefung} from "../db";

@Component({
  selector: 'app-bauwerkspruefung-list',
  templateUrl: './bauwerkspruefung-list.component.html',
  styleUrls: ['./bauwerkspruefung-list.component.scss']
})
export class BauwerkspruefungListComponent {

  @Input() items: Bauwerkspruefung[] | null = [];
}
