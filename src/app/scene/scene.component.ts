import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebGLService } from "./services/web-gl.service";

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, AfterViewInit {

  @ViewChild('sceneCanvas') private sceneCanvas: ElementRef;
  @ViewChild('sceneVideo') private video: ElementRef;
  width = 720;
  height = 405;

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
          this.timerCallback();
      });
    }
  }

  timerCallback() {
    if (this.video.nativeElement.paused || this.video.nativeElement.ended) {
      return;
    }
    this.computeFrame();
    setTimeout(() => {
      this.timerCallback();
    }, 0);
  };

  computeFrame() {
    const context = this.sceneCanvas.nativeElement.getContext("2d");
    context.drawImage(this.video.nativeElement, 0, 0, this.width, this.height);
    const widthFifths = [
      0, this.width/5,
      (this.width/5)*2,
      (this.width/5)*3,
      (this.width/5)*4,
      this.width
    ];
    const heightFifths = [
      0, this.height/5,
      (this.height/5)*2,
      (this.height/5)*3,
      (this.height/5)*4,
      this.height/5
    ];

    context.beginPath();
    context.rect(widthFifths[1], heightFifths[1], this.width*0.6, this.height*0.6);
    context.strokeStyle = "grey";
    context.lineWidth = 5;
    context.stroke();

    context.beginPath();
    context.rect(widthFifths[2], heightFifths[1], this.width*0.2, this.height*0.6);
    context.strokeStyle = "light grey";
    context.lineWidth = 1;
    context.stroke();

    context.beginPath();
    context.rect(widthFifths[1], heightFifths[2], this.width*0.6, this.height*0.2);
    context.strokeStyle = "light grey";
    context.lineWidth = 1;
    context.stroke();
  };
}
