import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SceneComponent } from './scene/scene.component';
import { AppRoutingModule } from './app-routing.module';
import { SceneV1Component } from './scene/v1/scene.component';
import { SceneV2Component } from './scene/v2/scene.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    SceneV1Component,
    SceneV2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
