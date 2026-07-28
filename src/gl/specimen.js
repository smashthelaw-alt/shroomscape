/**
 * Specimen viewer — the varieties stage.
 *
 * A single quad that cross-dissolves between two mushroom textures through a
 * noise-driven displacement, with a spore-drift overlay and a lime rim term
 * derived from the image's own alpha/luminance edge. Transitions read as one
 * specimen dissolving into spores and reforming as the next.
 */

import {
  WebGLRenderer, Scene, OrthographicCamera, Mesh, PlaneGeometry,
  ShaderMaterial, TextureLoader, Vector2, Vector3, SRGBColorSpace, LinearFilter,
} from 'three';
import { simplex3d } from './noise.glsl.js';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform vec2 uFromSize;
  uniform vec2 uToSize;
  uniform vec2 uRes;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uHover;
  uniform vec3 uLime;
  varying vec2 vUv;

  ${simplex3d}

  // contain-fit a texture of aspect ts into the quad without distortion
  vec2 fitUv(vec2 uv, vec2 ts, vec2 res){
    float ta = ts.x / ts.y;
    float ra = res.x / res.y;
    vec2 scale = ta > ra ? vec2(1.0, ra / ta) : vec2(ta / ra, 1.0);
    return (uv - 0.5) / scale + 0.5;
  }

  vec4 sampleFit(sampler2D tex, vec2 uv, vec2 ts){
    vec2 t = fitUv(uv, ts, uRes);
    if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return vec4(0.0);
    return texture2D(tex, t);
  }

  void main(){
    vec2 uv = vUv;

    // pointer parallax — a shallow tilt, never enough to read as a gimmick
    vec2 par = (uPointer - 0.5) * 0.035 * uHover;
    uv -= par;

    // slow breathing so the specimen never sits perfectly still
    float breathe = snoise(vec3(uv * 2.2, uTime * 0.16)) * 0.004;
    uv += breathe;

    // dissolve field, remapped to 0..1 so the threshold sweep is predictable.
    // Weighted toward the high-frequency term: a coarse field dissolves the
    // whole frame at once and reads as blobs rather than as spores.
    float n  = snoise(vec3(uv * 10.0, uTime * 0.35));
    float n2 = snoise(vec3(uv * 34.0, uTime * 0.8));
    float field = clamp((n * 0.40 + n2 * 0.60) * 0.5 + 0.5, 0.0, 1.0);

    // uProgress: 0 = fully FROM, 1 = fully TO. The threshold overshoots both
    // ends so that at rest (p == 1) no part of the frame sits mid-dissolve —
    // otherwise the spore seam below stays lit on a static specimen.
    const float BAND = 0.15;
    float th = uProgress * (1.0 + 2.0 * BAND) - BAND;
    float mFrom = 1.0 - smoothstep(th - BAND, th + BAND, field);

    // each layer drifts away from centre as it dissolves
    vec2 dir = normalize(uv - 0.5 + 1e-5);
    vec2 dispOut = dir * (1.0 - mFrom) * 0.09;
    vec2 dispIn  = -dir * mFrom * 0.09;

    vec4 a = sampleFit(uFrom, uv + dispOut, uFromSize);
    vec4 b = sampleFit(uTo,   uv + dispIn,  uToSize);

    vec4 col = a * mFrom + b * (1.0 - mFrom);

    // spore band: a lime seam that lives only on the travelling dissolve front,
    // and is gated to zero whenever the transition is parked at either end
    float gate = smoothstep(0.0, 0.06, uProgress) * smoothstep(0.0, 0.06, 1.0 - uProgress);
    float seam = mFrom * (1.0 - mFrom) * 4.0 * gate;
    float grains = smoothstep(0.55, 1.0, snoise(vec3(uv * 60.0, uTime * 1.4)));
    // lime is punctuation, not paint — even mid-transition it stays a fine seam
    col.rgb += uLime * seam * (0.10 + grains * 0.55);
    col.a = max(col.a, seam * (0.10 + grains * 0.40));

    gl_FragColor = col;
  }
`;

export class SpecimenViewer {
  constructor(canvas, ids) {
    this.canvas = canvas;
    this.ok = false;
    this.current = 0;
    this.progress = 0;

    try {
      this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return; }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearAlpha(0);

    const loader = new TextureLoader();
    this.sizes = ids.map(() => new Vector2(1, 1));
    this.textures = ids.map((id, i) => {
      const t = loader.load(`/assets/tiles/${id}.webp`, (tex) => {
        if (tex.image) this.sizes[i].set(tex.image.width, tex.image.height);
      });
      t.colorSpace = SRGBColorSpace;
      t.minFilter = t.magFilter = LinearFilter;
      t.generateMipmaps = false;
      return t;
    });

    this.mat = new ShaderMaterial({
      uniforms: {
        uFrom: { value: this.textures[0] },
        uTo: { value: this.textures[0] },
        uFromSize: { value: this.sizes[0] },
        uToSize: { value: this.sizes[0] },
        uRes: { value: new Vector2(1, 1) },
        uProgress: { value: 1 },
        uTime: { value: 0 },
        uPointer: { value: new Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        // Shroom Lime #7CC825 — must be a real Vector3; three uploads a plain
        // object down the wrong path and the draw call fails with 1282
        uLime: { value: new Vector3(0.487, 0.784, 0.145) },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.scene = new Scene();
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
    const quad = new Mesh(new PlaneGeometry(1, 1), this.mat);
    // the quad sits exactly on the camera plane, which puts it on the frustum
    // boundary — three culls it unless we opt out
    quad.frustumCulled = false;
    this.scene.add(quad);

    this.pointerTarget = new Vector2(0.5, 0.5);
    this.hoverTarget = 0;
    this.time = 0;
    this.ok = true;
    this.resize();
  }

  resize() {
    if (!this.ok) return;
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    this.renderer.setSize(w, h, false);
    this.mat.uniforms.uRes.value.set(w, h);
  }

  setPointer(x, y) { this.pointerTarget.set(x, y); }
  setHover(v) { this.hoverTarget = v; }

  /** Kick a transition. The returned uniform is tweened 0 -> 1 by the caller. */
  beginTransition(toIndex) {
    if (!this.ok || toIndex === this.current) return null;
    this.mat.uniforms.uFrom.value = this.textures[this.current];
    this.mat.uniforms.uFromSize.value = this.sizes[this.current];
    this.mat.uniforms.uTo.value = this.textures[toIndex];
    this.mat.uniforms.uToSize.value = this.sizes[toIndex];
    this.mat.uniforms.uProgress.value = 0;
    this.current = toIndex;
    return this.mat.uniforms.uProgress;
  }

  render(dt) {
    if (!this.ok) return;
    this.time += dt;
    const u = this.mat.uniforms;
    u.uTime.value = this.time;
    u.uPointer.value.lerp(this.pointerTarget, 0.07);
    u.uHover.value += (this.hoverTarget - u.uHover.value) * 0.08;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (!this.ok) return;
    this.textures.forEach((t) => t.dispose());
    this.renderer.dispose();
  }
}
