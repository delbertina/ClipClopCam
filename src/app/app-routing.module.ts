import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { AvoidTheBoxComponent } from './avoid-the-box/avoid-the-box.component';
import { AvoidTheBoxV1Component } from './avoid-the-box/v1/avoid-the-box.component';
import { AvoidTheBoxV2Component } from './avoid-the-box/v2/avoid-the-box.component';
import { AvoidTheBoxV3Component } from './avoid-the-box/v3/avoid-the-box.component';
import { HomeComponent } from './home/home.component';
const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "avoid-the-box", component: AvoidTheBoxComponent },
  { path: "avoid-the-box/v3", component: AvoidTheBoxV3Component },
  { path: "avoid-the-box/v2", component: AvoidTheBoxV2Component },
  { path: "avoid-the-box/v1", component: AvoidTheBoxV1Component },
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
