import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { WebGLService } from './services/web-gl.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit, AfterViewInit {
  @ViewChild('sceneCanvas') private sceneCanvas: ElementRef;
  @ViewChild('sceneVideo') private video: ElementRef;
  width = 720;
  height = 405;

  isRectMoving = false;
  currentRectLines = [0, 0, 0, 0]; // top, right, bottom, left
  targetRectLines = [0, 0, 0, 0];
  rectSpeed = 1; // Pixels to move every frame

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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
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
  }

  toggleMovement() {
    this.isRectMoving = !this.isRectMoving;
    this.currentRectLines = [0, 0, 0, 0];
    this.targetRectLines = [0, 0, 0, 0];
  }

  getNewTargetRect(): number[] {
    let tempReturn = [0, 0, 0, 0];

    const originY = Math.random() * (this.height - 100) + 50;
    const originX = Math.random() * (this.width - 100) + 50;

    const originTopGap = originY;
    const originRightGap = this.width - originX;
    const originBottomGap = this.height - originY;
    const originLeftGap = originX;

    const heightMin = 50;
    const heightMax = Math.min(originTopGap, originBottomGap);
    const widthMin = 50;
    const widthMax = Math.min(originRightGap, originLeftGap);

    const rectHeight = Math.random() * (heightMax - heightMin) + heightMin;
    const rectWidth = Math.random() * (widthMax - widthMin) + widthMin;

    tempReturn[0] = originY - rectHeight / 2;
    tempReturn[1] = originX + rectWidth / 2;
    tempReturn[2] = originY + rectHeight / 2;
    tempReturn[3] = originX - rectWidth / 2;

    return tempReturn;
  }

  getNextRect(): number[] {
    let tempReturn = [0, 0, 0, 0];

    const moveToDoTop = this.targetRectLines[0] - this.currentRectLines[0];
    const moveToDoRight = this.targetRectLines[1] - this.currentRectLines[1];
    const moveToDoBottom = this.targetRectLines[2] - this.currentRectLines[2];
    const moveToDoLeft = this.targetRectLines[3] - this.currentRectLines[3];

    const moveTop =
      Math.abs(moveToDoTop) <= this.rectSpeed
        ? Math.abs(moveToDoTop)
        : this.rectSpeed;
    const moveRight =
      Math.abs(moveToDoRight) <= this.rectSpeed
        ? Math.abs(moveToDoRight)
        : this.rectSpeed;
    const moveBottom =
      Math.abs(moveToDoBottom) <= this.rectSpeed
        ? Math.abs(moveToDoBottom)
        : this.rectSpeed;
    const moveLeft =
      Math.abs(moveToDoLeft) <= this.rectSpeed
        ? Math.abs(moveToDoLeft)
        : this.rectSpeed;

    tempReturn[0] =
      moveToDoTop > 0
        ? this.currentRectLines[0] + moveTop
        : this.currentRectLines[0] - moveTop;
    tempReturn[1] =
      moveToDoRight > 0
        ? this.currentRectLines[1] + moveRight
        : this.currentRectLines[1] - moveRight;
    tempReturn[2] =
      moveToDoBottom > 0
        ? this.currentRectLines[2] + moveBottom
        : this.currentRectLines[2] - moveBottom;
    tempReturn[3] =
      moveToDoLeft > 0
        ? this.currentRectLines[3] + moveLeft
        : this.currentRectLines[3] - moveLeft;

    return tempReturn;
  }

  get isRectAtTarget(): boolean {
    if (
      this.currentRectLines[0] === this.targetRectLines[0] &&
      this.currentRectLines[1] === this.targetRectLines[1] &&
      this.currentRectLines[2] === this.targetRectLines[2] &&
      this.currentRectLines[3] === this.targetRectLines[3]
    ) {
      return true;
    } else {
      return false;
    }
  }

  computeFrame(): void {
    const context = this.sceneCanvas.nativeElement.getContext('2d');
    context.drawImage(this.video.nativeElement, 0, 0, this.width, this.height);

    // if the rectangle is moving, advance the movement
    if (this.isRectMoving) {
      if (this.isRectAtTarget) {
        this.targetRectLines = this.getNewTargetRect();
      }
      this.currentRectLines = this.getNextRect();

      const heightThird =
        (this.currentRectLines[2] - this.currentRectLines[0]) / 3;
      const widthThird =
        (this.currentRectLines[1] - this.currentRectLines[3]) / 3;

      context.beginPath();
      context.rect(
        this.currentRectLines[3],
        this.currentRectLines[0],
        this.currentRectLines[1] - this.currentRectLines[3],
        this.currentRectLines[2] - this.currentRectLines[0]
      );
      context.strokeStyle = 'grey';
      context.lineWidth = 5;
      context.stroke();

      context.beginPath();
      context.rect(
        this.currentRectLines[3] + widthThird,
        this.currentRectLines[0],
        widthThird,
        this.currentRectLines[2] - this.currentRectLines[0]
      );
      context.strokeStyle = 'light grey';
      context.lineWidth = 1;
      context.stroke();

      context.beginPath();
      context.rect(
        this.currentRectLines[3],
        this.currentRectLines[0] + heightThird,
        this.currentRectLines[1] - this.currentRectLines[3],
        heightThird
      );
      context.strokeStyle = 'light grey';
      context.lineWidth = 1;
      context.stroke();
    }
  }
}
