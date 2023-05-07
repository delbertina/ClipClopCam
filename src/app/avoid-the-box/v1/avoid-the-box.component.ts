import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SCENE_STAGE, SceneRectLines } from 'src/app/types';

@Component({
  selector: 'avoid-the-box-v1',
  templateUrl: './avoid-the-box.component.html',
  styleUrls: ['./avoid-the-box.component.scss'],
})
export class AvoidTheBoxV1Component implements OnInit, AfterViewInit {
  @ViewChild('sceneCanvas') private sceneCanvas: ElementRef;
  @ViewChild('sceneVideo') private video: ElementRef;
  width = 720;
  height = 405;

  currentStage = SCENE_STAGE.PAUSED;
  currentRectLines: SceneRectLines = { top: 0, right: 0, bottom: 0, left: 0 };
  targetRectLines: SceneRectLines = { top: 0, right: 0, bottom: 0, left: 0 };
  rectSpeed = 1; // Pixels to move every frame

  public captures: Array<any>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
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
    this.currentStage =
      this.currentStage === SCENE_STAGE.PAUSED
        ? SCENE_STAGE.FIRST_MOVE
        : SCENE_STAGE.PAUSED;
    this.currentRectLines = { top: 0, right: 0, bottom: 0, left: 0 };
    this.targetRectLines = { top: 0, right: 0, bottom: 0, left: 0 };
  }

  getNewTargetRect(): SceneRectLines {
    let tempReturn = { top: 0, right: 0, bottom: 0, left: 0 };

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

    tempReturn.top = originY - rectHeight / 2;
    tempReturn.right = originX + rectWidth / 2;
    tempReturn.bottom = originY + rectHeight / 2;
    tempReturn.left = originX - rectWidth / 2;

    return tempReturn;
  }

  getNextRect(): SceneRectLines {
    let tempReturn = { top: 0, right: 0, bottom: 0, left: 0 };

    const moveToDoTop = this.targetRectLines.top - this.currentRectLines.top;
    const moveToDoRight =
      this.targetRectLines.right - this.currentRectLines.right;
    const moveToDoBottom =
      this.targetRectLines.bottom - this.currentRectLines.bottom;
    const moveToDoLeft = this.targetRectLines.left - this.currentRectLines.left;

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

    tempReturn.top =
      moveToDoTop > 0
        ? this.currentRectLines.top + moveTop
        : this.currentRectLines.top - moveTop;
    tempReturn.right =
      moveToDoRight > 0
        ? this.currentRectLines.right + moveRight
        : this.currentRectLines.right - moveRight;
    tempReturn.bottom =
      moveToDoBottom > 0
        ? this.currentRectLines.bottom + moveBottom
        : this.currentRectLines.bottom - moveBottom;
    tempReturn.left =
      moveToDoLeft > 0
        ? this.currentRectLines.left + moveLeft
        : this.currentRectLines.left - moveLeft;

    return tempReturn;
  }

  get isRectAtTarget(): boolean {
    if (
      this.currentRectLines.top === this.targetRectLines.top &&
      this.currentRectLines.right === this.targetRectLines.right &&
      this.currentRectLines.bottom === this.targetRectLines.bottom &&
      this.currentRectLines.left === this.targetRectLines.left
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
    if (this.currentStage !== SCENE_STAGE.PAUSED) {
      if (this.isRectAtTarget) {
        this.targetRectLines = this.getNewTargetRect();
      }
      this.currentRectLines = this.getNextRect();

      const heightThird =
        (this.currentRectLines.bottom - this.currentRectLines.top) / 3;
      const widthThird =
        (this.currentRectLines.right - this.currentRectLines.left) / 3;

      context.beginPath();
      context.rect(
        this.currentRectLines.left,
        this.currentRectLines.top,
        this.currentRectLines.right - this.currentRectLines.left,
        this.currentRectLines.bottom - this.currentRectLines.top
      );
      context.strokeStyle = 'grey';
      context.lineWidth = 5;
      context.stroke();

      context.beginPath();
      context.rect(
        this.currentRectLines.left + widthThird,
        this.currentRectLines.top,
        widthThird,
        this.currentRectLines.bottom - this.currentRectLines.top
      );
      context.strokeStyle = 'light grey';
      context.lineWidth = 1;
      context.stroke();

      context.beginPath();
      context.rect(
        this.currentRectLines.left,
        this.currentRectLines.top + heightThird,
        this.currentRectLines.right - this.currentRectLines.left,
        heightThird
      );
      context.strokeStyle = 'light grey';
      context.lineWidth = 1;
      context.stroke();
    }
  }
}
