import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebGLService {
  private _renderingContext: RenderingContext | null = null;
  private get gl(): WebGLRenderingContext {
    return this._renderingContext as WebGLRenderingContext;
  }

  constructor() { }

  initialiseWebGLContext(canvas: HTMLCanvasElement) {
    this._renderingContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!this.gl) {
      alert('Unable to initialize WebGL. Your browser may not support it.');
      return;
    }
    this.setWebGLCanvasDimensions(canvas);
    this.initialiseWebGLCanvas();
  }

  setWebGLCanvasDimensions(canvas: HTMLCanvasElement) {
    this.gl.canvas.width = canvas.clientWidth;
    this.gl.canvas.height = canvas.clientHeight;
  }

  initialiseWebGLCanvas() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
