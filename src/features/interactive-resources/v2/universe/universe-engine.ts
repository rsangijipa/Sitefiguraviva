import {
  ACESFilmicToneMapping, AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CircleGeometry, Color, CylinderGeometry,
  DirectionalLight, DodecahedronGeometry, DoubleSide, FogExp2, Group, HemisphereLight, IcosahedronGeometry, InstancedMesh, Material,
  Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry,
  Points, PointsMaterial, Raycaster, RepeatWrapping, Scene, ShaderMaterial, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector2,
  Vector3, WebGLRenderer, type Texture,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { UniverseConfig } from "./universe-scenes";

export interface UniverseOptions { lowStim: boolean; autoOrbit: boolean }
export interface UniverseHandle {
  setOptions(next: UniverseOptions): void;
  setActive(index: number): void;
  dispose(): void;
}
export interface UniverseEvents { onPick(index: number): void; onFailure(error: unknown): void }

type V3 = [number, number, number];

/** Detecta WebGL sem criar contexto duradouro (jsdom e navegadores sem GPU retornam false). */
export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch { return false; }
}

const WATER_VERTEX = `uniform float uTime; varying vec2 vUv; void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*2.7+uTime*1.3)*.035+sin(p.y*4.-uTime*1.2)*.03;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const WATER_FRAGMENT = `uniform float uTime;uniform vec3 uC1;uniform vec3 uC2;varying vec2 vUv;
void main(){float wave=sin(vUv.x*63.+uTime*1.4)*sin(vUv.y*49.-uTime*1.5);float sh=.48+.24*sin(vUv.y*23.+uTime*.7);vec3 c=mix(uC1,uC2,clamp(sh+wave*.12,0.,1.));float glint=pow(max(sin(vUv.x*170.-uTime*2.)*sin(vUv.y*125.+uTime*2.),0.),18.);c+=vec3(.7,.72,.48)*glint*.22;gl_FragColor=vec4(c,.86);}`;

/**
 * Motor Three.js dos Universos Terapêuticos (portado do pacote HTML). Cada cena é montada uma vez
 * e todos os recursos GPU são liberados em dispose(). Os pontos luminosos são convites, não alvos de pontuação.
 */
export function createUniverse(container: HTMLElement, config: UniverseConfig, options: UniverseOptions, events: UniverseEvents): UniverseHandle {
  const kind = config.kind;
  const observatory = kind === "observatory";
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T): T => { disposables.push(item); return item; };

  const width = () => Math.max(1, container.clientWidth);
  const height = () => Math.max(1, container.clientHeight);

  const scene = new Scene();
  scene.background = new Color(observatory ? 0x18273b : 0x849f87);
  scene.fog = new FogExp2(observatory ? 0x20263e : 0x93a99a, .012);
  const camera = new PerspectiveCamera(47, width() / height(), .1, 180);
  camera.position.set(10, 9, 16);
  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setSize(width(), height());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .055;
  controls.minDistance = 4; controls.maxDistance = 32; controls.maxPolarAngle = Math.PI * .48;
  controls.target.set(0, observatory ? 5.8 : 1.5, 0);
  if (observatory) camera.position.set(9, 12, 17);
  controls.update();

  // Intensidades ajustadas para a iluminação física do three recente (o HTML usava o modo legado).
  const hemi = new HemisphereLight(0xfff5df, 0x364e3b, 2.6); scene.add(hemi);
  const sun = new DirectionalLight(observatory ? 0xb9d7ff : 0xffdfad, 4.2);
  sun.position.set(-9, 21, 11); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24 }); sun.shadow.bias = -.00045; scene.add(sun);
  const bounce = new DirectionalLight(0xb9e7d1, .6); bounce.position.set(9, 8, -9); scene.add(bounce);

  // Semente fixa: a paisagem é a mesma a cada visita.
  let seed = 1892944;
  const rng = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

  const texture = (base: string, ink: string, repeat = 2): Texture => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 512;
    const cx = cv.getContext("2d");
    if (cx) {
      cx.fillStyle = base; cx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 15000; i++) { cx.fillStyle = ink; cx.globalAlpha = .02 + rng() * .08; cx.fillRect(rng() * 512, rng() * 512, 1 + rng() * 6, 1 + rng() * 2); }
      cx.globalAlpha = 1;
    }
    const tx = track(new CanvasTexture(cv)); tx.colorSpace = SRGBColorSpace; tx.wrapS = tx.wrapT = RepeatWrapping; tx.repeat.set(repeat, repeat);
    tx.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return tx;
  };
  const tWood = texture("#72523a", "#342217", 3), tSoil = texture("#72745e", "#293a28", 8), tStone = texture("#8e8479", "#46392e", 2), tPaper = texture("#caba9e", "#665747", 2);
  const mat = {
    wood: track(new MeshStandardMaterial({ map: tWood, roughness: .86 })),
    soil: track(new MeshStandardMaterial({ map: tSoil, bumpMap: tSoil, bumpScale: .07, roughness: .99 })),
    stone: track(new MeshStandardMaterial({ map: tStone, bumpMap: tStone, bumpScale: .08, roughness: .89 })),
    paper: track(new MeshStandardMaterial({ map: tPaper, roughness: .83 })),
    leaf: track(new MeshStandardMaterial({ color: 0x31563c, roughness: .85, side: DoubleSide })),
    mint: track(new MeshStandardMaterial({ color: 0x6b936a, roughness: .83 })),
    gold: track(new MeshStandardMaterial({ color: 0xddb879, metalness: .46, roughness: .34 })),
    glass: track(new MeshPhysicalMaterial({ color: 0xaed8d0, transparent: true, opacity: .68, metalness: .1, roughness: .13, clearcoat: 1 })),
    light: track(new MeshStandardMaterial({ color: 0xffe4aa, emissive: 0xff9b42, emissiveIntensity: 1.25 })),
    cloth: track(new MeshStandardMaterial({ color: 0xba8d83, roughness: 1 })),
    petal: track(new MeshStandardMaterial({ color: 0xea9eb4, roughness: .8, side: DoubleSide })),
  };

  const mesh = (geo: BufferGeometry, material: Material, pos: V3, parent: Object3D = scene) => {
    track(geo); const m = new Mesh(geo, material); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const sphere = (r: number, material: Material, pos: V3, parent: Object3D = scene, detail = 1) => mesh(new DodecahedronGeometry(r, detail), material, pos, parent);
  const slab = (a: number, b: number, c: number, material: Material, pos: V3, parent: Object3D = scene) => mesh(new BoxGeometry(a, b, c), material, pos, parent);
  const cyl = (rt: number, rb: number, h: number, material: Material, pos: V3, parent: Object3D = scene, sides = 10) => mesh(new CylinderGeometry(rt, rb, h, sides), material, pos, parent);

  const groundHeight = (x: number, z: number) => {
    let h = Math.sin(x * .19) * .35 + Math.cos(z * .23) * .25 + Math.sin((x + z) * .43) * .13;
    const r = Math.hypot(x, z);
    if (["garden", "bridge", "island"].includes(kind) && r < 7) h *= Math.min(1, Math.max(0, (r - 4) / 3));
    return h;
  };
  const land = new PlaneGeometry(90, 90, 120, 120); land.rotateX(-Math.PI / 2);
  const lp = land.attributes.position;
  for (let i = 0; i < lp.count; i++) lp.setY(i, groundHeight(lp.getX(i), lp.getZ(i)) - .16);
  land.computeVertexNormals(); mesh(land, mat.soil, [0, 0, 0]);

  const dummy = new Object3D();
  const stoneInst = new InstancedMesh(track(new DodecahedronGeometry(.15, 0)), mat.stone, 420);
  stoneInst.castShadow = true; stoneInst.receiveShadow = true;
  for (let i = 0; i < 420; i++) {
    const x = (rng() - .5) * 44, z = (rng() - .5) * 44;
    dummy.position.set(x, groundHeight(x, z) + .03, z); dummy.rotation.set(rng(), rng() * 6.28, rng());
    dummy.scale.set(.4 + rng() * 2, .22 + rng() * .7, .4 + rng() * 1.8); dummy.updateMatrix(); stoneInst.setMatrixAt(i, dummy.matrix);
  }
  stoneInst.instanceMatrix.needsUpdate = true; scene.add(stoneInst);

  const flowers = new Group(); scene.add(flowers);
  const floral: { f: Group; phase: number }[] = [];
  for (let k = 0; k < 180; k++) {
    const x = (rng() - .5) * 40, z = (rng() - .5) * 40, r = Math.hypot(x, z);
    if (r < 5 || r > 23) continue;
    const f = new Group(); f.position.set(x, groundHeight(x, z), z); f.scale.setScalar(.5 + rng() * .8);
    cyl(.014, .024, .37, mat.mint, [0, .19, 0], f, 5);
    sphere(.11, k % 4 === 0 ? mat.gold : k % 3 === 0 ? mat.petal : mat.paper, [0, .41, 0], f, 0);
    flowers.add(f); floral.push({ f, phase: k * .7 });
  }

  const tree = (x: number, z: number, scale = 1) => {
    const g = new Group(); g.position.set(x, groundHeight(x, z), z); g.scale.setScalar(scale); scene.add(g);
    cyl(.19, .40, 4.6, mat.wood, [0, 2.3, 0], g, 10);
    for (let k = 0; k < 9; k++) {
      const ang = k * 2.4; const b = cyl(.055, .14, 2.3, mat.wood, [Math.sin(ang) * .7, 4.35 + (k % 3) * .25, Math.cos(ang) * .7], g, 7);
      b.rotation.z = Math.sin(ang) * .66; b.rotation.x = Math.cos(ang) * -.66;
    }
    const crown = new InstancedMesh(track(new DodecahedronGeometry(.48, 0)), mat.leaf, 65);
    crown.castShadow = true; crown.receiveShadow = true;
    const leafDummy = new Object3D(), leafColor = new Color();
    for (let k = 0; k < 65; k++) {
      const a = k * 2.39996, r = Math.sqrt(k / 65) * 2.45, yy = 5.1 + Math.sin(k * 2.2) * .55;
      leafDummy.position.set(Math.cos(a) * r, yy, Math.sin(a) * r); leafDummy.rotation.set(k * .35, k * .43, 0);
      const sc = .85 + (k % 5) * .09; leafDummy.scale.set(sc, sc * .72, sc); leafDummy.updateMatrix();
      crown.setMatrixAt(k, leafDummy.matrix); leafColor.setHSL(.28 + (k % 3) * .011, .3, .26 + (k % 5) * .03); crown.setColorAt(k, leafColor);
    }
    crown.instanceMatrix.needsUpdate = true; if (crown.instanceColor) crown.instanceColor.needsUpdate = true; g.add(crown);
    return g;
  };
  for (let i = 0; i < 25; i++) {
    const a = i * 2.39996, r = 16 + (i % 5) * 2.25;
    if (observatory && i % 2) continue;
    tree(Math.cos(a) * r, Math.sin(a) * r, .65 + (i % 4) * .25);
  }

  const waterMat = track(new ShaderMaterial({
    transparent: true, depthWrite: false, side: DoubleSide,
    uniforms: { uTime: { value: 0 }, uC1: { value: new Color(0x2f817e) }, uC2: { value: new Color(0xb4d2c0) } },
    vertexShader: WATER_VERTEX, fragmentShader: WATER_FRAGMENT,
  }));
  const pond = (x: number, z: number, r: number) => {
    mesh(new CylinderGeometry(r * 1.05, r * 1.04, .26, 64), mat.stone, [x, .02, z]);
    const w = mesh(new CircleGeometry(r, 90), waterMat, [x, .175, z]); w.rotation.x = -Math.PI / 2;
    for (let k = 0; k < 18; k++) { const ang = k * 2.39996, rr = r * .93; sphere(.23 + (k % 4) * .075, mat.stone, [x + Math.cos(ang) * rr, .22, z + Math.sin(ang) * rr], scene, 1); }
    for (let i = 0; i < 7; i++) { const ang = i * 2.4; const l = mesh(new CircleGeometry(.34, 24), mat.leaf, [x + Math.cos(ang) * r * .55, .19, z + Math.sin(ang) * r * .55]); l.rotation.x = -Math.PI / 2; }
  };
  const lantern = (pos: V3, parent: Object3D = scene) => { cyl(.23, .28, .38, mat.gold, pos, parent, 8); sphere(.2, mat.light, pos, parent, 0); };
  const cushion = (x: number, z: number, c: Material = mat.cloth) => mesh(new CylinderGeometry(.55, .58, .22, 26), c, [x, .26, z]);
  const bench = (x: number, z: number, r = 0) => {
    const g = new Group(); g.position.set(x, 0, z); g.rotation.y = r; scene.add(g);
    slab(1.8, .19, .65, mat.wood, [0, .84, 0], g);
    for (const xx of [-.7, .7]) for (const zz of [-.22, .22]) cyl(.075, .08, .75, mat.wood, [xx, .4, zz], g);
  };

  const buildBridge = () => {
    pond(0, 0, 5.7);
    const g = new Group(); g.position.set(0, .46, 0); scene.add(g);
    for (let i = 0; i < 30; i++) slab(.38, .15, 2.9, mat.wood, [-6.1 + i * .42, .7 + Math.sin(i / 29 * Math.PI), 0], g);
    for (const z of [-1.32, 1.32]) for (let i = 0; i < 8; i++) cyl(.07, .10, 1.2, mat.wood, [-6 + i * 1.7, .7 + Math.sin(i / 7 * Math.PI) + .62, z], g);
    for (const x of [-5.9, 5.9]) for (const z of [-1.3, 1.3]) lantern([x, 2.0, z], g);
  };
  const buildHouse = () => {
    const g = new Group(); g.position.set(0, .13, -1.2); scene.add(g);
    slab(13, .3, 5, mat.wood, [0, .1, 0], g); slab(13, .23, 5, mat.wood, [0, 4.2, 0], g);
    slab(.28, 4.3, 5, mat.wood, [-6.5, 2.1, 0], g); slab(.28, 4.3, 5, mat.wood, [6.5, 2.1, 0], g); slab(13, 4.3, .22, mat.paper, [0, 2.1, -2.4], g);
    for (let k = 1; k < 5; k++) slab(.23, 4, 4.7, mat.wood, [-6.5 + k * 2.6, 2.05, 0], g);
    const rugs = [mat.gold, mat.glass, mat.cloth, mat.mint, mat.petal];
    for (let i = 0; i < 5; i++) { const x = -5.2 + i * 2.6; mesh(new CylinderGeometry(.73, .73, .06, 24), rugs[i], [x, .3, .35], g); cushion(x, 1.3); lantern([x, 2.05, -1.8], g); }
    const roofL = slab(7.5, .22, 5.7, mat.wood, [-3.0, 5.25, -.05], g); roofL.rotation.z = .25;
    const roofR = slab(7.5, .22, 5.7, mat.wood, [3.0, 5.25, -.05], g); roofR.rotation.z = -.25;
    // Rostos sem expressão prescrita: as formas só convidam a nomear, não a classificar.
    const hues = [0xf6d185, 0x8bb1e5, 0xe7a3a2, 0xbab0dc, 0x95c9af];
    for (let i = 0; i < 5; i++) {
      const x = -5 + i * 2.55;
      sphere(.67, track(new MeshStandardMaterial({ color: hues[i], roughness: .7 })), [x, 2.5, -2.72], scene, 2);
      for (const e of [-.23, .23]) sphere(.045, mat.wood, [x + e, 2.6, -2.10], scene, 0);
      const mouth = mesh(new TorusGeometry(.24, .023, 8, 24, Math.PI), mat.wood, [x, 2.38, -2.10]); mouth.rotation.z = i % 2 === 0 ? Math.PI : 0;
    }
  };
  const buildStudio = () => {
    const g = new Group(); g.position.set(0, .15, -1); scene.add(g);
    slab(15, .3, 9, mat.wood, [0, .10, 0], g); slab(15, 6, .22, mat.paper, [0, 3, -4.7], g);
    for (const x of [-7.4, 7.4]) slab(.25, 6, 9, mat.wood, [x, 3, 0], g);
    for (const x of [-5, -1, 3]) {
      slab(2.4, .18, 1.55, mat.wood, [x, 1.25, 1.5], g);
      for (const dx of [-.95, .95]) for (const dz of [-.55, .55]) cyl(.07, .1, 1.2, mat.wood, [x + dx, .62, 1.5 + dz], g);
      for (let i = 0; i < 8; i++) {
        const col = [0xf0c0a2, 0x98b3ca, 0xe4d291, 0x8abb92][i % 4];
        cyl(.13, .15, .27 + (i % 3) * .14, track(new MeshStandardMaterial({ color: col, roughness: .82 })), [x - .8 + (i % 4) * .5, 1.48, 1.13 + Math.floor(i / 4) * .5], g, 7);
      }
    }
    const easel = new Group(); easel.position.set(5.2, .2, -1.4); g.add(easel);
    for (const xx of [-.85, .85]) { const l = cyl(.065, .085, 3.8, mat.wood, [xx, 1.9, 0], easel); l.rotation.z = xx * .18; }
    slab(2.3, 2.7, .1, mat.paper, [0, 2.45, .25], easel);
    for (let k = 0; k < 22; k++) { const a = k * 2.4, r = Math.sqrt(k / 22) * .8; sphere(.10 + (k % 3) * .055, [mat.cloth, mat.mint, mat.gold][k % 3], [Math.cos(a) * r, 2.5 + Math.sin(a) * r, .33], easel, 0); }
    lantern([-5.5, 3.3, -3], g);
  };
  const buildIsland = () => {
    pond(0, -2, 9.5);
    mesh(new CylinderGeometry(5.2, 5.9, .9, 58), mat.soil, [0, .36, -2]);
    tree(0, -3, 1.25); bench(-2.1, -.4, .15); bench(2.1, -.4, -.15);
    for (let i = 0; i < 8; i++) { const a = i * 2.4, r = 5.3 + i * .36; sphere(.4, mat.stone, [Math.cos(a) * r, .32, Math.sin(a) * r - 2], scene, 0); }
    for (const x of [-4.3, 4.3]) lantern([x, 1.75, -.7]);
  };
  const buildObservatory = () => {
    const deck = new Group(); deck.position.set(0, .3, 0); scene.add(deck);
    cyl(1.3, 1.8, 5.2, mat.wood, [0, 2.6, 0], deck); cyl(6, 6, .55, mat.wood, [0, 5.45, 0], deck, 40);
    for (let i = 0; i < 13; i++) { const a = i * 6.28 / 13; cyl(.12, .15, 1.3, mat.wood, [Math.cos(a) * 5.65, 6.02, Math.sin(a) * 5.65], deck); }
    for (let i = 0; i < 10; i++) { const a = i * 6.28 / 10; lantern([Math.cos(a) * 5.3, 6.7, Math.sin(a) * 5.3], deck); }
    for (let i = 0; i < 5; i++) { const a = i * 1.26; cushion(Math.cos(a) * 3, Math.sin(a) * 3); }
    const telescope = cyl(.28, .38, 2.4, mat.gold, [0, 7.25, 0], deck, 12); telescope.rotation.z = .62; cyl(.08, .1, 1.6, mat.wood, [.4, 6.5, 0], deck);
    const starGeo = track(new SphereGeometry(.09, 6, 4)); const starMat = track(new MeshBasicMaterial({ color: 0xfff0c8 }));
    const stars = new InstancedMesh(starGeo, starMat, 300);
    for (let i = 0; i < 300; i++) {
      const a = rng() * 6.28, b = rng() * 1.4, r = 63;
      dummy.position.set(Math.cos(a) * r, 8 + Math.cos(b) * 32, Math.sin(a) * r); dummy.scale.setScalar(.7 + (i % 3) * .5); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); stars.setMatrixAt(i, dummy.matrix);
    }
    scene.add(stars);
  };
  const buildGarden = () => {
    pond(-.3, -2, 4.3); tree(-6.5, -5, 1.15);
    for (const x of [-6, -3, 0, 3, 6]) { cyl(.08, .12, 1.7, mat.wood, [x, .9, 6], scene, 8); sphere(.34, x % 2 ? mat.gold : mat.petal, [x, 1.85, 6], scene, 1); }
    for (const x of [-4, 4]) lantern([x, 2.25, -4.3]);
    for (let i = 0; i < 9; i++) { const a = i * 6.28 / 9; sphere(.46, mat.stone, [Math.cos(a) * 6.6, .32, Math.sin(a) * 6.6], scene, 1); }
  };
  if (observatory) {
    scene.background = new Color(0x1a233c); scene.fog = new FogExp2(0x1b2846, .011); sun.intensity = 1.7; hemi.intensity = 1.4;
  }
  ({ garden: buildGarden, house: buildHouse, bridge: buildBridge, studio: buildStudio, island: buildIsland, observatory: buildObservatory })[kind]();

  // Pontos luminosos: convites tocáveis. O ativo cresce suavemente; o resto permanece discreto.
  const hotspots: Mesh[] = [];
  const pulse: { group: Group; ring: Mesh; base: number; phase: number; body: Mesh }[] = [];
  config.hotspots.forEach(([x, y, z], index) => {
    const group = new Group(); group.position.set(x, y, z); scene.add(group);
    const body = new Mesh(track(new IcosahedronGeometry(.28, 1)), track(new MeshStandardMaterial({ color: 0xffdb99, emissive: 0xffa548, emissiveIntensity: 1.8, metalness: .35, roughness: .25 })));
    group.add(body);
    const ring = new Mesh(track(new TorusGeometry(.48, .015, 8, 48)), track(new MeshBasicMaterial({ color: 0xfff7e0, transparent: true, opacity: .6 })));
    group.add(ring);
    body.userData.index = index % config.invitations.length; hotspots.push(body);
    pulse.push({ group, ring, base: y, phase: index * .8, body });
  });

  const particleCount = 240, parts = new Float32Array(particleCount * 3), pSeeds: number[][] = [];
  for (let i = 0; i < particleCount; i++) { const x = (rng() - .5) * 36, y = 1 + rng() * 9, z = (rng() - .5) * 34; parts.set([x, y, z], i * 3); pSeeds.push([x, y, z, rng() * 6.28]); }
  const pgeo = track(new BufferGeometry()); pgeo.setAttribute("position", new BufferAttribute(parts, 3));
  const points = new Points(pgeo, track(new PointsMaterial({ color: observatory ? 0xfff0be : 0xffefd1, size: .065, transparent: true, opacity: .57, depthWrite: false, blending: AdditiveBlending })));
  scene.add(points);

  const insects: { g: Group; base: Vector3; phase: number }[] = [];
  const wingGeo = track(new SphereGeometry(.16, 8, 5));
  for (let i = 0; i < 15; i++) {
    const g = new Group(); const c = track(new MeshBasicMaterial({ color: i % 2 ? 0xffd883 : 0xb0cfc7, side: DoubleSide, transparent: true, opacity: .76 }));
    for (const s of [-1, 1]) { const wing = new Mesh(wingGeo, c); wing.position.set(s * .1, 0, 0); wing.scale.set(.8, .13, 1.2); wing.rotation.z = s * .45; g.add(wing); }
    g.position.set((rng() - .5) * 17, 1.6 + rng() * 4, (rng() - .5) * 17); scene.add(g); insects.push({ g, base: g.position.clone(), phase: i * .77 });
  }

  const caster = new Raycaster(), pointer = new Vector2(), down = { x: 0, y: 0 };
  const hit = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    caster.setFromCamera(pointer, camera); return caster.intersectObjects(hotspots, false);
  };
  const onDown = (e: PointerEvent) => { down.x = e.clientX; down.y = e.clientY; };
  const onUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) return;
    const found = hit(e); if (found.length) events.onPick(found[0].object.userData.index as number);
  };
  const onMove = (e: PointerEvent) => { renderer.domElement.style.cursor = hit(e).length ? "pointer" : "grab"; };
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointermove", onMove);
  const onContextLost = (e: Event) => { e.preventDefault(); events.onFailure(new Error("webgl-context-lost")); };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  const resize = () => { camera.aspect = width() / height(); camera.updateProjectionMatrix(); renderer.setSize(width(), height()); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65)); };
  const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  observer?.observe(container);

  let opts = options, active = -1, clock = 0, last = performance.now(), frame = 0, running = true;
  const yAxis = new Vector3(0, 1, 0), offset = new Vector3();
  const tick = (now: number) => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min(.045, (now - last) * .001); last = now; clock += dt;
    waterMat.uniforms.uTime.value = opts.lowStim ? 0 : clock;
    if (opts.autoOrbit && !opts.lowStim) { offset.copy(camera.position).sub(controls.target).applyAxisAngle(yAxis, dt * .09); camera.position.copy(controls.target).add(offset); }
    for (const o of pulse) {
      const chosen = o.body.userData.index === active;
      o.group.position.y = o.base + (!opts.lowStim ? .11 * Math.sin(clock * 1.45 + o.phase) : 0);
      o.group.scale.setScalar(chosen ? 1.35 : 1);
      o.ring.rotation.y = clock * .3 + o.phase;
      (o.ring.material as MeshBasicMaterial).opacity = opts.lowStim ? (chosen ? .9 : .4) : chosen ? .95 : .5 + .2 * Math.sin(clock * 2 + o.phase);
    }
    if (!opts.lowStim) {
      for (const o of insects) {
        o.g.position.x = o.base.x + Math.sin(clock * .65 + o.phase) * .55; o.g.position.y = o.base.y + Math.cos(clock * 1.6 + o.phase) * .22;
        o.g.children.forEach((w, j) => { w.rotation.z = (j === 0 ? 1 : -1) * Math.sin(clock * 9 + o.phase) * .9; });
      }
      for (let i = 0; i < particleCount; i++) { const o = pSeeds[i]; parts[i * 3] = o[0] + Math.sin(clock * .3 + o[3]) * .5; parts[i * 3 + 1] = o[1] + Math.sin(clock * .4 + o[3]) * .33; parts[i * 3 + 2] = o[2] + Math.cos(clock * .3 + o[3]) * .35; }
      pgeo.attributes.position.needsUpdate = true;
      for (const o of floral) o.f.rotation.z = Math.sin(clock * .55 + o.phase) * .035;
    }
    points.visible = !opts.lowStim; for (const o of insects) o.g.visible = !opts.lowStim;
    controls.update(); renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);
  const onVisibility = () => { if (document.hidden) { running = false; cancelAnimationFrame(frame); } else if (!running) { running = true; last = performance.now(); frame = requestAnimationFrame(tick); } };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setOptions(next) { opts = next; },
    setActive(index) { active = index; },
    dispose() {
      running = false; cancelAnimationFrame(frame); observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("pointerdown", onDown); renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove); renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      controls.dispose();
      scene.traverse(object => { const m = object as Mesh; if ((m as { isMesh?: boolean }).isMesh && m.geometry) m.geometry.dispose(); });
      disposables.forEach(item => item.dispose());
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}

