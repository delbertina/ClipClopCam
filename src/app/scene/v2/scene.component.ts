import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SceneStage, SCENE_STAGE, SceneRectLines } from 'src/app/types';
import { WebGLService } from '../services/web-gl.service';

@Component({
  selector: 'app-scene-v2',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneV2Component implements OnInit, AfterViewInit {
  @ViewChild('sceneCanvas') private sceneCanvas: ElementRef;
  @ViewChild('sceneVideo') private video: ElementRef;
  width = 720;
  height = 405;
  resizeRatio = 1;

  sceneStages: SceneStage[] = [
    {id: SCENE_STAGE.PAUSED, name: 'Paused', frames: 0},
    {id: SCENE_STAGE.FIRST_MOVE, name: 'FirstMove', frames: 50},
    {id: SCENE_STAGE.SECOND_MOVE, name: 'SecondMove', frames: 50},
    {id: SCENE_STAGE.THIRD_MOVE, name: 'ThirdMove', frames: 50},
    {id: SCENE_STAGE.DISPLAY, name: 'Display', frames: 200}
  ];
  currentStage = SCENE_STAGE.PAUSED;
  remainingStageFrames = 0;
  currentRectLines: SceneRectLines = {top: 0, right: 0, bottom: 0, left: 0};
  targetRectLines: SceneRectLines = {top: 0, right: 0, bottom: 0, left: 0};
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
        this.resizeRatio = (stream.getVideoTracks()[0].getSettings().width ?? this.width) / this.width;
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
    this.currentStage = this.currentStage === SCENE_STAGE.PAUSED ? SCENE_STAGE.FIRST_MOVE : SCENE_STAGE.PAUSED;
    this.remainingStageFrames = this.getCurrentStageObj.frames;
    this.currentRectLines = this.getNewTargetRect();
    const newRectObj = this.getMovementTargetRect(this.currentRectLines);
    this.targetRectLines = newRectObj.rect;
    this.rectSpeed = newRectObj.movedPixels / this.getCurrentStageObj.frames;
  }

  getNewTargetRect(): SceneRectLines {
    let tempReturn = {top: 0, right: 0, bottom: 0, left: 0};

    const originY = Math.random() * (this.height - 200) + 100;
    const originX = Math.random() * (this.width - 200) + 100;

    const originTopGap = originY;
    const originRightGap = this.width - originX;
    const originBottomGap = this.height - originY;
    const originLeftGap = originX;

    const heightMin = 100;
    const heightMax = Math.min(originTopGap, originBottomGap);
    const widthMin = 100;
    const widthMax = Math.min(originRightGap, originLeftGap);

    const rectHeight = Math.random() * (heightMax - heightMin) + heightMin;
    const rectWidth = Math.random() * (widthMax - widthMin) + widthMin;

    tempReturn.top = originY - rectHeight / 2;
    tempReturn.right = originX + rectWidth / 2;
    tempReturn.bottom = originY + rectHeight / 2;
    tempReturn.left = originX - rectWidth / 2;
    return tempReturn;
  }

  getMovementTargetRect(current: SceneRectLines): {rect: SceneRectLines, movedPixels: number} {
    // 50:50 to move origin or just 1 line
    if (Math.random() < 0.5) {
      //move origin
      const newOrigin = this.getNewTargetRect();
      // 50:50 to move origin on the x or y axis
      if (Math.random() < 0.5) {
        const movedPixels = Math.max(Math.abs(newOrigin.right - current.right), Math.abs(newOrigin.left - current.left));
        return {rect: {top: current.top, right: newOrigin.right, bottom: current.bottom, left: newOrigin.left}, movedPixels};
      } else {
        const movedPixels = Math.max(Math.abs(newOrigin.top - current.top), Math.abs(newOrigin.bottom - current.bottom));
        return {rect: {top: newOrigin.top, right: current.right, bottom: newOrigin.bottom, left: current.left}, movedPixels};
      }
    } else {
      let tempReturn = {rect: {...current}, movedPixels: 0};

      const originTopGap = tempReturn.rect.top;
      const originRightGap = this.width - tempReturn.rect.right;
      const originBottomGap = this.height - tempReturn.rect.bottom;
      const originLeftGap = tempReturn.rect.left;

      const heightMin = 100;
      const widthMin = 100;
      const currentHeight = tempReturn.rect.bottom - tempReturn.rect.top;
      const currentWidth = tempReturn.rect.right - tempReturn.rect.left;

      let isPicking = true;
      const maxMovement = 50;

      while (isPicking) {
        const randomPick = Math.floor(Math.random() * 4);
        switch(randomPick) {
          // top line
          case (0):
            if (originTopGap >= maxMovement) {
              // if we could move up
              isPicking = false;
              tempReturn.rect.top -= (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.top - current.top);
            } else if (currentHeight > heightMin + maxMovement) {
              // if we could move down
              isPicking = false;
              tempReturn.rect.top += (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.top - current.top);
            }
            break;
          // right line
          case (1):
            if (originRightGap >= maxMovement) {
              // if we could move right
              isPicking = false;
              tempReturn.rect.right += (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.right - current.right);
            } else if (currentWidth > widthMin + maxMovement) {
              // if we could move left
              isPicking = false;
              tempReturn.rect.right -= (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.right - current.right);
            }
            break;
          // bottom line
          case (2):
            if (originBottomGap >= maxMovement) {
              // if we could move down
              isPicking = false;
              tempReturn.rect.bottom += (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.bottom - current.bottom);
            } else if (currentHeight > heightMin + maxMovement) {
              // if we could move up
              isPicking = false;
              tempReturn.rect.bottom -= (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.bottom - current.bottom);
            }
            break;
          // left line
          case (3):
            if (originLeftGap >= maxMovement) {
              // if we could move left
              isPicking = false;
              tempReturn.rect.left -= (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.left - current.left);
            } else if (currentWidth > widthMin + maxMovement) {
              // if we could move right
              isPicking = false;
              tempReturn.rect.left += (Math.ceil(Math.random() * 40) + 10);
              tempReturn.movedPixels = Math.abs(tempReturn.rect.left - current.left);
            }
            break;
        }
      }
      return tempReturn;
    }
  }

  get getCurrentStageObj(): SceneStage {
    return this.sceneStages.find(stage => stage.id === this.currentStage) ?? this.sceneStages[0];
  }

  getNextRect(): SceneRectLines {
    let tempReturn = {top: 0, right: 0, bottom: 0, left: 0};

    const moveToDoTop = this.targetRectLines.top - this.currentRectLines.top;
    const moveToDoRight = this.targetRectLines.right - this.currentRectLines.right;
    const moveToDoBottom = this.targetRectLines.bottom - this.currentRectLines.bottom;
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

  getNextStage(): number {
    // go to next stage, but skip paused
    return ((this.currentStage + 1) % this.sceneStages.length) || 1;
  }

  computeFrame(): void {
    // If we're still doing the display stage, don't change the picture
    if (this.currentStage === SCENE_STAGE.DISPLAY && this.remainingStageFrames > 0) {
      this.remainingStageFrames -= 1;
      return;
    }
    const context = this.sceneCanvas.nativeElement.getContext('2d');
    context.drawImage(this.video.nativeElement, 0, 0, this.width, this.height);

    // if the rectangle is moving, advance the movement
    if (this.currentStage !== SCENE_STAGE.PAUSED) {
      this.remainingStageFrames -= 1;
      if (this.isRectAtTarget) {
        this.currentStage = this.getNextStage();
        this.remainingStageFrames = this.getCurrentStageObj.frames;
        // if the stage changed to paused, don't do anything
        if (this.currentStage === SCENE_STAGE.PAUSED) return;
        if (this.currentStage === SCENE_STAGE.DISPLAY) {
          context.fillRect(0, 0, this.width, this.height);
          context.drawImage(this.video.nativeElement,
            this.currentRectLines.left * this.resizeRatio,
            this.currentRectLines.top * this.resizeRatio,
            (this.currentRectLines.right - this.currentRectLines.left) * this.resizeRatio,
            (this.currentRectLines.bottom - this.currentRectLines.top) * this.resizeRatio, 200, 100,
            this.currentRectLines.right - this.currentRectLines.left,
            this.currentRectLines.bottom - this.currentRectLines.top
          );
          return;
        }
        const targetRectObj = this.getMovementTargetRect(this.currentRectLines);
        this.targetRectLines = targetRectObj.rect;
        this.rectSpeed = targetRectObj.movedPixels / this.getCurrentStageObj.frames;
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
