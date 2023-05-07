import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AvoidTheBoxComponent } from './avoid-the-box/avoid-the-box.component';
import { AvoidTheBoxV1Component } from './avoid-the-box/v1/avoid-the-box.component';
import { AvoidTheBoxV2Component } from './avoid-the-box/v2/avoid-the-box.component';
import { AvoidTheBoxV3Component } from './avoid-the-box/v3/avoid-the-box.component';
import { HomeComponent } from './home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AvoidTheBoxComponent,
    AvoidTheBoxV1Component,
    AvoidTheBoxV2Component,
    AvoidTheBoxV3Component,
  ],
  imports: [BrowserModule, AppRoutingModule, NgbModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
