/**
 * The mycelium field.
 *
 * A GPGPU particle system advected through a curl-noise flow, accumulated into
 * a ping-ponged trail buffer so each particle leaves a filament behind it. The
 * result reads as hyphae colonising substrate — which is the one "otherworldly"
 * register this brand can occupy without straying into the psychedelic imagery
 * its guidelines explicitly forbid.
 *
 * Three passes per frame:
 *   1. sim      — advect positions in a float RT (ping-pong)
 *   2. trail    — fade the previous trail buffer, draw points additively on top
 *   3. composite— grade the accumulated luminance through the brand green ramp
 */

import {
  WebGLRenderer, Scene, OrthographicCamera, Mesh, Points, PlaneGeometry,
  BufferGeometry, BufferAttribute, ShaderMaterial, RawShaderMaterial,
  WebGLRenderTarget, DataTexture, RGBAFormat, FloatType, HalfFloatType,
  NearestFilter, LinearFilter, AdditiveBlending, NoBlending, Vector2, Vector3,
  ClampToEdgeWrapping,
} from 'three';
import { simplex3d, curl } from './noise.glsl.js';

const QUAD_VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const SIM_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uPos;
  uniform sampler2D uSeed;
  uniform float uTime;
  uniform float uDelta;
  uniform float uCurlScale;
  uniform float uSpeed;
  uniform float uLife;
  uniform float uRise;
  uniform vec3  uPointer;      // xy in field space, z = strength
  uniform float uAspect;
  uniform float uSpread;
  varying vec2 vUv;

  ${simplex3d}
  ${curl}

  void main(){
    vec4 data = texture2D(uPos, vUv);
    vec3 pos = data.xyz;
    float life = data.w;
    vec4 seed = texture2D(uSeed, vUv);

    life -= uDelta * (0.09 + seed.w * 0.14) * uLife;

    if (life <= 0.0) {
      // respawn on the seed lattice, jittered along the flow so the field
      // never visibly repopulates in a grid
      vec3 s = seed.xyz * 2.0 - 1.0;
      pos = vec3(s.x * uAspect * uSpread, s.y * uSpread, s.z * 0.65);
      pos += curlNoise(pos * 0.6 + uTime * 0.02) * 0.12;
      life = 1.0;
    } else {
      vec3 flow = curlNoise(pos * uCurlScale + vec3(0.0, 0.0, uTime * 0.06));
      // hyphae grow outward and up; the vertical bias keeps the field from
      // settling into a static swirl
      flow.y += uRise;
      flow.x *= 1.22;

      // pointer acts as a spore drop: a soft local attractor
      vec2 d = uPointer.xy - pos.xy;
      float dist = length(d);
      float pull = uPointer.z * exp(-dist * dist * 5.5);
      flow.xy += normalize(d + 1e-5) * pull * 2.4;

      float speed = uSpeed * (0.55 + seed.w * 0.85);
      pos += flow * speed * uDelta;
    }

    gl_FragColor = vec4(pos, life);
  }
`;

const POINT_VERT = /* glsl */ `
  precision highp float;
  attribute vec2 reference;
  attribute float aRand;
  uniform sampler2D uPos;
  uniform float uPointSize;
  uniform float uAspect;
  uniform float uSpread;
  uniform float uDpr;
  varying float vLife;
  varying float vDepth;
  varying float vRand;

  void main(){
    vec4 data = texture2D(uPos, reference);
    vec3 pos = data.xyz;
    vLife = data.w;
    vRand = aRand;

    // gentle perspective: z pushes points toward the centre and shrinks them
    float persp = 1.0 / (1.0 + pos.z * 0.42);
    vDepth = persp;

    vec2 ndc = vec2(pos.x / (uAspect * uSpread), pos.y / uSpread) * persp;
    gl_Position = vec4(ndc, 0.0, 1.0);
    gl_PointSize = uPointSize * uDpr * persp * (0.45 + aRand * 0.9);
  }
`;

const POINT_FRAG = /* glsl */ `
  precision highp float;
  uniform float uIntensity;
  varying float vLife;
  varying float vDepth;
  varying float vRand;

  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float soft = smoothstep(0.25, 0.0, d);

    // fade in on birth and out on death so filaments taper at both ends
    float env = smoothstep(0.0, 0.16, vLife) * smoothstep(0.0, 0.42, 1.0 - vLife);
    float a = soft * env * uIntensity * (0.35 + vDepth * 0.65);

    // g carries "age" so the composite can tint young tips differently
    gl_FragColor = vec4(a, a * (0.35 + vRand * 0.65), a * vLife, 1.0);
  }
`;

const FADE_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uFade;
  uniform vec2 uDrift;
  varying vec2 vUv;
  void main(){
    // sampling with a sub-pixel drift smears the trail slightly outward,
    // which is what gives the filaments their soft branching bloom
    vec4 c = texture2D(uTex, (vUv - 0.5) * 0.9994 + 0.5 + uDrift);
    gl_FragColor = c * uFade;
  }
`;

const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uExposure;
  uniform float uVignette;
  uniform vec3 uColdest;
  uniform vec3 uMid;
  uniform vec3 uHot;
  uniform vec3 uPeak;
  varying vec2 vUv;

  void main(){
    vec4 t = texture2D(uTex, vUv);
    float e = t.r * uExposure;

    // brand green ramp, always stepped through in order
    vec3 col = mix(uColdest, uMid,  smoothstep(0.0,  0.30, e));
    col      = mix(col,      uHot,  smoothstep(0.26, 0.72, e));
    col      = mix(col,      uPeak, smoothstep(0.68, 1.35, e));

    float lum = clamp(e, 0.0, 1.6);
    col *= smoothstep(0.0, 0.10, lum);

    // vignette pulls the eye to centre and keeps the 60% ground truly dark
    vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    col *= 1.0 - uVignette * smoothstep(0.28, 0.95, length(p));

    // dither to defeat banding across the very dark end of the ramp
    float n = fract(sin(dot(vUv * uRes + uTime, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) * 0.006;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`;

/**
 * The shared ortho camera sits at the near plane, so anything at z=0 is right
 * on the frustum boundary and three will happily cull it. Nothing in this file
 * needs culling — every object is either a fullscreen quad or a point cloud
 * whose positions live in a texture rather than in the geometry's bounds.
 */
const noCull = (obj) => { obj.frustumCulled = false; return obj; };

const hexToVec3 = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  // approximate sRGB -> linear so the ramp mixes the way the eye expects
  const f = (v) => Math.pow(v / 255, 2.2);
  return new Vector3(f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255));
};

export class MyceliumField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ok = false;

    try {
      this.renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
      });
    } catch (e) {
      return;
    }
    if (!this.renderer.capabilities.isWebGL2) {
      // the float ping-pong needs WebGL2; the CSS fallback covers the rest
      this.renderer.dispose?.();
      return;
    }

    const gl = this.renderer.getContext();
    const half = gl.getExtension('EXT_color_buffer_half_float') || gl.getExtension('EXT_color_buffer_float');
    if (!half) { this.renderer.dispose(); return; }

    this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    // innerWidth can be 0 in a hidden/zero-size frame; treat that as desktop
    this.mobile = window.innerWidth > 0 && window.innerWidth <= 820;
    this.SIZE = this.mobile ? 192 : 384;              // SIZE² particles
    this.trailScale = this.mobile ? 0.6 : 0.8;

    this.renderer.setPixelRatio(1);                    // RTs carry their own scale
    this.renderer.autoClear = false;

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.time = 0;
    this.pointer = new Vector3(0, 0, 0);
    this.pointerTarget = new Vector2(0, 0);
    this.pointerPulse = 0;
    // the attractor stays off until the pointer actually moves — left on with a
    // static pointer it just pulls the whole field into one bright clump
    this.pointerEngaged = 0;
    this.aspect = 1;
    this.running = false;
    this.quality = 1;

    /**
     * Calibrated against the 60/30/10 rule: the accumulated field has to stay
     * dark enough that Soil Black still reads as the ground and the lime only
     * appears at filament cores. Equilibrium brightness is roughly
     * intensity / (1 - fade), so those two move together.
     */
    this.uniformsState = {
      curlScale: 1.15,
      speed: 0.28,
      life: 1.0,
      rise: 0.26,
      fade: 0.960,
      pointSize: 1.6,
      intensity: 0.105,
      exposure: 1.05,
      vignette: 0.78,
      spread: 1.0,
      drift: 0.00018,
    };

    this._buildSim();
    this._buildPoints();
    this._buildTrail();
    this._buildComposite();
    this.resize();
    this.ok = true;
  }

  // -------------------------------------------------------------- sim pass
  _buildSim() {
    const N = this.SIZE;
    const total = N * N;

    const seed = new Float32Array(total * 4);
    const pos = new Float32Array(total * 4);
    for (let i = 0; i < total; i++) {
      const i4 = i * 4;
      seed[i4] = Math.random();
      seed[i4 + 1] = Math.random();
      seed[i4 + 2] = Math.random();
      seed[i4 + 3] = Math.random();
      pos[i4] = (Math.random() * 2 - 1) * 1.6;
      pos[i4 + 1] = (Math.random() * 2 - 1);
      pos[i4 + 2] = (Math.random() * 2 - 1) * 0.65;
      pos[i4 + 3] = Math.random();          // staggered life so nothing pulses
    }

    const mk = (data) => {
      const t = new DataTexture(data, N, N, RGBAFormat, FloatType);
      t.minFilter = t.magFilter = NearestFilter;
      t.wrapS = t.wrapT = ClampToEdgeWrapping;
      t.needsUpdate = true;
      return t;
    };
    this.seedTex = mk(seed);
    this.initTex = mk(pos);

    const opts = {
      type: HalfFloatType, format: RGBAFormat,
      minFilter: NearestFilter, magFilter: NearestFilter,
      depthBuffer: false, stencilBuffer: false,
    };
    this.simRT = [new WebGLRenderTarget(N, N, opts), new WebGLRenderTarget(N, N, opts)];
    this.simIndex = 0;

    this.simMat = new RawShaderMaterial({
      uniforms: {
        uPos: { value: this.initTex },
        uSeed: { value: this.seedTex },
        uTime: { value: 0 },
        uDelta: { value: 0.016 },
        uCurlScale: { value: 0.85 },
        uSpeed: { value: 0.3 },
        uLife: { value: 1 },
        uRise: { value: 0.3 },
        uPointer: { value: this.pointer },
        uAspect: { value: 1 },
        uSpread: { value: 1 },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: SIM_FRAG,
      depthTest: false, depthWrite: false,
    });

    this.simScene = new Scene();
    this.simScene.add(noCull(new Mesh(new PlaneGeometry(2, 2), this.simMat)));

    // prime both targets so frame one has valid data
    for (let i = 0; i < 2; i++) {
      this.renderer.setRenderTarget(this.simRT[i]);
      this.renderer.render(this.simScene, this.camera);
    }
    this.renderer.setRenderTarget(null);
  }

  // ----------------------------------------------------------- point cloud
  _buildPoints() {
    const N = this.SIZE;
    const total = N * N;
    const ref = new Float32Array(total * 2);
    const rand = new Float32Array(total);
    const pos = new Float32Array(total * 3);
    for (let i = 0; i < total; i++) {
      ref[i * 2] = (i % N) / N + 0.5 / N;
      ref[i * 2 + 1] = Math.floor(i / N) / N + 0.5 / N;
      rand[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('reference', new BufferAttribute(ref, 2));
    g.setAttribute('aRand', new BufferAttribute(rand, 1));

    this.pointMat = new RawShaderMaterial({
      uniforms: {
        uPos: { value: null },
        uPointSize: { value: 1.9 },
        uAspect: { value: 1 },
        uSpread: { value: 1 },
        uDpr: { value: this.dpr * this.trailScale },
        uIntensity: { value: 0.3 },
      },
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    this.pointScene = new Scene();
    this.pointScene.add(noCull(new Points(g, this.pointMat)));
  }

  // ---------------------------------------------------------- trail buffer
  _buildTrail() {
    const opts = {
      type: HalfFloatType, format: RGBAFormat,
      minFilter: LinearFilter, magFilter: LinearFilter,
      depthBuffer: false, stencilBuffer: false,
    };
    this.trailRT = [new WebGLRenderTarget(2, 2, opts), new WebGLRenderTarget(2, 2, opts)];
    this.trailIndex = 0;

    this.fadeMat = new RawShaderMaterial({
      uniforms: {
        uTex: { value: null },
        uFade: { value: 0.955 },
        uDrift: { value: new Vector2(0, 0) },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: FADE_FRAG,
      depthTest: false, depthWrite: false, blending: NoBlending,
    });
    this.fadeScene = new Scene();
    this.fadeScene.add(noCull(new Mesh(new PlaneGeometry(2, 2), this.fadeMat)));
  }

  // ------------------------------------------------------------- composite
  _buildComposite() {
    this.compMat = new RawShaderMaterial({
      uniforms: {
        uTex: { value: null },
        uRes: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
        uExposure: { value: 1.0 },
        uVignette: { value: 0.72 },
        uColdest: { value: hexToVec3('#04120b') },
        uMid: { value: hexToVec3('#00301a') },
        uHot: { value: hexToVec3('#1e7a38') },
        uPeak: { value: hexToVec3('#a4dd3a') },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: COMPOSITE_FRAG,
      depthTest: false, depthWrite: false, blending: NoBlending,
    });
    this.compScene = new Scene();
    this.compScene.add(noCull(new Mesh(new PlaneGeometry(2, 2), this.compMat)));
  }

  // ------------------------------------------------------------------ api
  resize() {
    if (!this.ok && !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.aspect = w / h;
    this.renderer.setSize(w, h, false);

    const tw = Math.max(2, Math.round(w * this.dpr * this.trailScale * this.quality));
    const th = Math.max(2, Math.round(h * this.dpr * this.trailScale * this.quality));
    this.trailRT.forEach((rt) => rt.setSize(tw, th));
    this.compMat.uniforms.uRes.value.set(tw, th);
    this.pointMat.uniforms.uAspect.value = this.aspect;
    this.simMat.uniforms.uAspect.value = this.aspect;
    this._clearTrails();
  }

  _clearTrails() {
    this.trailRT.forEach((rt) => {
      this.renderer.setRenderTarget(rt);
      this.renderer.clear(true, false, false);
    });
    this.renderer.setRenderTarget(null);
  }

  setPointer(x, y) {
    this.pointerTarget.set(x, y);
    this.pointerEngaged = 1;
  }
  pulse(strength = 1) { this.pointerPulse = strength; }

  /** Scroll-driven scene states are tweened straight into this object by GSAP. */
  get state() { return this.uniformsState; }

  setQuality(q) {
    if (q === this.quality) return;
    this.quality = q;
    this.resize();
  }

  render(dt) {
    if (!this.ok) return;
    const s = this.uniformsState;
    this.time += dt;

    // pointer easing + decay of the click pulse
    this.pointer.x += (this.pointerTarget.x * this.aspect - this.pointer.x) * 0.06;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.06;
    this.pointerPulse *= 0.94;
    this.pointer.z = (0.10 + this.pointerPulse * 1.5) * this.pointerEngaged;

    // 1 — simulate
    const su = this.simMat.uniforms;
    su.uPos.value = this.simRT[this.simIndex].texture;
    su.uTime.value = this.time;
    su.uDelta.value = dt;
    su.uCurlScale.value = s.curlScale;
    su.uSpeed.value = s.speed;
    su.uLife.value = s.life;
    su.uRise.value = s.rise;
    su.uSpread.value = s.spread;
    const nextSim = 1 - this.simIndex;
    this.renderer.setRenderTarget(this.simRT[nextSim]);
    this.renderer.render(this.simScene, this.camera);
    this.simIndex = nextSim;

    // 2 — fade the old trail into the new buffer, then stamp the points
    const nextTrail = 1 - this.trailIndex;
    this.fadeMat.uniforms.uTex.value = this.trailRT[this.trailIndex].texture;
    this.fadeMat.uniforms.uFade.value = s.fade;
    this.fadeMat.uniforms.uDrift.value.set(0, s.drift);
    this.renderer.setRenderTarget(this.trailRT[nextTrail]);
    this.renderer.render(this.fadeScene, this.camera);

    const pu = this.pointMat.uniforms;
    pu.uPos.value = this.simRT[this.simIndex].texture;
    pu.uPointSize.value = s.pointSize;
    pu.uSpread.value = s.spread;
    pu.uIntensity.value = s.intensity;
    this.renderer.render(this.pointScene, this.camera);
    this.trailIndex = nextTrail;

    // 3 — grade and present
    this.compMat.uniforms.uTex.value = this.trailRT[this.trailIndex].texture;
    this.compMat.uniforms.uTime.value = this.time;
    this.compMat.uniforms.uExposure.value = s.exposure;
    this.compMat.uniforms.uVignette.value = s.vignette;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.compScene, this.camera);
  }

  dispose() {
    if (!this.renderer) return;
    this.simRT?.forEach((rt) => rt.dispose());
    this.trailRT?.forEach((rt) => rt.dispose());
    this.renderer.dispose();
  }
}
