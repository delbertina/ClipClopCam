import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { AvoidTheBoxComponent } from './avoid-the-box/avoid-the-box.component';
import { AvoidTheBoxV1Component } from './avoid-the-box/v1/avoid-the-box.component';
import { AvoidTheBoxV2Component } from './avoid-the-box/v2/avoid-the-box.component';
import { AvoidTheBoxV3Component } from './avoid-the-box/v3/avoid-the-box.component';
const routes: Routes = [
  { path: "", component: AvoidTheBoxComponent },
  { path: "v3", component: AvoidTheBoxV3Component },
  { path: "v2", component: AvoidTheBoxV2Component },
  { path: "v1", component: AvoidTheBoxV1Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
