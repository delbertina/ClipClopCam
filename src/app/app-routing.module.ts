import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { SceneComponent } from "./scene/scene.component";
import { SceneV1Component } from './scene/v1/scene.component';
import { SceneV2Component } from './scene/v2/scene.component';
const routes: Routes = [
  { path: "", component: SceneComponent },
  { path: "v2", component: SceneV2Component },
  { path: "v1", component: SceneV1Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
