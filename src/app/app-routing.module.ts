import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BauwerkspruefungDetailComponent} from "./bauwerkspruefung-detail/bauwerkspruefung-detail.component";

const routes: Routes = [
  {
    path: "bauwerkspruefung/:id",
    component: BauwerkspruefungDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
