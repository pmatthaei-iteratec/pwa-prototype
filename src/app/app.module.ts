import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {HttpClientModule} from "@angular/common/http";
import {MatBadgeModule} from "@angular/material/badge";
import {SchadenDetailComponent} from './schaden-detail/schaden-detail.component';
import {MatSelectModule} from "@angular/material/select";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialogModule} from "@angular/material/dialog";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatListModule} from "@angular/material/list";
import {MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {SchadenFormComponent} from './schaden-form/schaden-form.component';
import {BauwerkspruefungListComponent} from './bauwerkspruefung-list/bauwerkspruefung-list.component';
import {BauwerkspruefungDetailComponent} from './bauwerkspruefung-detail/bauwerkspruefung-detail.component';
import {DownloadBauwerkspruefungComponent} from './download-bauwerkspruefung/download-bauwerkspruefung.component';


@NgModule({
  declarations: [
    AppComponent,
    SchadenDetailComponent,
    SchadenFormComponent,
    BauwerkspruefungListComponent,
    BauwerkspruefungDetailComponent,
    DownloadBauwerkspruefungComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerImmediately'
    }),

    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDialogModule,

    MatTooltipModule,
    MatSelectModule,
    MatCardModule,
    ScrollingModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
