import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebGLService } from "./services/web-gl.service";

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, AfterViewInit {
  	
  @ViewChild('sceneCanvas') private canvas: ElementRef | undefined;

  ngAfterViewInit(): void {	
    if (!this.canvas) {
      alert("canvas not supplied! cannot bind WebGL context!");
      return;
    }
    this.webglService.initialiseWebGLContext(this.canvas.nativeElement);
  }

  constructor(private webglService: WebGLService) {}

  ngOnInit(): void {}  
}
