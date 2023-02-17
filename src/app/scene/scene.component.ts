import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebGLService } from "./services/web-gl.service";

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, AfterViewInit {
  	
  @ViewChild('tempImgCanvas') private tempImgCanvas: ElementRef;
  @ViewChild('sceneCanvas') private sceneCanvas: ElementRef;
  @ViewChild('sceneVideo') private video: ElementRef;

  public captures: Array<any>;

  constructor(private webglService: WebGLService) {
    this.captures = [];
  }

  ngOnInit(): void {}  

  ngAfterViewInit(): void {
    // this.webglService.initialiseWebGLContext(this.canvas.nativeElement);
    this.accessWebcam();
  }

  accessWebcam() {
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
      });
  }
  }

  capture() {
    this.video.nativeElement.pause();
    setTimeout(() => {
      this.video.nativeElement.play();
    }, 1000);
    this.tempImgCanvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 720, 405);
    this.captures.push(this.tempImgCanvas.nativeElement.toDataURL("image/png"));
  }
}
