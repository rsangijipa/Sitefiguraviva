import {
  AmbientLight, CanvasTexture, CapsuleGeometry, Color, CylinderGeometry, DirectionalLight, DoubleSide, Group, HemisphereLight, LatheGeometry, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Quaternion, Raycaster, Scene, SphereGeometry, Sprite, SpriteMaterial,
  SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type BufferGeometry, type Material, type Object3D,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Region = "cabeça" | "pescoço" | "ombros" | "peito" | "abdômen" | "braços" | "mãos" | "quadril" | "pernas" | "pés";
import { isPaired, type Side } from "./body-types";
export type { Side };
export type View = "frente" | "costas";
export interface BodyMark { region: Region; side?: Side; view: View; intensity: number | null }
export interface BodyEvents { onSelect(region: Region, side: Side | undefined): void; onViewChange(view: View): void }
export interface BodyHandle {
  setView(view: View): void;
  setMarks(marks: BodyMark[]): void;
  setCurrent(region: Region, side: Side | undefined): void;
  setReduced(reduced: boolean): void;
  resetCamera(): void;
  dispose(): void;
}

const ANCHOR: Record<Region, [number, number, number]> = {
  "cabeça": [0, 1.66, 0.1], "pescoço": [0, 1.54, 0.05], ombros: [0.2, 1.45, 0.02], peito: [0, 1.36, 0.1], "abdômen": [0, 1.1, 0.1],
  "braços": [0.26, 1.2, 0.02], "mãos": [0.31, 0.84, 0.02], quadril: [0, 0.91, 0.11], pernas: [0.095, 0.5, 0.075], "pés": [0.095, 0.05, 0.12],
};
const FOCUS: Partial<Record<Region, { y: number; d: number }>> = { "cabeça": { y: 1.6, d: 2.3 }, "pescoço": { y: 1.5, d: 2.5 }, "mãos": { y: 0.9, d: 2.6 }, "pés": { y: 0.2, d: 2.6 } };
const DEFAULT_TARGET_Y = 0.92, DEFAULT_DISTANCE = 3.5;
const key = (region: Region, side?: Side) => `${region}|${side ?? ""}`;

function glowTexture(intensity: number) {
  const size = 128, canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
  const g = canvas.getContext("2d");
  if (g) {
    const gradient = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, "rgba(250,205,41,.75)"); gradient.addColorStop(0.5, "rgba(189,109,45,.28)"); gradient.addColorStop(1, "rgba(189,109,45,0)");
    g.fillStyle = gradient; g.fillRect(0, 0, size, size);
    g.strokeStyle = "rgba(0,90,31,.9)"; g.lineWidth = 3;
    for (let n = 1; n <= Math.max(1, intensity); n++) { g.beginPath(); g.arc(64, 64, 8 + n * 9, 0, Math.PI * 2); g.stroke(); }
  }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}
function focusTexture() {
  const size = 128, canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
  const g = canvas.getContext("2d");
  if (g) { g.strokeStyle = "rgba(0,90,31,.95)"; g.lineWidth = 5; g.setLineDash([10, 8]); g.beginPath(); g.arc(64, 64, 50, 0, Math.PI * 2); g.stroke(); }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}

export function createBody3D(container: HTMLElement, events: BodyEvents, reduced: boolean): BodyHandle {
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T) => { disposables.push(item); return item; };
  const width = () => Math.max(1, container.clientWidth), height = () => Math.max(1, container.clientHeight);

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, width() / height(), 0.1, 40);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(width(), height());
  renderer.outputColorSpace = SRGBColorSpace; renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none;outline-offset:-3px";
  container.appendChild(renderer.domElement);

  scene.add(new HemisphereLight(0xfffaf0, 0xc8b79c, 1.35));
  const key1 = new DirectionalLight(0xfff1dc, 1.9); key1.position.set(2.2, 3.2, 3); scene.add(key1);
  const fill = new DirectionalLight(0xdce8ff, 0.55); fill.position.set(-3, 1.8, -2.5); scene.add(fill);
  scene.add(new AmbientLight(0xffffff, 0.15));

  const body = new Group(); scene.add(body);
  const pickables: Mesh[] = [];
  const groups = new Map<string, Mesh[]>();
  const baseColor = new Color("#d9b998");

  const add = (mesh: Mesh, region: Region, side?: Side) => {
    mesh.userData = { region, side }; mesh.geometry && track(mesh.geometry as BufferGeometry);
    const material = new MeshStandardMaterial({ color: baseColor, roughness: 0.72, metalness: 0.02 }); track(material); mesh.material = material;
    body.add(mesh); pickables.push(mesh);
    const k = key(region, side); groups.set(k, [...(groups.get(k) ?? []), mesh]); return mesh;
  };
  const lathe = (profile: [number, number][], depth: number, y: number, region: Region) => {
    const geometry = new LatheGeometry(profile.map(([r, h]) => new Vector2(r, h)), 40);
    const mesh = add(new Mesh(geometry), region); mesh.scale.z = depth; mesh.position.y = y; return mesh;
  };
  const sphere = (r: number, x: number, y: number, z: number, region: Region, side?: Side, sx = 1, sy = 1, sz = 1) => {
    const mesh = add(new Mesh(new SphereGeometry(r, 28, 20)), region, side); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); return mesh;
  };
  const tube = (a: Vector3, b: Vector3, r0: number, r1: number, region: Region, side?: Side) => {
    const direction = b.clone().sub(a), length = direction.length();
    const mesh = add(new Mesh(new CylinderGeometry(r1, r0, length, 28, 1, true)), region, side);
    mesh.position.copy(a.clone().add(b).multiplyScalar(0.5)); mesh.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()));
    sphere(r0, a.x, a.y, a.z, region, side); sphere(r1, b.x, b.y, b.z, region, side);
  };

  // Cabeça e pescoço
  sphere(0.095, 0, 1.66, 0, "cabeça", undefined, 1, 1.18, 1.06);
  sphere(0.06, 0, 1.6, 0.045, "cabeça", undefined, 1, 0.9, 0.9);
  sphere(0.014, 0, 1.655, 0.108, "cabeça", undefined, 1, 1.6, 1.4); // nariz: marca a frente
  sphere(0.024, 0.098, 1.665, 0, "cabeça", undefined, 0.5, 1.5, 0.9); sphere(0.024, -0.098, 1.665, 0, "cabeça", undefined, 0.5, 1.5, 0.9);
  tube(new Vector3(0, 1.5, 0), new Vector3(0, 1.6, 0.005), 0.046, 0.044, "pescoço");

  // Tronco: três segmentos contínuos
  lathe([[0.001, 0], [0.11, 0.02], [0.145, 0.1], [0.17, 0.2], [0.165, 0.27], [0.12, 0.31], [0.05, 0.325], [0.001, 0.33]], 0.62, 1.2, "peito");
  lathe([[0.001, 0], [0.12, 0.0], [0.118, 0.1], [0.125, 0.2], [0.14, 0.24], [0.001, 0.24]], 0.68, 0.98, "abdômen");
  lathe([[0.001, 0], [0.13, 0.0], [0.17, 0.05], [0.175, 0.12], [0.15, 0.19], [0.126, 0.21], [0.001, 0.21]], 0.72, 0.78, "quadril");

  // Lados: x negativo = direito da pessoa
  for (const [sign, side] of [[-1, "direito"], [1, "esquerdo"]] as [number, Side][]) {
    sphere(0.062, sign * 0.2, 1.45, 0, "ombros", side, 1, 1, 1.05);
    const shoulder = new Vector3(sign * 0.2, 1.44, 0), elbow = new Vector3(sign * 0.27, 1.15, 0.01), wrist = new Vector3(sign * 0.32, 0.9, 0.04);
    tube(shoulder, elbow, 0.05, 0.039, "braços", side); tube(elbow, wrist, 0.039, 0.03, "braços", side);
    // mão: palma e dedos separados
    sphere(0.033, wrist.x + sign * 0.012, 0.85, 0.045, "mãos", side, 0.9, 1.35, 0.55);
    for (let f = 0; f < 4; f++) {
      const finger = add(new Mesh(new CapsuleGeometry(0.0085, 0.045, 4, 10)), "mãos", side);
      finger.position.set(wrist.x + sign * (0.004 + f * 0.011 - 0.014), 0.79 - f * 0.002 * (f > 1 ? 1 : -1), 0.05); finger.rotation.z = sign * 0.05;
    }
    const thumb = add(new Mesh(new CapsuleGeometry(0.0095, 0.036, 4, 10)), "mãos", side); thumb.position.set(wrist.x - sign * 0.03, 0.85, 0.065); thumb.rotation.z = -sign * 0.7;
    // perna
    const hip = new Vector3(sign * 0.09, 0.86, 0), knee = new Vector3(sign * 0.095, 0.48, 0.015), ankle = new Vector3(sign * 0.095, 0.1, 0);
    tube(hip, knee, 0.082, 0.056, "pernas", side); tube(knee, ankle, 0.056, 0.036, "pernas", side);
    sphere(0.04, ankle.x, 0.07, 0, "pés", side);
    sphere(0.042, ankle.x, 0.035, 0.05, "pés", side, 0.95, 0.6, 2.2);
    sphere(0.036, ankle.x, 0.028, 0.115, "pés", side, 1.05, 0.5, 0.9);
  }

  // Sombra de contato
  const shadowTexture = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"); if (g) { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(60,50,30,.35)"); gr.addColorStop(1, "rgba(60,50,30,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } return new CanvasTexture(c); })();
  track(shadowTexture);
  const shadow = new Mesh(new PlaneGeometry(1.2, 0.7), new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, side: DoubleSide }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; track(shadow.geometry); track(shadow.material as Material); scene.add(shadow);

  // Marcas (halos) e foco
  const halos = new Group(); scene.add(halos);
  const glowCache = new Map<number, CanvasTexture>();
  const focusMap = track(focusTexture());
  const focus = new Sprite(new SpriteMaterial({ map: focusMap, transparent: true, depthTest: false, opacity: 0.95 })); focus.scale.setScalar(0.22); focus.renderOrder = 5; scene.add(focus);
  track(focus.material as Material);

  const anchorOf = (region: Region, side: Side | undefined, view: View): Vector3 => {
    const [x, y, z] = ANCHOR[region];
    const sign = side === "direito" ? -1 : 1;
    return new Vector3(isPaired(region) ? sign * x : x, y, view === "costas" ? -z - 0.02 : z);
  };

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 1.8; controls.maxDistance = 6; controls.minPolarAngle = 1.25; controls.maxPolarAngle = 1.95; controls.rotateSpeed = 0.7;
  controls.target.set(0, DEFAULT_TARGET_Y, 0); camera.position.set(0, 1.2, DEFAULT_DISTANCE); controls.update();

  let current: { region: Region; side?: Side } = { region: "cabeça" };
  let currentView: View = "frente";
  let isReduced = reduced, goalY = DEFAULT_TARGET_Y, goalD = DEFAULT_DISTANCE, goalAz: number | null = null;
  let first = true;
  let hoverKey = "", selectedKey = key("cabeça"), hoverBusy = false;

  const paint = () => {
    for (const [k, meshes] of groups) {
      const isSelected = k === selectedKey || (current.side === undefined && k.split("|")[0] === current.region), isHover = k === hoverKey;
      for (const mesh of meshes) { const m = mesh.material as MeshStandardMaterial; m.emissive.set(isSelected ? "#2f8f5b" : isHover ? "#6f9e82" : "#000000"); m.emissiveIntensity = isSelected ? 0.42 : isHover ? 0.26 : 0; }
    }
  };
  const updateFocus = () => { focus.position.copy(anchorOf(current.region, current.side, currentView)); };

  const raycaster = new Raycaster(), pointer = new Vector2(); const down = { x: 0, y: 0 };
  const pick = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit ? (hit.object.userData as { region: Region; side?: Side }) : null;
  };
  const onDown = (e: PointerEvent) => { down.x = e.clientX; down.y = e.clientY; };
  const onUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const hit = pick(e); if (hit) events.onSelect(hit.region, hit.side);
  };
  const onMove = (e: PointerEvent) => {
    if (e.buttons || hoverBusy) return; hoverBusy = true;
    requestAnimationFrame(() => { hoverBusy = false; });
    const hit = pick(e), next = hit ? key(hit.region, hit.side) : "";
    renderer.domElement.style.cursor = hit ? "pointer" : "grab";
    if (next !== hoverKey) { hoverKey = next; paint(); }
  };
  renderer.domElement.addEventListener("pointerdown", onDown); renderer.domElement.addEventListener("pointerup", onUp); renderer.domElement.addEventListener("pointermove", onMove);
  const onLost = (e: Event) => { e.preventDefault(); };
  renderer.domElement.addEventListener("webglcontextlost", onLost);

  const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { camera.aspect = width() / height(); camera.updateProjectionMatrix(); renderer.setSize(width(), height()); }) : null;
  observer?.observe(container);

  const azimuth = () => controls.getAzimuthalAngle();
  controls.addEventListener("change", () => {
    const view: View = Math.abs(azimuth()) > Math.PI / 2 ? "costas" : "frente";
    if (view !== currentView) { currentView = view; updateFocus(); events.onViewChange(view); }
  });

  let running = true, frame = 0, clock = 0, last = performance.now();
  const spherical = new Vector3();
  const tick = (now: number) => {
    if (!running) return; frame = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
    const ease = isReduced ? 1 : Math.min(1, dt * 5);
    controls.target.y += (goalY - controls.target.y) * ease;
    spherical.copy(camera.position).sub(controls.target);
    const dist = spherical.length(), nextDist = dist + (goalD - dist) * ease;
    if (goalAz !== null) {
      const az = Math.atan2(spherical.x, spherical.z); let delta = goalAz - az; while (delta > Math.PI) delta -= Math.PI * 2; while (delta < -Math.PI) delta += Math.PI * 2;
      const step = isReduced ? delta : delta * ease; const rot = az + step;
      const horizontal = Math.hypot(spherical.x, spherical.z);
      spherical.x = Math.sin(rot) * horizontal; spherical.z = Math.cos(rot) * horizontal;
      if (Math.abs(delta) < 0.01) goalAz = null;
    }
    spherical.setLength(nextDist); camera.position.copy(controls.target).add(spherical);
    if (!isReduced) { const s = 0.2 + Math.sin(clock * 2.2) * 0.012; focus.scale.setScalar(s); }
    controls.update(); renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);
  updateFocus(); paint();

  return {
    setView(view) { currentView = view; goalAz = view === "frente" ? 0 : Math.PI; updateFocus(); },
    setMarks(marks) {
      halos.clear();
      for (const mark of marks) {
        const level = Math.min(5, Math.max(1, mark.intensity ?? 1));
        let texture = glowCache.get(level); if (!texture) { texture = glowTexture(level); glowCache.set(level, texture); track(texture); }
        const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0.95 }));
        sprite.scale.setScalar(0.1 + level * 0.04); sprite.position.copy(anchorOf(mark.region, mark.side, mark.view)); sprite.renderOrder = 4; halos.add(sprite);
      }
    },
    setCurrent(region, side) {
      current = { region, side }; selectedKey = key(region, side); paint(); updateFocus();
      if (first) { first = false; return; }
      const f = FOCUS[region]; goalY = f?.y ?? DEFAULT_TARGET_Y; goalD = f?.d ?? DEFAULT_DISTANCE;
    },
    setReduced(value) { isReduced = value; },
    resetCamera() { goalY = DEFAULT_TARGET_Y; goalD = DEFAULT_DISTANCE; goalAz = 0; },
    dispose() {
      running = false; cancelAnimationFrame(frame); observer?.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown); renderer.domElement.removeEventListener("pointerup", onUp); renderer.domElement.removeEventListener("pointermove", onMove); renderer.domElement.removeEventListener("webglcontextlost", onLost);
      scene.traverse((object: Object3D) => { const mesh = object as Mesh; if (mesh.isMesh && mesh.geometry) mesh.geometry.dispose(); });
      halos.children.forEach(child => ((child as Sprite).material as Material).dispose());
      disposables.forEach(item => item.dispose()); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    },
  };
}
