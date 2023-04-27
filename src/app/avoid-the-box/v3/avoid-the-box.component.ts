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
  selector: 'avoid-the-box-v3',
  templateUrl: './avoid-the-box.component.html',
  styleUrls: ['./avoid-the-box.component.scss'],
})
export class AvoidTheBoxV3Component implements OnInit, AfterViewInit {
  @ViewChild('sceneCanvas') private sceneCanvas: ElementRef;
  @ViewChild('sceneVideo') private video: ElementRef;
  width = 720;
  height = 405;
  resizeRatio = 1;

  sceneStages: SceneStage[] = [
    { id: SCENE_STAGE.PAUSED, name: 'Paused', frames: 0, millis: 0 },
    { id: SCENE_STAGE.FIRST_MOVE, name: 'FirstMove', frames: 50, millis: 0 },
    { id: SCENE_STAGE.SECOND_MOVE, name: 'SecondMove', frames: 50, millis: 0 },
    { id: SCENE_STAGE.THIRD_MOVE, name: 'ThirdMove', frames: 50, millis: 0 },
    { id: SCENE_STAGE.DISPLAY, name: 'Display', frames: 200, millis: 0 },
  ];
  currentStage = SCENE_STAGE.PAUSED;
  remainingStageFrames = 0;
  currentRectLines: SceneRectLines = { top: 0, right: 0, bottom: 0, left: 0 };
  targetRectLines: SceneRectLines = { top: 0, right: 0, bottom: 0, left: 0 };
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

  private accessWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        this.resizeRatio =
          (stream.getVideoTracks()[0].getSettings().width ?? this.width) /
          this.width;
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
        this.timerCallback();
      });
    }
  }

  private timerCallback() {
    if (this.video.nativeElement.paused || this.video.nativeElement.ended) {
      return;
    }
    this.computeFrame();
    setTimeout(() => {
      this.timerCallback();
    }, 0);
  }

  public toggleMovement() {
    this.currentStage =
      this.currentStage === SCENE_STAGE.PAUSED
        ? SCENE_STAGE.FIRST_MOVE
        : SCENE_STAGE.PAUSED;
    this.remainingStageFrames = this.getCurrentStageObj.frames;
    this.currentRectLines = this.getNewTargetRect();
    const newRectObj = this.getMovementTargetRect(this.currentRectLines);
    this.targetRectLines = newRectObj.rect;
    this.rectSpeed = newRectObj.movedPixels / this.getCurrentStageObj.frames;
  }

  private getNewTargetRect(): SceneRectLines {
    let tempReturn = { top: 0, right: 0, bottom: 0, left: 0 };

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

  private getMovementTargetRect(current: SceneRectLines): {
    rect: SceneRectLines;
    movedPixels: number;
  } {
    // 50:50 to move origin or just 1 line
    if (Math.random() < 0.5) {
      //move origin
      const newOrigin = this.getNewTargetRect();
      // 50:50 to move origin on the x or y axis
      if (Math.random() < 0.5) {
        const movedPixels = Math.max(
          Math.abs(newOrigin.right - current.right),
          Math.abs(newOrigin.left - current.left)
        );
        return {
          rect: {
            top: current.top,
            right: newOrigin.right,
            bottom: current.bottom,
            left: newOrigin.left,
          },
          movedPixels,
        };
      } else {
        const movedPixels = Math.max(
          Math.abs(newOrigin.top - current.top),
          Math.abs(newOrigin.bottom - current.bottom)
        );
        return {
          rect: {
            top: newOrigin.top,
            right: current.right,
            bottom: newOrigin.bottom,
            left: current.left,
          },
          movedPixels,
        };
      }
    } else {
      let tempReturn = { rect: { ...current }, movedPixels: 0 };

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
        switch (randomPick) {
          // top line
          case 0:
            if (originTopGap >= maxMovement) {
              // if we could move up
              isPicking = false;
              tempReturn.rect.top -= Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.top - current.top
              );
            } else if (currentHeight > heightMin + maxMovement) {
              // if we could move down
              isPicking = false;
              tempReturn.rect.top += Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.top - current.top
              );
            }
            break;
          // right line
          case 1:
            if (originRightGap >= maxMovement) {
              // if we could move right
              isPicking = false;
              tempReturn.rect.right += Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.right - current.right
              );
            } else if (currentWidth > widthMin + maxMovement) {
              // if we could move left
              isPicking = false;
              tempReturn.rect.right -= Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.right - current.right
              );
            }
            break;
          // bottom line
          case 2:
            if (originBottomGap >= maxMovement) {
              // if we could move down
              isPicking = false;
              tempReturn.rect.bottom += Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.bottom - current.bottom
              );
            } else if (currentHeight > heightMin + maxMovement) {
              // if we could move up
              isPicking = false;
              tempReturn.rect.bottom -= Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.bottom - current.bottom
              );
            }
            break;
          // left line
          case 3:
            if (originLeftGap >= maxMovement) {
              // if we could move left
              isPicking = false;
              tempReturn.rect.left -= Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.left - current.left
              );
            } else if (currentWidth > widthMin + maxMovement) {
              // if we could move right
              isPicking = false;
              tempReturn.rect.left += Math.ceil(Math.random() * 40) + 10;
              tempReturn.movedPixels = Math.abs(
                tempReturn.rect.left - current.left
              );
            }
            break;
        }
      }
      return tempReturn;
    }
  }

  public get getCurrentStageObj(): SceneStage {
    return (
      this.sceneStages.find((stage) => stage.id === this.currentStage) ??
      this.sceneStages[0]
    );
  }

  private getNextRect(): SceneRectLines {
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

  private get isRectAtTarget(): boolean {
    // return true if all lines match
    return (
      this.currentRectLines.top === this.targetRectLines.top &&
      this.currentRectLines.right === this.targetRectLines.right &&
      this.currentRectLines.bottom === this.targetRectLines.bottom &&
      this.currentRectLines.left === this.targetRectLines.left
    );
  }

  private getNextStage(): number {
    // go to next stage, but skip paused
    return (this.currentStage + 1) % this.sceneStages.length || 1;
  }

  private computeFrame(): void {
    // If we're still doing the display stage, don't change the picture
    if (
      this.currentStage === SCENE_STAGE.DISPLAY &&
      this.remainingStageFrames > 0
    ) {
      this.remainingStageFrames -= 1;
      return;
    }
    // else get our current render and draw on the webcam's current frame
    const context: CanvasRenderingContext2D =
      this.sceneCanvas.nativeElement.getContext('2d');
    context.drawImage(this.video.nativeElement, 0, 0, this.width, this.height);

    // if the rectangle is moving, advance the movement
    if (this.currentStage !== SCENE_STAGE.PAUSED) {
      this.remainingStageFrames -= 1;
      // if we're done with the current movement
      if (this.isRectAtTarget) {
        // advance to the next stage
        this.currentStage = this.getNextStage();
        // patch for updated stage enum, skip pre-display
        if (this.currentStage === SCENE_STAGE.PRE_DISPLAY) this.currentStage = SCENE_STAGE.DISPLAY;
        this.remainingStageFrames = this.getCurrentStageObj.frames;
        // if the stage changed to paused, don't do anything
        if (this.currentStage === SCENE_STAGE.PAUSED) return;
        // if we advanced to the display stage do the special render and nothing else
        if (this.currentStage === SCENE_STAGE.DISPLAY) {
          this.drawDisplayStage(context);
          return;
        }
        const targetRectObj = this.getMovementTargetRect(this.currentRectLines);
        this.targetRectLines = targetRectObj.rect;
        this.rectSpeed =
          targetRectObj.movedPixels / this.getCurrentStageObj.frames;
      }
      // Get the next frame
      this.currentRectLines = this.getNextRect();
      //
      // Draw current selection
      //
      // Tint area not in selection
      this.drawTintAroundSelection(context);
      // Draw selection rectangles
      const mainRectWidth = 2;
      const secondaryRectWidth = 0.5;
      this.drawSelectionMainRectangles(
        context,
        'white',
        'white',
        mainRectWidth,
        secondaryRectWidth
      );
      // Make fancy corners
      const cornerOffset = mainRectWidth / 2;
      const cornerWidth = 5;
      const cornerLength = 20;
      this.drawSelectionCornerRectangles(
        context,
        cornerWidth,
        cornerLength,
        cornerOffset,
        'white'
      );
      this.drawSelectionCornerTriangles(
        context,
        cornerWidth,
        cornerLength,
        cornerOffset,
        'white'
      );
    }
  }

  private drawDisplayStage(context: CanvasRenderingContext2D): void {
    // compute the size
    const tempRectWidth =
      this.currentRectLines.right - this.currentRectLines.left;
    const tempRectHeight =
      this.currentRectLines.bottom - this.currentRectLines.top;
    // compute where to place for it to be centered
    const leftPad = (this.width - tempRectWidth) / 2;
    const topPad = (this.height - tempRectHeight) / 2;
    // resize image to fill space more
    const minPad = 50;
    let resizedRectWidth = tempRectWidth;
    let resizedRectHeight = tempRectHeight;
    let leftResizePad = leftPad;
    let topResizePad = topPad;
    // if we can resize
    if (leftPad > minPad && topPad > minPad) {
      const maxHeightResizeRatio = (this.height - 2 * minPad) / tempRectHeight;
      const maxWidthResizeRatio = (this.width - 2 * minPad) / tempRectWidth;
      // use the smallest ratio to not go over
      if (maxHeightResizeRatio < maxWidthResizeRatio) {
        resizedRectWidth *= maxHeightResizeRatio;
        resizedRectHeight *= maxHeightResizeRatio;
      } else {
        resizedRectWidth *= maxWidthResizeRatio;
        resizedRectHeight *= maxWidthResizeRatio;
      }
      leftResizePad = (this.width - resizedRectWidth) / 2;
      topResizePad = (this.height - resizedRectHeight) / 2;
      // if somehow we ended up with an invalid situation revert ... probably not needed
      if (
        resizedRectWidth + 2 * minPad > this.width ||
        resizedRectHeight + 2 * minPad > this.height
      ) {
        resizedRectWidth = tempRectWidth;
        resizedRectHeight = tempRectHeight;
        leftResizePad = leftPad;
        topResizePad = topPad;
      }
    }
    // make background black
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.width, this.height);
    // arguments: source, top left coords to start capture, dimensions of capture,
    //            top left coord to start paste, dimensions of paste
    context.drawImage(
      this.video.nativeElement,
      this.currentRectLines.left * this.resizeRatio,
      this.currentRectLines.top * this.resizeRatio,
      tempRectWidth * this.resizeRatio,
      tempRectHeight * this.resizeRatio,
      leftResizePad,
      topResizePad,
      resizedRectWidth,
      resizedRectHeight
    );
  }

  private drawTintAroundSelection(context: CanvasRenderingContext2D): void {
    context.globalAlpha = 0.5;
    context.fillStyle = 'black';
    // overlay the tint over the whole frame
    context.fillRect(0, 0, this.width, this.height);
    // copy selection so it's not tinted
    context.drawImage(
      this.video.nativeElement,
      this.currentRectLines.left * this.resizeRatio,
      this.currentRectLines.top * this.resizeRatio,
      (this.currentRectLines.right - this.currentRectLines.left) *
        this.resizeRatio,
      (this.currentRectLines.bottom - this.currentRectLines.top) *
        this.resizeRatio,
      this.currentRectLines.left,
      this.currentRectLines.top,
      this.currentRectLines.right - this.currentRectLines.left,
      this.currentRectLines.bottom - this.currentRectLines.top
    );
    // reset global alpha
    context.globalAlpha = 1;
  }

  //
  // Note: Math.floor is needed to prevent weird gaps
  //        due to pixels being whole numbers.
  //

  private drawSelectionMainRectangles(
    context: CanvasRenderingContext2D,
    primaryStroke: string,
    secondaryStroke: string,
    primaryWidth: number,
    secondaryWidth: number
  ): void {
    const heightThird =
      (this.currentRectLines.bottom - this.currentRectLines.top) / 3;
    const widthThird =
      (this.currentRectLines.right - this.currentRectLines.left) / 3;
    context.strokeStyle = primaryStroke;
    // main rect
    context.beginPath();
    context.rect(
      Math.floor(this.currentRectLines.left),
      Math.floor(this.currentRectLines.top),
      Math.floor(this.currentRectLines.right - this.currentRectLines.left) + 1,
      Math.floor(this.currentRectLines.bottom - this.currentRectLines.top) + 1
    );
    context.lineWidth = primaryWidth;
    context.stroke();
    // inner rect 1
    context.strokeStyle = secondaryStroke;
    context.beginPath();
    context.rect(
      Math.floor(this.currentRectLines.left + widthThird),
      Math.floor(this.currentRectLines.top),
      Math.floor(widthThird),
      Math.floor(this.currentRectLines.bottom - this.currentRectLines.top)
    );
    context.lineWidth = secondaryWidth;
    context.stroke();
    // inner rect 2
    context.beginPath();
    context.rect(
      Math.floor(this.currentRectLines.left),
      Math.floor(this.currentRectLines.top + heightThird),
      Math.floor(this.currentRectLines.right - this.currentRectLines.left),
      Math.floor(heightThird)
    );
    context.lineWidth = secondaryWidth;
    context.stroke();
  }

  private drawSelectionCornerRectangles(
    context: CanvasRenderingContext2D,
    cornerWidth: number,
    cornerLength: number,
    cornerOffset: number,
    fillStyle: string
  ): void {
    context.fillStyle = fillStyle;
    // top-left corner left rect
    context.fillRect(
      Math.floor(this.currentRectLines.left - (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.top - cornerOffset),
      cornerWidth,
      cornerLength
    );
    // top-left corner top rect
    context.fillRect(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.top - (cornerWidth + cornerOffset)),
      cornerLength,
      cornerWidth
    );
    // top-right corner right rect
    context.fillRect(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.top - cornerOffset),
      cornerWidth,
      cornerLength
    );
    // top-right corner top rect
    context.fillRect(
      Math.floor(this.currentRectLines.right - (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.top - (cornerWidth + cornerOffset)),
      cornerLength,
      cornerWidth
    );
    // bottom-left corner left rect
    context.fillRect(
      Math.floor(this.currentRectLines.left - (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.bottom - (cornerLength - cornerOffset)),
      cornerWidth,
      cornerLength
    );
    // bottom-left corner bottom rect
    context.fillRect(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.bottom + cornerOffset),
      cornerLength,
      cornerWidth
    );
    // bottom-right corner right rect
    context.fillRect(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.bottom - (cornerLength - cornerOffset)),
      cornerWidth,
      cornerLength
    );
    // bottom-right corner bottom rect
    context.fillRect(
      Math.floor(this.currentRectLines.right - (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.bottom + cornerOffset),
      cornerLength,
      cornerWidth
    );
  }

  private drawSelectionCornerTriangles(
    context: CanvasRenderingContext2D,
    cornerWidth: number,
    cornerLength: number,
    cornerOffset: number,
    fillStyle: string
  ): void {
    context.fillStyle = fillStyle;
    // top-left left triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.left - (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.top + (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.top + (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(
        this.currentRectLines.top + (cornerLength + cornerOffset + cornerOffset)
      )
    );
    context.closePath();
    context.fill();
    // top-left middle triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.left - (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.top - (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.closePath();
    context.fill();
    // top-left top triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.left + (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.top - (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left + (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.lineTo(
      Math.floor(
        this.currentRectLines.left +
          (cornerLength + cornerOffset + cornerOffset)
      ),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.closePath();
    context.fill();
    // top-right right triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.right + (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.top + (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.top + (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(
        this.currentRectLines.top + (cornerLength + cornerOffset + cornerOffset)
      )
    );
    context.closePath();
    context.fill();
    // top-right middle triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.right + (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.top - (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.closePath();
    context.fill();
    // top-right top triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.right - (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.top - (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right - (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.lineTo(
      Math.floor(
        this.currentRectLines.right -
          (cornerLength + cornerOffset + cornerOffset)
      ),
      Math.floor(this.currentRectLines.top - cornerOffset)
    );
    context.closePath();
    context.fill();
    // bottom-left left triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.left - (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.bottom - (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.bottom - (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(
        this.currentRectLines.bottom -
          (cornerLength + cornerOffset + cornerOffset)
      )
    );
    context.closePath();
    context.fill();
    // bottom-left middle triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.left - (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.bottom + (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left - cornerOffset),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.closePath();
    context.fill();
    // bottom-left bottom triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.left + (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.bottom + (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.left + (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.lineTo(
      Math.floor(
        this.currentRectLines.left +
          (cornerLength + cornerOffset + cornerOffset)
      ),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.closePath();
    context.fill();
    // bottom-right right triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.right + (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.bottom - (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.bottom - (cornerLength - cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(
        this.currentRectLines.bottom -
          (cornerLength + cornerOffset + cornerOffset)
      )
    );
    context.closePath();
    context.fill();
    // bottom-right middle triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.right + (cornerWidth + cornerOffset)),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.bottom + (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right + cornerOffset),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.closePath();
    context.fill();
    // bottom-right bottom triangle
    context.beginPath();
    context.moveTo(
      Math.floor(this.currentRectLines.right - (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.bottom + (cornerWidth + cornerOffset))
    );
    context.lineTo(
      Math.floor(this.currentRectLines.right - (cornerLength - cornerOffset)),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.lineTo(
      Math.floor(
        this.currentRectLines.right -
          (cornerLength + cornerOffset + cornerOffset)
      ),
      Math.floor(this.currentRectLines.bottom + cornerOffset)
    );
    context.closePath();
    context.fill();
  }
}
