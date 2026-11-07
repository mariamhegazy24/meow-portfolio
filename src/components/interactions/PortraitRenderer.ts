import {NODE_COUNT, OVER, SoftSheet} from './SoftSheetPhysics';
import type {FaceName} from '../../types';

const VERTEX_SHADER = `
attribute vec2 a;      // rest uv
attribute vec2 d;      // displacement from the physics sheet
attribute float s;     // shade
varying vec2 vUv;
varying float vShade;
uniform vec2 lean;
uniform float overScale;
void main() {
  vUv = a;
  vShade = s;
  vec2 p = a + d + lean;
  gl_Position = vec4(vec2(p.x - .5, .5 - p.y) * 2. / overScale, 0., 1.);
}`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
varying float vShade;
uniform sampler2D faceA, faceB;
uniform float fade;
void main() {
  if (vUv.x < 0. || vUv.y < 0. || vUv.x > 1. || vUv.y > 1.) { gl_FragColor = vec4(0.); return; }
  vec4 c = mix(texture2D(faceA, vUv), texture2D(faceB, vUv), fade);
  if (c.a < .004) { gl_FragColor = vec4(0.); return; }
  gl_FragColor = vec4(c.rgb * vShade, c.a);
}`;

/** Draws the cat pictures on the soft sheet. Owns every WebGL resource and releases them in dispose(). */
export class PortraitRenderer {
  private readonly program: WebGLProgram;
  private readonly textures = new Map<FaceName, WebGLTexture>();
  private readonly buffers: WebGLBuffer[] = [];
  private readonly vertexData = new Float32Array(NODE_COUNT * 3);
  private readonly uniforms: Record<string, WebGLUniformLocation | null> = {};
  private readonly indexCount: number;
  private readonly dynamicBuffer: WebGLBuffer;

  static create(canvas: HTMLCanvasElement, sheet: SoftSheet): PortraitRenderer | null {
    const gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: true, antialias: true});
    return gl ? new PortraitRenderer(gl, sheet) : null;
  }

  private constructor(private readonly gl: WebGLRenderingContext, sheet: SoftSheet) {
    this.program = this.buildProgram();
    gl.useProgram(this.program);
    for (const name of ['lean', 'faceA', 'faceB', 'fade', 'overScale']) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
    gl.uniform1f(this.uniforms.overScale, OVER);
    gl.uniform1i(this.uniforms.faceA, 0);
    gl.uniform1i(this.uniforms.faceB, 1);

    const restBuffer = this.makeBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sheet.restUv, gl.STATIC_DRAW);
    this.bindAttribute('a', 2, 0, 0);

    this.dynamicBuffer = this.makeBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.DYNAMIC_DRAW);
    this.bindAttribute('d', 2, 12, 0);
    this.bindAttribute('s', 1, 12, 8);

    const indexBuffer = this.makeBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sheet.triangles, gl.STATIC_DRAW);
    this.indexCount = sheet.triangles.length;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  }

  has(face: FaceName): boolean {
    return this.textures.has(face);
  }

  upload(face: FaceName, image: HTMLImageElement): void {
    const {gl} = this;
    const texture = gl.createTexture();
    if (!texture) return;
    gl.activeTexture(gl.TEXTURE5); // a spare unit, so uploads never disturb the two faces being drawn
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.textures.set(face, texture);
  }

  resize(canvas: HTMLCanvasElement): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const box = canvas.getBoundingClientRect();
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  draw(sheet: SoftSheet, from: FaceName, to: FaceName, fade: number, leanX: number, leanY: number): void {
    const {gl} = this;
    sheet.writeVertices(this.vertexData);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.get(from) ?? this.textures.get('rest') ?? null);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.get(to) ?? this.textures.get('rest') ?? null);
    gl.uniform1f(this.uniforms.fade, Math.min(1, Math.max(0, fade)));
    gl.uniform2f(this.uniforms.lean, leanX, leanY);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  dispose(): void {
    const {gl} = this;
    this.textures.forEach((texture) => gl.deleteTexture(texture));
    this.textures.clear();
    this.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    gl.deleteProgram(this.program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  private makeBuffer(): WebGLBuffer {
    const buffer = this.gl.createBuffer()!;
    this.buffers.push(buffer);
    return buffer;
  }

  private bindAttribute(name: string, size: number, stride: number, offset: number): void {
    const {gl} = this;
    const location = gl.getAttribLocation(this.program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
  }

  private buildProgram(): WebGLProgram {
    const {gl} = this;
    const program = gl.createProgram()!;
    gl.attachShader(program, this.compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    return program;
  }

  private compile(type: number, source: string): WebGLShader {
    const {gl} = this;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
    return shader;
  }
}
