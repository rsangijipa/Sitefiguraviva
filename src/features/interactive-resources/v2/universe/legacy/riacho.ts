// @ts-nocheck — cena portada do HTML original (riacho); o motor é legado e foi preservado.
import { createLegacyRuntime, createSceneEnv, type SceneEnv } from "./three-legacy";

/** Monta a cena dentro de `root` (que contém a interface com os mesmos ids). Devolve a limpeza. */
export function mount(root: HTMLElement): () => void {
  const __runtime = createLegacyRuntime();
  const THREE = __runtime.THREE;
  const __scene = createSceneEnv(root);
  const env: SceneEnv = __scene.env;

    // ============================================================================
    // 1. PROCEDURAL NOISE & TEXTURE GENERATORS (For realistic rocks, moss & foam)
    // ============================================================================
    class SimplexNoiseGenerator {
      constructor(seed = 42) {
        this.p = new Uint8Array(256);
        let s = seed;
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
          s = (s * 16807) % 2147483647;
          const j = s % (i + 1);
          const tmp = this.p[i];
          this.p[i] = this.p[j];
          this.p[j] = tmp;
        }
        this.perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
      }

      fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
      lerp(t, a, b) { return a + t * (b - a); }
      grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      }

      noise3D(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x), v = this.fade(y), w = this.fade(z);
        const A = this.perm[X] + Y, AA = this.perm[A] + Z, AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y, BA = this.perm[B] + Z, BB = this.perm[B + 1] + Z;

        return this.lerp(w,
          this.lerp(v,
            this.lerp(u, this.grad(this.perm[AA], x, y, z), this.grad(this.perm[BA], x - 1, y, z)),
            this.lerp(u, this.grad(this.perm[AB], x, y - 1, z), this.grad(this.perm[BB], x - 1, y - 1, z))
          ),
          this.lerp(v,
            this.lerp(u, this.grad(this.perm[AA + 1], x, y, z - 1), this.grad(this.perm[BA + 1], x - 1, y, z - 1)),
            this.lerp(u, this.grad(this.perm[AB + 1], x, y - 1, z - 1), this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1))
          )
        );
      }

      fbm(x, y, z, octaves = 4) {
        let val = 0, amp = 0.5, freq = 1.0, max = 0;
        for (let i = 0; i < octaves; i++) {
          val += this.noise3D(x * freq, y * freq, z * freq) * amp;
          max += amp;
          freq *= 2.05;
          amp *= 0.5;
        }
        return val / max;
      }
    }

    const noiseGen = new SimplexNoiseGenerator(1337);

    // Stream centerline curve: flows from Upper-Right (x: +16, z: -13, y: +3.8)
    // down through the center rapids (x: 0, z: 0, y: 0.4) to Lower-Left (x: -16, z: +11, y: -1.6)
    function getStreamCenterX(z) {
      // Smooth S-curve matching screenshot perspective
      return -z * 1.15 + Math.sin(z * 0.22) * 1.6;
    }

    function getStreamElevation(x, z) {
      // Base downhill slope along flow axis s
      const flowCoord = (-x * 0.65 + z * 0.76); // negative at upper-right, positive at lower-left
      let height = -flowCoord * 0.19 + 0.55;

      // Stepped waterfall terraces (degraus de cachoeira) matching the reference image ledges
      const terrace1 = Math.tanh((flowCoord + 6.5) * 1.6) * 0.38;
      const terrace2 = Math.tanh((flowCoord + 1.2) * 1.9) * 0.42;
      const terrace3 = Math.tanh((flowCoord - 3.8) * 1.7) * 0.35;
      height -= (terrace1 + terrace2 + terrace3);

      return height;
    }

    // Generate high-detail warm ochre/sienna granite & moss texture for boulders
    function createRockTextures() {
      const size = 512;
      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = diffCanvas.height = size;
      const dCtx = diffCanvas.getContext('2d');

      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = bumpCanvas.height = size;
      const bCtx = bumpCanvas.getContext('2d');

      const dImg = dCtx.createImageData(size, size);
      const bImg = bCtx.createImageData(size, size);

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const nx = x / size * 6.0;
          const ny = y / size * 6.0;
          const n1 = noiseGen.fbm(nx, ny, 0.5, 5);
          const n2 = noiseGen.fbm(nx * 3.5, ny * 3.5, 2.1, 3);
          const grain = noiseGen.noise3D(nx * 18.0, ny * 18.0, 1.0) * 0.08;
          const strata = Math.sin(ny * 4.5 + n1 * 3.0) * 0.08;

          const combined = Math.max(0, Math.min(1, 0.5 + n1 * 0.45 + n2 * 0.2 + strata + grain));

          // Warm ochre, sienna, umber palette from the watercolor/realistic reference
          let r = 158 + combined * 68 - Math.abs(n2) * 28;
          let g = 112 + combined * 54 - Math.abs(n2) * 25;
          let b = 72 + combined * 38 - Math.abs(n2) * 20;

          // Subtle mineral speckles
          if (grain > 0.045) {
            r += 22; g += 18; b += 14;
          } else if (grain < -0.045) {
            r -= 28; g -= 24; b -= 20;
          }

          const idx = (y * size + x) * 4;
          dImg.data[idx] = Math.max(0, Math.min(255, r));
          dImg.data[idx + 1] = Math.max(0, Math.min(255, g));
          dImg.data[idx + 2] = Math.max(0, Math.min(255, b));
          dImg.data[idx + 3] = 255;

          const bumpVal = Math.max(0, Math.min(255, Math.floor((0.5 + n1 * 0.5 + n2 * 0.35 + grain * 1.5) * 255)));
          bImg.data[idx] = bumpVal;
          bImg.data[idx + 1] = bumpVal;
          bImg.data[idx + 2] = bumpVal;
          bImg.data[idx + 3] = 255;
        }
      }

      dCtx.putImageData(dImg, 0, 0);
      bCtx.putImageData(bImg, 0, 0);

      const map = new THREE.CanvasTexture(diffCanvas);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(2, 2);

      const bumpMap = new THREE.CanvasTexture(bumpCanvas);
      bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
      bumpMap.repeat.set(2, 2);

      return { map, bumpMap };
    }

    // Generate soft radial sprite texture for water spray, foam droplets, and light motes
    function createSoftParticleTexture() {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.45, 'rgba(248, 252, 250, 0.75)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }

    // Generate fish scale & coloration texture matching the warm golden-brown river fish
    function createFishTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');

      // Dorsal-to-ventral realistic river trout/lambari gradient
      const bg = ctx.createLinearGradient(0, 0, 0, 256);
      bg.addColorStop(0.0, '#5E3214');   // Darker bronze-brown back
      bg.addColorStop(0.35, '#9A5725');  // Rich golden-brown flank
      bg.addColorStop(0.7, '#C27A38');   // Warm amber-copper
      bg.addColorStop(1.0, '#E6B87A');   // Soft golden belly
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 512, 256);

      // Subtle diamond scale pattern
      ctx.strokeStyle = 'rgba(60, 28, 8, 0.22)';
      ctx.lineWidth = 1.2;
      const stepX = 14, stepY = 12;
      for (let y = 16; y < 240; y += stepY) {
        const offset = (Math.floor(y / stepY) % 2) * (stepX * 0.5);
        for (let x = offset; x < 512; x += stepX) {
          ctx.beginPath();
          ctx.arc(x, y, 7, -Math.PI * 0.45, Math.PI * 0.45);
          ctx.stroke();
        }
      }

      // Subtle iridescent lateral line
      const lat = ctx.createLinearGradient(0, 110, 0, 138);
      lat.addColorStop(0, 'rgba(255, 215, 140, 0)');
      lat.addColorStop(0.5, 'rgba(255, 220, 150, 0.28)');
      lat.addColorStop(1, 'rgba(255, 215, 140, 0)');
      ctx.fillStyle = lat;
      ctx.fillRect(0, 105, 512, 36);

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    // ============================================================================
    // 2. THREE.JS SCENE, CAMERA, RENDERER & LIGHTING
    // ============================================================================
    const container = env.$('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xD8E2CE);
    scene.fog = new THREE.FogExp2(0xD5DFC9, 0.016);

    const camera = new THREE.PerspectiveCamera(38, env.W() / env.H(), 0.1, 160);
    // Framed to match the exact composition of image_998cfb.jpg:
    // Big mossy boulder on foreground-left, cascading stream flowing from upper-right to lower-left,
    // yellow flowers & foliage on upper-left and lower-right
    const DEFAULT_CAM_POS = new THREE.Vector3(-1.8, 6.4, 13.8);
    const DEFAULT_CAM_TARGET = new THREE.Vector3(0.4, 0.3, -1.2);
    camera.position.copy(DEFAULT_CAM_POS);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(env.W(), env.H());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.copy(DEFAULT_CAM_TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.minDistance = 5.5;
    controls.maxDistance = 24.0;
    controls.enablePan = false;
    controls.update();

    // Lighting setup
    const hemiLight = new THREE.HemisphereLight(0xFFFDF2, 0x4E5E42, 0.82);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xFFF3D6, 1.35);
    sunLight.position.set(14, 22, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 55;
    const d = 18;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Warm bounce light from the sunlit rocks
    const bounceLight = new THREE.DirectionalLight(0xE8B878, 0.42);
    bounceLight.position.set(-12, 6, -8);
    scene.add(bounceLight);

    const rockTextures = createRockTextures();
    const particleTex = createSoftParticleTexture();

    // ============================================================================
    // 3. RIVERBED TERRAIN & SUBMERGED PEBBLES
    // ============================================================================
    const bedGeo = new THREE.PlaneGeometry(42, 36, 140, 140);
    bedGeo.rotateX(-Math.PI / 2);
    const bedPos = bedGeo.attributes.position;
    const bedColors = new Float32Array(bedPos.count * 3);

    for (let i = 0; i < bedPos.count; i++) {
      const x = bedPos.getX(i);
      const z = bedPos.getZ(i);
      const streamCenter = getStreamCenterX(z);
      const distFromCenter = Math.abs(x - streamCenter);

      // Channel trough profile: deeper inside the river channel, rising on banks
      const channelWidth = 6.8 + Math.sin(z * 0.3) * 1.2;
      const bankFactor = Math.max(0, (distFromCenter - channelWidth * 0.55) / 5.0);
      const bankRise = Math.pow(bankFactor, 1.45) * 2.4;

      const baseElev = getStreamElevation(x, z);
      const rockyDetail = noiseGen.fbm(x * 0.35, z * 0.35, 1.2, 4) * 0.45;
      const y = baseElev - 0.55 + bankRise + rockyDetail;
      bedPos.setY(i, y);

      // Vertex coloring: wet mossy dark olive/ochre in riverbed, warm sandy earth on banks
      const c = new THREE.Color();
      if (distFromCenter < channelWidth * 0.75) {
        const pebbleTone = 0.5 + 0.5 * noiseGen.noise3D(x * 1.8, z * 1.8, 0.5);
        c.setRGB(
          0.26 + pebbleTone * 0.16,
          0.31 + pebbleTone * 0.14,
          0.20 + pebbleTone * 0.08
        );
      } else {
        c.setRGB(0.46, 0.42, 0.28);
      }
      bedColors[i * 3] = c.r;
      bedColors[i * 3 + 1] = c.g;
      bedColors[i * 3 + 2] = c.b;
    }
    bedGeo.setAttribute('color', new THREE.BufferAttribute(bedColors, 3));
    bedGeo.computeVertexNormals();

    const bedMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: rockTextures.map,
      bumpMap: rockTextures.bumpMap,
      bumpScale: 0.08,
      roughness: 0.88,
      metalness: 0.05
    });
    const riverbedMesh = new THREE.Mesh(bedGeo, bedMat);
    riverbedMesh.receiveShadow = true;
    scene.add(riverbedMesh);

    // Instanced submerged & shoreline river pebbles (seixos rolados)
    const pebbleCount = 420;
    const pebbleGeo = new THREE.DodecahedronGeometry(0.18, 1);
    pebbleGeo.scale(1.25, 0.58, 1.0);
    const pebbleMat = new THREE.MeshStandardMaterial({
      map: rockTextures.map,
      roughness: 0.42,
      metalness: 0.08
    });
    const pebbleInst = new THREE.InstancedMesh(pebbleGeo, pebbleMat, pebbleCount);
    pebbleInst.receiveShadow = true;
    const dummy = new THREE.Object3D();
    const pColor = new THREE.Color();

    for (let i = 0; i < pebbleCount; i++) {
      const z = (Math.random() - 0.5) * 26;
      const center = getStreamCenterX(z);
      const x = center + (Math.random() - 0.5) * 13.5;
      const y = getStreamElevation(x, z) - 0.42 + (Math.random() - 0.5) * 0.15;
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * 0.4, Math.random() * Math.PI * 2, Math.random() * 0.4);
      const s = 0.5 + Math.random() * 1.45;
      dummy.scale.set(s, s * (0.6 + Math.random() * 0.5), s);
      dummy.updateMatrix();
      pebbleInst.setMatrixAt(i, dummy.matrix);

      const hueShift = (Math.random() - 0.5) * 0.06;
      pColor.setHSL(0.08 + hueShift, 0.38 + Math.random() * 0.2, 0.34 + Math.random() * 0.24);
      pebbleInst.setColorAt(i, pColor);
    }
    pebbleInst.instanceMatrix.needsUpdate = true;
    if (pebbleInst.instanceColor) pebbleInst.instanceColor.needsUpdate = true;
    scene.add(pebbleInst);

    // ============================================================================
    // 4. REALISTIC SCULPTED BOULDERS & MOSS (Pedras com musgo fiéis à cena)
    // ============================================================================
    const bouldersGroup = new THREE.Group();
    scene.add(bouldersGroup);

    const mossPatches = [];

    function createSculptedBoulder({
      x, y, z,
      rx = 1.5, ry = 1.1, rz = 1.4,
      rotY = 0,
      seed = 1,
      mossAmount = 0.35,
      wetLine = 0.25
    }) {
      const geo = new THREE.IcosahedronGeometry(1.0, 4);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const v = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        // Flatten bottom slightly so boulder sits naturally in the stream bed
        if (v.y < -0.25) {
          v.y = -0.25 + (v.y + 0.25) * 0.45;
        }

        // Multi-scale rock fracture & facet displacement
        const nLarge = noiseGen.fbm(v.x * 1.3 + seed, v.y * 1.3 + seed, v.z * 1.3, 3);
        const nCracks = Math.abs(noiseGen.noise3D(v.x * 3.2 + seed * 2, v.y * 3.2, v.z * 3.2));
        const disp = 1.0 + nLarge * 0.28 - nCracks * 0.09;

        v.x *= rx * disp;
        v.y *= ry * disp;
        v.z *= rz * disp;
        pos.setXYZ(i, v.x, v.y, v.z);

        // Vertex color modulation: wet dark base near water, warm sunlit ochre on top, moss patches
        const heightNorm = (v.y / ry + 1.0) * 0.5;
        const mossNoise = noiseGen.fbm(v.x * 0.9 + seed, v.y * 0.9, v.z * 0.9 + seed, 3);
        const col = new THREE.Color(0xC88A52); // Warm ochre base

        // Sunlit warm top
        col.lerp(new THREE.Color(0xE0A96D), Math.max(0, Math.min(1, heightNorm * 0.85)));

        // Crevice darkening
        col.multiplyScalar(0.84 + 0.22 * (1.0 - nCracks));

        // Wet dark sheen near bottom waterline
        if (v.y < wetLine) {
          const wetFactor = Math.max(0, Math.min(1, (wetLine - v.y) / 0.65));
          col.lerp(new THREE.Color(0x3D2A19), wetFactor * 0.58);
        }

        // Natural moss coloring on damp/shaded sides
        if (mossAmount > 0 && mossNoise > (0.18 - mossAmount * 0.35) && v.y > -0.2) {
          const mStrength = Math.min(1, (mossNoise - (0.18 - mossAmount * 0.35)) * 3.2);
          col.lerp(new THREE.Color(0x4E6B2A), mStrength * 0.78);
        }

        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        map: rockTextures.map,
        bumpMap: rockTextures.bumpMap,
        bumpScale: 0.11,
        roughness: 0.72,
        metalness: 0.06
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.y = rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      bouldersGroup.add(mesh);

      return mesh;
    }

    // Place the exact boulders seen in the reference image:
    // 1. Hero Left Foreground/Midground Boulder (Large warm brown/ochre rock with lush moss on left)
    createSculptedBoulder({
      x: -3.5, y: 0.72, z: 3.1,
      rx: 2.65, ry: 1.55, rz: 2.15,
      rotY: 0.25, seed: 10.4, mossAmount: 0.55, wetLine: 0.15
    });

    // 2. Upper-Center/Left Bank Boulder (Behind the hero boulder, forming the upper cascade edge)
    createSculptedBoulder({
      x: -0.5, y: 2.05, z: -3.8,
      rx: 2.35, ry: 1.35, rz: 1.85,
      rotY: -0.4, seed: 22.1, mossAmount: 0.4, wetLine: 0.2
    });

    // 3. Upper-Right Cascade Ledge Rocks (Where the top rapids drop down)
    createSculptedBoulder({
      x: 3.4, y: 1.85, z: -3.2,
      rx: 1.55, ry: 0.85, rz: 1.35,
      rotY: 0.6, seed: 31.7, mossAmount: 0.25, wetLine: 0.3
    });
    createSculptedBoulder({
      x: 5.8, y: 2.1, z: -4.2,
      rx: 2.1, ry: 1.15, rz: 1.75,
      rotY: -0.2, seed: 44.3, mossAmount: 0.3, wetLine: 0.2
    });

    // 4. Right-Side Midground Boulders (Stepped warm ochre rocks on the right side of the screenshot)
    createSculptedBoulder({
      x: 5.5, y: 1.1, z: -0.5,
      rx: 2.2, ry: 1.15, rz: 1.7,
      rotY: 0.35, seed: 55.8, mossAmount: 0.2, wetLine: 0.1
    });

    // 5. Center-Right Submerged/Semi-submerged Rapids Rock (Just right of the jumping fish)
    createSculptedBoulder({
      x: 1.45, y: 0.18, z: 2.6,
      rx: 1.25, ry: 0.68, rz: 1.05,
      rotY: -0.5, seed: 67.2, mossAmount: 0.25, wetLine: 0.35
    });

    // 6. Lower-Right Foreground Boulders (Framing the bottom-right corner with moss & yellow flowers)
    createSculptedBoulder({
      x: 3.9, y: 0.22, z: 4.5,
      rx: 2.3, ry: 1.18, rz: 1.85,
      rotY: 0.15, seed: 78.9, mossAmount: 0.5, wetLine: 0.2
    });
    createSculptedBoulder({
      x: 2.1, y: -0.35, z: 6.4,
      rx: 1.75, ry: 0.9, rz: 1.45,
      rotY: -0.3, seed: 89.4, mossAmount: 0.65, wetLine: 0.25
    });

    // 7. Additional background & river-edge rocks for seamless 360/orbital realism
    const extraRocks = [
      { x: -6.8, y: 1.1, z: 1.2, rx: 2.2, ry: 1.4, rz: 2.0, seed: 91 },
      { x: -4.2, y: 2.2, z: -2.4, rx: 1.9, ry: 1.3, rz: 1.7, seed: 102 },
      { x: 2.2, y: 2.7, z: -6.8, rx: 2.4, ry: 1.4, rz: 1.9, seed: 114 },
      { x: 7.4, y: 2.8, z: -6.2, rx: 2.6, ry: 1.5, rz: 2.1, seed: 128 },
      { x: -1.8, y: -0.25, z: 5.8, rx: 1.1, ry: 0.55, rz: 0.95, seed: 135 },
      { x: -5.8, y: -0.3, z: 6.5, rx: 2.1, ry: 1.1, rz: 1.8, seed: 149 }
    ];
    extraRocks.forEach(r => createSculptedBoulder({ ...r, rotY: r.seed, mossAmount: 0.4, wetLine: 0.2 }));

    // 3D Volumetric Moss Tufts on the Hero Left Boulder & Lower-Right Rocks
    const mossGeo = new THREE.DodecahedronGeometry(0.16, 1);
    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x4A6B22,
      roughness: 0.92,
      metalness: 0.02
    });
    const mossInst = new THREE.InstancedMesh(mossGeo, mossMat, 220);
    mossInst.castShadow = true;
    mossInst.receiveShadow = true;

    const mossZones = [
      // Left side of Hero Boulder
      { cx: -5.0, cy: 0.65, cz: 3.6, sx: 1.3, sy: 0.8, sz: 1.1, count: 110 },
      // Lower-right mossy rock
      { cx: 1.6, cy: -0.1, cz: 6.2, sx: 1.1, sy: 0.4, sz: 0.9, count: 65 },
      // Upper-left bank moss
      { cx: -3.2, cy: 1.8, cz: -1.2, sx: 1.4, sy: 0.6, sz: 1.2, count: 45 }
    ];
    let mIdx = 0;
    mossZones.forEach(zone => {
      for (let i = 0; i < zone.count && mIdx < 220; i++, mIdx++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.7);
        dummy.position.set(
          zone.cx + Math.cos(a) * r * zone.sx,
          zone.cy + (Math.random() - 0.3) * zone.sy,
          zone.cz + Math.sin(a) * r * zone.sz
        );
        dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        const s = 0.6 + Math.random() * 1.35;
        dummy.scale.set(s * 1.2, s * 0.75, s);
        dummy.updateMatrix();
        mossInst.setMatrixAt(mIdx, dummy.matrix);

        pColor.setHSL(0.23 + (Math.random() - 0.5) * 0.06, 0.52 + Math.random() * 0.2, 0.24 + Math.random() * 0.16);
        mossInst.setColorAt(mIdx, pColor);
      }
    });
    mossInst.instanceMatrix.needsUpdate = true;
    if (mossInst.instanceColor) mossInst.instanceColor.needsUpdate = true;
    scene.add(mossInst);

    // ============================================================================
    // 5. CUSTOM GLSL SHADER FOR REALISTIC DOWNHILL FLOWING STREAM & CASCADES
    // ============================================================================
    const waterGeo = new THREE.PlaneGeometry(36, 30, 180, 180);
    waterGeo.rotateX(-Math.PI / 2);

    // Pre-shape the water mesh to follow the downhill river slope and stepped cascades,
    // and store local slope/rock-proximity in vertex attributes for foam generation!
    const wPos = waterGeo.attributes.position;
    const foamAttr = new Float32Array(wPos.count);

    // Key boulder centers in (x, z, radius) to generate realistic turbulent wake foam around rocks
    const rockObstacles = [
      { x: -3.5, z: 3.1, r: 2.55 },
      { x: -0.5, z: -3.8, r: 2.2 },
      { x: 3.4, z: -3.2, r: 1.55 },
      { x: 5.5, z: -0.5, r: 2.1 },
      { x: 1.45, z: 2.6, r: 1.35 },
      { x: 3.9, z: 4.5, r: 2.2 },
      { x: 2.1, z: 6.4, r: 1.65 },
      { x: -1.8, z: 5.8, r: 1.15 }
    ];

    for (let i = 0; i < wPos.count; i++) {
      const x = wPos.getX(i);
      const z = wPos.getZ(i);
      const elev = getStreamElevation(x, z);
      const elevDown = getStreamElevation(x - 0.35, z + 0.35);
      const slope = Math.max(0, (elev - elevDown) / 0.5); // Steeper at cascade drops!

      wPos.setY(i, elev);

      // Compute proximity to boulders for whitewater collars & wakes
      let rockWake = 0.0;
      for (let j = 0; j < rockObstacles.length; j++) {
        const ro = rockObstacles[j];
        const dx = x - ro.x;
        const dz = z - ro.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < ro.r * 1.45) {
          const proximity = Math.max(0, 1.0 - Math.abs(dist - ro.r * 0.92) / (ro.r * 0.55));
          rockWake = Math.max(rockWake, proximity);
        }
      }

      // Combine cascade drop slope + boulder wake into foam intensity attribute
      foamAttr[i] = Math.min(1.0, Math.pow(slope * 1.35, 1.4) + rockWake * 0.75);
    }
    waterGeo.setAttribute('aFoamWeight', new THREE.BufferAttribute(foamAttr, 1));
    waterGeo.computeVertexNormals();

    const waterUniforms = {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0.55, 0.8, 0.35).normalize() },
      uSunColor: { value: new THREE.Color(0xFFF7E0) },
      uDeepColor: { value: new THREE.Color(0x2F5A48) },     // Natural olive-emerald river depth
      uShallowColor: { value: new THREE.Color(0x6D8C62) },  // Sunlit translucent green-ochre
      uBedTint: { value: new THREE.Color(0x9E7B4F) },       // Warm golden riverbed refraction
      uSkyColor: { value: new THREE.Color(0xE4EED8) },
      uFoamColor: { value: new THREE.Color(0xFBFDF9) }
    };

    const waterVertexShader = `
      uniform float uTime;
      attribute float aFoamWeight;
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vFoam;
      varying float vWaveHeight;

      // Fast hash & 2D noise for GLSL vertex/fragment waves
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec3 pos = position;

        // Flow direction vector: from upper-right (+x, -z) to lower-left (-x, +z)
        vec2 flowDir = normalize(vec2(-0.68, 0.73));
        float speed = 2.2 + aFoamWeight * 1.6;
        vec2 flowUV = pos.xz * 0.75 - flowDir * (uTime * speed);

        // Multi-layered directional stream waves
        float w1 = sin(dot(pos.xz, flowDir) * 3.2 - uTime * 4.8) * 0.045;
        float w2 = sin(pos.x * 2.7 + pos.z * 1.9 - uTime * 3.6) * 0.03;
        float w3 = (noise(flowUV * 2.4) - 0.5) * (0.09 + aFoamWeight * 0.11);
        float w4 = (noise(flowUV * 5.2 + vec2(uTime * 1.5, -uTime * 1.2)) - 0.5) * 0.045;

        float totalWave = w1 + w2 + w3 + w4;
        pos.y += totalWave;

        // Perturb normal dynamically based on wave derivatives
        vec3 perturbedNormal = normalize(normal + vec3(
          (w1 + w3) * 1.6,
          0.0,
          (w2 + w4) * 1.6
        ));

        vNormal = normalize(normalMatrix * perturbedNormal);
        vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPosition.xyz;
        vFoam = aFoamWeight;
        vWaveHeight = totalWave;

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const waterFragmentShader = `
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uBedTint;
      uniform vec3 uSkyColor;
      uniform vec3 uFoamColor;

      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vFoam;
      varying float vWaveHeight;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.08;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 flowDir = normalize(vec2(-0.68, 0.73));
        vec2 uv = vWorldPos.xz;

        // Animated flowing water noise layers
        vec2 flow1 = uv * 1.15 - flowDir * (uTime * 2.5);
        vec2 flow2 = uv * 2.35 - flowDir * (uTime * 3.4) + vec2(4.2, -1.7);

        float n1 = fbm(flow1);
        float n2 = fbm(flow2);
        float ripples = (n1 * 0.6 + n2 * 0.4);

        // Construct detailed surface normal
        vec3 N = normalize(vNormal + vec3((n1 - 0.5) * 0.55, 0.0, (n2 - 0.5) * 0.55));
        vec3 V = normalize(cameraPosition - vWorldPos);

        // Fresnel reflectance
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2);
        fresnel = clamp(fresnel * 0.75 + 0.12, 0.0, 1.0);

        // Mix warm shallow ochre refraction and emerald stream water (matching reference)
        float shallowMask = smoothstep(0.25, 0.78, n1 + vFoam * 0.45);
        vec3 waterBody = mix(uDeepColor, uShallowColor, shallowMask);
        waterBody = mix(waterBody, uBedTint, (1.0 - fresnel) * 0.36 * n2);

        // Sky & foliage reflection
        vec3 reflected = mix(waterBody, uSkyColor, fresnel * 0.58);

        // Sun specular highlights (glints on moving ripples)
        vec3 H = normalize(uSunDir + V);
        float spec = pow(max(dot(N, H), 0.0), 96.0) * 0.85 + pow(max(dot(N, H), 0.0), 18.0) * 0.22;
        vec3 color = reflected + uSunColor * spec;

        // Whitewater cascades & foam streaks (corredeiras brancas)
        float streakNoise = fbm(vec2(
          dot(uv, vec2(flowDir.y, -flowDir.x)) * 3.2,
          dot(uv, flowDir) * 1.1 - uTime * 3.8
        ));
        float foamPattern = smoothstep(0.42, 0.74, vFoam * 0.85 + streakNoise * 0.62 + vWaveHeight * 2.2);
        // Fine lacy foam bubbles at the edges
        float lace = smoothstep(0.55, 0.68, n2 + vFoam * 0.5) * vFoam;
        float finalFoam = clamp(foamPattern + lace * 0.55, 0.0, 0.95);

        color = mix(color, uFoamColor, finalFoam);

        // Translucent alpha so submerged pebbles and swimming fish are visible
        float alpha = clamp(0.76 + finalFoam * 0.22 + fresnel * 0.12, 0.0, 0.96);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const waterMat = new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      transparent: true,
      depthWrite: false
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    scene.add(waterMesh);

    // ============================================================================
    // 6. CASCADE FOAM SPRAY & FLOATING STREAM BUBBLES (Bolhas e Espuma 3D)
    // ============================================================================
    // Floating luminous white bubbles/droplets seen in the screenshot
    const bubbleCount = 95;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(bubbleCount * 3);
    const bubbleData = [];

    for (let i = 0; i < bubbleCount; i++) {
      const z = -6.0 + Math.random() * 14.0;
      const cx = getStreamCenterX(z);
      const x = cx + (Math.random() - 0.5) * 9.0;
      const y = getStreamElevation(x, z) + 0.05 + Math.random() * 0.35;
      bubblePositions[i * 3] = x;
      bubblePositions[i * 3 + 1] = y;
      bubblePositions[i * 3 + 2] = z;
      bubbleData.push({
        speed: 1.4 + Math.random() * 1.6,
        bobPhase: Math.random() * Math.PI * 2,
        offsetSpread: (Math.random() - 0.5) * 8.5
      });
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));

    const bubbleMat = new THREE.PointsMaterial({
      map: particleTex,
      color: 0xFFFFFF,
      size: 0.26,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubblePoints);

    // Fine mist spray at the waterfall cascade ledges
    const sprayCount = 180;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPositions = new Float32Array(sprayCount * 3);
    const sprayData = [];
    const cascadeZones = [
      { x: 2.0, z: -2.5, spread: 4.5 },
      { x: -0.2, z: 1.8, spread: 4.8 },
      { x: -2.8, z: 4.8, spread: 4.2 }
    ];

    for (let i = 0; i < sprayCount; i++) {
      const zone = cascadeZones[i % cascadeZones.length];
      const x = zone.x + (Math.random() - 0.5) * zone.spread;
      const z = zone.z + (Math.random() - 0.5) * 2.2;
      const baseY = getStreamElevation(x, z);
      sprayPositions[i * 3] = x;
      sprayPositions[i * 3 + 1] = baseY + Math.random() * 0.45;
      sprayPositions[i * 3 + 2] = z;
      sprayData.push({
        baseX: x,
        baseY,
        baseZ: z,
        vy: 0.6 + Math.random() * 1.1,
        life: Math.random()
      });
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    const sprayMat = new THREE.PointsMaterial({
      map: particleTex,
      color: 0xF5FAF7,
      size: 0.34,
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    });
    const sprayPoints = new THREE.Points(sprayGeo, sprayMat);
    scene.add(sprayPoints);

    // ============================================================================
    // 7. ARTICULATED 3D FISH, PARABOLIC JUMP PHYSICS & WATER RIPPLE RINGS
    // ============================================================================
    const fishTexture = createFishTexture();

    // Build a realistic 3D river fish mesh with custom spine vertices so it undulates smoothly
    function createRealisticFishMesh(scale = 1.0) {
      const fishGroup = new THREE.Group();

      // Sculpted fusiform fish body from a high-segment sphere/lathe profile
      const bodyGeo = new THREE.SphereGeometry(0.45, 28, 18);
      const bPos = bodyGeo.attributes.position;
      const v = new THREE.Vector3();

      for (let i = 0; i < bPos.count; i++) {
        v.fromBufferAttribute(bPos, i);
        // x is along the length of the fish (-0.45 tail to +0.45 head)
        const t = (v.x + 0.45) / 0.9; // 0 at tail, 1 at nose
        // Streamlined hydrofoil profile
        const profileY = Math.sin(Math.pow(t, 0.65) * Math.PI) * 0.42;
        const profileZ = Math.sin(Math.pow(t, 0.6) * Math.PI) * 0.22;

        v.x *= 1.85; // total body length ~ 1.66 units
        v.y = (v.y / 0.45) * profileY;
        v.z = (v.z / 0.45) * profileZ;
        bPos.setXYZ(i, v.x, v.y, v.z);
      }
      bodyGeo.computeVertexNormals();

      // Store rest positions for real-time swimming spine wave animation
      bodyGeo.userData.restPos = bPos.array.slice();

      const bodyMat = new THREE.MeshStandardMaterial({
        map: fishTexture,
        roughness: 0.22,
        metalness: 0.18
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.castShadow = true;
      fishGroup.add(bodyMesh);

      // Forked Caudal Fin (Tail fin - Barbatana caudal)
      const tailShape = new THREE.Shape();
      tailShape.moveTo(0, 0);
      tailShape.quadraticCurveTo(-0.22, 0.24, -0.44, 0.34);
      tailShape.quadraticCurveTo(-0.30, 0.08, -0.22, 0.0);
      tailShape.quadraticCurveTo(-0.30, -0.08, -0.44, -0.34);
      tailShape.quadraticCurveTo(-0.22, -0.24, 0, 0);

      const finGeo = new THREE.ShapeGeometry(tailShape);
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x9E5822,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      });
      const tailMesh = new THREE.Mesh(finGeo, finMat);
      tailMesh.position.set(-0.76, 0, 0);
      fishGroup.add(tailMesh);

      // Dorsal fin
      const dorsalShape = new THREE.Shape();
      dorsalShape.moveTo(0.15, 0);
      dorsalShape.quadraticCurveTo(0.0, 0.24, -0.24, 0.18);
      dorsalShape.lineTo(-0.18, 0);
      dorsalShape.closePath();
      const dorsalMesh = new THREE.Mesh(new THREE.ShapeGeometry(dorsalShape), finMat);
      dorsalMesh.position.set(0.0, 0.34, 0);
      fishGroup.add(dorsalMesh);

      // Pectoral fins (left & right)
      const pecShape = new THREE.Shape();
      pecShape.moveTo(0, 0);
      pecShape.quadraticCurveTo(-0.15, -0.16, -0.26, -0.08);
      pecShape.quadraticCurveTo(-0.14, 0.04, 0, 0);
      const pecGeo = new THREE.ShapeGeometry(pecShape);

      const pecL = new THREE.Mesh(pecGeo, finMat);
      pecL.position.set(0.28, -0.12, 0.17);
      pecL.rotation.set(0.45, -0.35, 0);
      fishGroup.add(pecL);

      const pecR = new THREE.Mesh(pecGeo, finMat);
      pecR.position.set(0.28, -0.12, -0.17);
      pecR.rotation.set(-0.45, 0.35, 0);
      fishGroup.add(pecR);

      // Realistic glossy eyes (left & right)
      const eyeGeo = new THREE.SphereGeometry(0.048, 12, 12);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
      const irisGeo = new THREE.RingGeometry(0.042, 0.056, 16);
      const irisMat = new THREE.MeshBasicMaterial({ color: 0xD49B4B, side: THREE.DoubleSide });

      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(0.54, 0.07, 0.115);
      fishGroup.add(eyeL);

      const irisL = new THREE.Mesh(irisGeo, irisMat);
      irisL.position.set(0.545, 0.07, 0.145);
      irisL.rotation.y = 0.25;
      fishGroup.add(irisL);

      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.54, 0.07, -0.115);
      fishGroup.add(eyeR);

      const irisR = new THREE.Mesh(irisGeo, irisMat);
      irisR.position.set(0.545, 0.07, -0.145);
      irisR.rotation.y = -0.25;
      fishGroup.add(irisR);

      fishGroup.scale.setScalar(scale);
      fishGroup.userData = { bodyMesh, tailMesh, pecL, pecR };
      return fishGroup;
    }

    // Animate biomechanical fish spine wave & tail oscillation
    function updateFishAnimation(fishGroup, time, freq = 14.0, amp = 0.08) {
      const { bodyMesh, tailMesh, pecL, pecR } = fishGroup.userData;
      const pos = bodyMesh.geometry.attributes.position;
      const rest = bodyMesh.geometry.userData.restPos;

      for (let i = 0; i < pos.count; i++) {
        const rx = rest[i * 3];
        const rz = rest[i * 3 + 2];
        // Amplitude increases toward the tail (rx < 0)
        const tailFactor = Math.max(0, (0.65 - rx) / 1.45);
        const wave = Math.sin(time * freq - rx * 4.5) * amp * tailFactor;
        pos.setZ(i, rz + wave);
      }
      pos.needsUpdate = true;

      const tailWave = Math.sin(time * freq - 3.4);
      tailMesh.position.z = tailWave * amp * 1.15;
      tailMesh.rotation.y = -tailWave * amp * 3.8;

      pecL.rotation.z = Math.sin(time * freq * 0.7) * 0.25;
      pecR.rotation.z = -Math.sin(time * freq * 0.7) * 0.25;
    }

    // Concentric Water Ripple Rings System (matching the white elliptical rings in the screenshot)
    const activeRipples = [];
    const rippleRingGeo = new THREE.RingGeometry(0.82, 1.0, 48);
    rippleRingGeo.rotateX(-Math.PI / 2);

    function spawnWaterRipples(x, z, intensity = 1.0) {
      const baseY = getStreamElevation(x, z) + 0.04;
      // Spawn 2 concentric rings staggered slightly
      for (let r = 0; r < 2; r++) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0xF7FAF5,
          transparent: true,
          opacity: (0.78 - r * 0.22) * intensity,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const ring = new THREE.Mesh(rippleRingGeo, mat);
        ring.position.set(x, baseY, z);
        const initScale = 0.22 + r * 0.28;
        ring.scale.set(initScale * 1.25, 1, initScale * 0.9);
        scene.add(ring);

        activeRipples.push({
          mesh: ring,
          age: 0,
          maxAge: 1.85 + r * 0.35,
          startScale: initScale,
          endScale: (1.65 + r * 0.55) * intensity,
          initOpacity: (0.78 - r * 0.22) * intensity
        });
      }
    }

    // Splash Droplets Burst System when fish jumps or lands
    const splashDrops = [];
    const dropGeo = new THREE.SphereGeometry(0.038, 6, 6);
    const dropMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.88
    });

    function spawnWaterSplash(x, z, count = 14) {
      const y = getStreamElevation(x, z) + 0.06;
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(dropGeo, dropMat);
        mesh.position.set(
          x + (Math.random() - 0.5) * 0.3,
          y,
          z + (Math.random() - 0.5) * 0.3
        );
        const angle = Math.random() * Math.PI * 2;
        const speedH = 0.6 + Math.random() * 1.4;
        scene.add(mesh);
        splashDrops.push({
          mesh,
          vx: Math.cos(angle) * speedH,
          vy: 2.2 + Math.random() * 2.4,
          vz: Math.sin(angle) * speedH,
          age: 0,
          maxAge: 0.65 + Math.random() * 0.35
        });
      }
    }

    // Fish Population:
    // - Fish #0 is the hero center jumper (matching the exact spot in the reference screenshot!)
    // - Additional fish leap across different pools of the rapids and swim underwater
    const fishes = [];
    const jumpSpots = [
      // Spot 0: Exact hero center spot from the screenshot (right beside the big left boulder)
      { x: -0.65, z: 3.35, dx: 1.1, dz: -0.45, jumpHeight: 1.25, interval: 3.6, delay: 0.2, scale: 0.95 },
      // Spot 1: Foreground right pool (where the second ripple ring appears in the screenshot!)
      { x: 1.55, z: 5.15, dx: -0.95, dz: -0.6, jumpHeight: 1.15, interval: 4.8, delay: 1.9, scale: 0.85 },
      // Spot 2: Upper-center cascade pool
      { x: 1.2, z: -0.8, dx: -1.1, dz: 0.5, jumpHeight: 1.2, interval: 5.4, delay: 3.1, scale: 0.82 },
      // Spot 3: Lower-left rapids pool
      { x: -2.4, z: 5.6, dx: 1.2, dz: -0.5, jumpHeight: 1.1, interval: 6.0, delay: 4.2, scale: 0.78 }
    ];

    jumpSpots.forEach((spot, idx) => {
      const mesh = createRealisticFishMesh(spot.scale);
      scene.add(mesh);
      fishes.push({
        id: idx,
        mesh,
        spot,
        state: idx === 0 ? 'jumping' : 'swimming',
        timer: idx === 0 ? 0.32 : spot.delay, // Start Fish #0 mid-leap immediately on load like the screenshot!
        jumpDuration: 1.18,
        startPos: new THREE.Vector3(spot.x - spot.dx * 0.5, getStreamElevation(spot.x, spot.z) - 0.18, spot.z - spot.dz * 0.5),
        endPos: new THREE.Vector3(spot.x + spot.dx * 0.5, getStreamElevation(spot.x, spot.z) - 0.18, spot.z + spot.dz * 0.5),
        peakHeight: spot.jumpHeight,
        enteredWater: false,
        phaseOffset: idx * 2.1
      });
    });

    // Spawn initial concentric ripples at the two exact locations seen in image_998cfb.jpg!
    spawnWaterRipples(-0.55, 3.45, 1.15);
    spawnWaterRipples(1.65, 5.25, 1.25);

    // Function to trigger an immediate fish leap at a specific (x, z) or random spot
    function triggerFishJumpAt(targetX, targetZ) {
      // Pick a swimming fish or the closest fish
      let chosen = fishes.find(f => f.state === 'swimming') || fishes[0];
      const dx = (Math.random() > 0.5 ? 1 : -1) * (0.9 + Math.random() * 0.5);
      const dz = -0.5 + (Math.random() - 0.5) * 0.5;
      const baseElev = getStreamElevation(targetX, targetZ);

      chosen.startPos.set(targetX - dx * 0.5, baseElev - 0.12, targetZ - dz * 0.5);
      chosen.endPos.set(targetX + dx * 0.5, baseElev - 0.12, targetZ + dz * 0.5);
      chosen.peakHeight = 1.2 + Math.random() * 0.35;
      chosen.jumpDuration = 1.15;
      chosen.state = 'jumping';
      chosen.timer = 0.0;
      chosen.enteredWater = false;

      spawnWaterRipples(chosen.startPos.x, chosen.startPos.z, 1.1);
      spawnWaterSplash(chosen.startPos.x, chosen.startPos.z, 14);
      soundEngine.playSplashSound();
    }

    // ============================================================================
    // 8. RIPARIAN FOLIAGE & YELLOW WILDFLOWERS (Vegetação e flores amarelas)
    // ============================================================================
    const foliageGroup = new THREE.Group();
    scene.add(foliageGroup);
    const swayingPlants = [];

    // Create realistic 3D botanical leaf geometry with central vein crease
    function createLeafGeometry() {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(0.24, 0.25, 0.18, 0.68);
      shape.quadraticCurveTo(0.06, 0.92, 0, 1.05);
      shape.quadraticCurveTo(-0.06, 0.92, -0.18, 0.68);
      shape.quadraticCurveTo(-0.24, 0.25, 0, 0);

      const geo = new THREE.ShapeGeometry(shape, 8);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const lx = pos.getX(i);
        const ly = pos.getY(i);
        // Natural arch & V-fold along leaf midrib
        const arch = -Math.pow(ly, 1.7) * 0.22 + Math.abs(lx) * 0.18;
        pos.setZ(i, arch);
      }
      geo.computeVertexNormals();
      return geo;
    }

    const leafGeo = createLeafGeometry();
    const leafMatLight = new THREE.MeshStandardMaterial({
      color: 0x628B35,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const leafMatDark = new THREE.MeshStandardMaterial({
      color: 0x3D6322,
      roughness: 0.62,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Create 3D 5-petal yellow wildflower (like the yellow flowers on left & bottom-right of screenshot)
    function createYellowFlower(scale = 1.0) {
      const flower = new THREE.Group();
      const petalShape = new THREE.Shape();
      petalShape.moveTo(0, 0);
      petalShape.quadraticCurveTo(0.11, 0.14, 0.08, 0.30);
      petalShape.quadraticCurveTo(0, 0.36, -0.08, 0.30);
      petalShape.quadraticCurveTo(-0.11, 0.14, 0, 0);
      const petalGeo = new THREE.ShapeGeometry(petalShape, 6);

      const petalMat = new THREE.MeshStandardMaterial({
        color: 0xF7C427, // Warm golden yellow
        roughness: 0.42,
        side: THREE.DoubleSide
      });

      for (let p = 0; p < 5; p++) {
        const pMesh = new THREE.Mesh(petalGeo, petalMat);
        pMesh.rotation.z = (p / 5) * Math.PI * 2;
        pMesh.rotation.x = 0.22;
        flower.add(pMesh);
      }

      // Warm orange-amber stamen center
      const centerGeo = new THREE.SphereGeometry(0.075, 10, 10);
      centerGeo.scale(1, 1, 0.55);
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xD96B18, roughness: 0.7 });
      const centerMesh = new THREE.Mesh(centerGeo, centerMat);
      centerMesh.position.z = 0.02;
      flower.add(centerMesh);

      flower.scale.setScalar(scale);
      return flower;
    }

    // Create a lush bush cluster with leaves and yellow wildflowers
    function createBotanicalCluster({ x, y, z, scale = 1.0, leafCount = 28, flowerCount = 3, pinkBlossom = false }) {
      const cluster = new THREE.Group();
      cluster.position.set(x, y, z);

      for (let i = 0; i < leafCount; i++) {
        const mat = Math.random() > 0.45 ? leafMatLight : leafMatDark;
        const leaf = new THREE.Mesh(leafGeo, mat);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.85 * scale;
        leaf.position.set(
          Math.cos(angle) * radius,
          (Math.random() - 0.2) * 0.75 * scale,
          Math.sin(angle) * radius
        );
        leaf.rotation.set(
          0.35 + Math.random() * 0.9,
          angle + (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.6
        );
        const s = (0.55 + Math.random() * 0.65) * scale;
        leaf.scale.setScalar(s);
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        cluster.add(leaf);
      }

      for (let f = 0; f < flowerCount; f++) {
        const fl = createYellowFlower((0.65 + Math.random() * 0.35) * scale);
        if (pinkBlossom && f === 0) {
          fl.children.forEach((ch, idx) => {
            if (idx < 5) ch.material = new THREE.MeshStandardMaterial({ color: 0xE56B7F, roughness: 0.45, side: THREE.DoubleSide });
          });
        }
        fl.position.set(
          (Math.random() - 0.5) * 0.95 * scale,
          (0.15 + Math.random() * 0.65) * scale,
          (0.2 + Math.random() * 0.55) * scale
        );
        fl.lookAt(camera.position);
        cluster.add(fl);
      }

      foliageGroup.add(cluster);
      swayingPlants.push({
        group: cluster,
        baseRotZ: cluster.rotation.z,
        baseRotX: cluster.rotation.x,
        speed: 1.2 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Place botanical clusters matching the screenshot:
    // 1. Upper-Left Lush Bank & Overhanging Branches (with yellow wildflowers & top pink blossom)
    createBotanicalCluster({ x: -5.2, y: 2.1, z: 1.6, scale: 1.45, leafCount: 38, flowerCount: 4 });
    createBotanicalCluster({ x: -4.1, y: 2.7, z: -0.5, scale: 1.55, leafCount: 42, flowerCount: 3, pinkBlossom: true });
    createBotanicalCluster({ x: -2.5, y: 3.1, z: -2.8, scale: 1.4, leafCount: 34, flowerCount: 2 });
    createBotanicalCluster({ x: -6.4, y: 1.4, z: 3.4, scale: 1.3, leafCount: 30, flowerCount: 3 });

    // 2. Lower-Right Foreground Corner Cluster (Yellow wildflowers + green leaves right in the bottom-right corner!)
    createBotanicalCluster({ x: 3.35, y: -0.15, z: 6.55, scale: 1.25, leafCount: 32, flowerCount: 4 });
    createBotanicalCluster({ x: 4.55, y: 0.25, z: 5.75, scale: 1.15, leafCount: 26, flowerCount: 2 });

    // 3. Distant Upper Bank Greenery
    createBotanicalCluster({ x: 0.8, y: 3.5, z: -5.8, scale: 1.5, leafCount: 32, flowerCount: 2 });
    createBotanicalCluster({ x: 5.2, y: 3.2, z: -6.2, scale: 1.4, leafCount: 28, flowerCount: 2 });

    // ============================================================================
    // 9. WEB AUDIO API PROCEDURAL SOUNDSCAPE (Riacho + Pássaros — 45s Cycle)
    // ============================================================================
    class StreamBirdSoundEngine {
      constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.volume = 0.42;
        this.birdTimer = null;
        this.dropletTimer = null;
      }

      init() {
        if (this.ctx) return;
        this.ctx = env.audio();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);

        // 1. Continuous Flowing Stream Water (Multi-band filtered noise + LFO modulation)
        const bufferSize = this.ctx.sampleRate * 4;
        const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const out = noiseBuffer.getChannelData(ch);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Paul Kellet's pink noise filter for warm natural water timbre
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
            b6 = white * 0.115926;
          }
        }

        // Deep stream body
        const streamSource1 = this.ctx.createBufferSource();
        streamSource1.buffer = noiseBuffer;
        streamSource1.loop = true;
        const filter1 = this.ctx.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.value = 420;
        filter1.Q.value = 0.7;
        const gain1 = this.ctx.createGain();
        gain1.gain.value = 0.55;
        streamSource1.connect(filter1).connect(gain1).connect(this.masterGain);
        streamSource1.start();

        // Sparkling cascade ripples (modulated bandpass)
        const streamSource2 = this.ctx.createBufferSource();
        streamSource2.buffer = noiseBuffer;
        streamSource2.loop = true;
        const filter2 = this.ctx.createBiquadFilter();
        filter2.type = 'bandpass';
        filter2.frequency.value = 1280;
        filter2.Q.value = 1.4;

        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.28;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 320;
        lfo.connect(lfoGain).connect(filter2.frequency);
        lfo.start();

        const gain2 = this.ctx.createGain();
        gain2.gain.value = 0.32;
        streamSource2.connect(filter2).connect(gain2).connect(this.masterGain);
        streamSource2.start();

        // 2. Melodic Forest Bird Calls & Water Bubble Plops
        this.startScheduledLoops();
        this.isPlaying = true;
      }

      startScheduledLoops() {
        if (this.birdTimer) clearInterval(this.birdTimer);
        if (this.dropletTimer) clearInterval(this.dropletTimer);

        // Periodic resonant water bubbles / brook plops
        this.dropletTimer = env.interval(() => {
          if (!this.isPlaying || !this.ctx || this.ctx.state !== 'running') return;
          if (Math.random() < 0.65) this.playBrookBubble();
        }, 420);

        // Periodic native birdsong phrases
        this.birdTimer = env.interval(() => {
          if (!this.isPlaying || !this.ctx || this.ctx.state !== 'running') return;
          this.playBirdPhrase();
        }, 2800);
      }

      playBrookBubble() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const baseFreq = 520 + Math.random() * 680;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, now + 0.065);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.022, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

        osc.connect(gain).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
      }

      playBirdPhrase() {
        const now = this.ctx.currentTime;
        const notes = 2 + Math.floor(Math.random() * 4);
        let t = now;

        for (let i = 0; i < notes; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

          const startF = 2100 + Math.random() * 1400;
          const endF = startF + (Math.random() - 0.35) * 950;
          const dur = 0.09 + Math.random() * 0.12;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(startF, t);
          osc.frequency.exponentialRampToValueAtTime(Math.max(1200, endF), t + dur * 0.7);
          osc.frequency.exponentialRampToValueAtTime(startF * 0.92, t + dur);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(0.045, t + dur * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          if (panner) {
            panner.pan.value = (Math.random() - 0.5) * 1.4;
            osc.connect(gain).connect(panner).connect(this.masterGain);
          } else {
            osc.connect(gain).connect(this.masterGain);
          }

          osc.start(t);
          osc.stop(t + dur + 0.02);
          t += dur + 0.04 + Math.random() * 0.08;
        }
      }

      playSplashSound() {
        if (!this.isPlaying || !this.ctx || this.ctx.state !== 'running') return;
        this.playBrookBubble();
        env.timeout(() => {
          if (this.isPlaying && this.ctx && this.ctx.state === 'running') {
            this.playBrookBubble();
          }
        }, 75);
      }

      setVolume(val0to1) {
        this.volume = val0to1;
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setTargetAtTime(
            this.isPlaying ? this.volume : 0.0001,
            this.ctx.currentTime,
            0.08
          );
        }
      }

      toggle() {
        if (!this.ctx) {
          this.init();
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
          this.isPlaying = true;
          return this.isPlaying;
        }

        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        this.isPlaying = !this.isPlaying;
        this.masterGain.gain.setTargetAtTime(
          this.isPlaying ? this.volume : 0.0001,
          this.ctx.currentTime,
          0.1
        );
        return this.isPlaying;
      }

      pause() {
        if (!this.ctx) return;
        this.isPlaying = false;
        this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.12);
      }

      resume() {
        if (!this.ctx) {
          this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        this.isPlaying = true;
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.12);
        }
      }
    }

    const soundEngine = new StreamBirdSoundEngine();

    // Start audio automatically on first user gesture anywhere if not paused
    let audioUnlocked = false;
    let userPausedAudio = false;
    function unlockAudioOnGesture() {
      if (!audioUnlocked && !userPausedAudio) {
        audioUnlocked = true;
        soundEngine.resume();
        updateSoundButtonUI(true);
      }
    }
    env.listen('pointerdown', unlockAudioOnGesture, { once: true });

    // ============================================================================
    // 10. UI CONTROLS, INTERACTIVITY & RAYCASTING
    // ============================================================================
    const btnToggleSound = env.$('btn-toggle-sound');
    const soundBtnLabel = env.$('sound-btn-label');
    const volumeSlider = env.$('volume-slider');
    const btnCreditsToggle = env.$('btn-credits-toggle');
    const creditsPanel = env.$('credits-panel');
    const creditsArrow = env.$('credits-arrow');
    const btnCloseEnv = env.$('btn-close-env');
    const ambientModal = env.$('ambient-modal');
    const btnResumeEnv = env.$('btn-resume-env');
    const btnRestartCycle = env.$('btn-restart-cycle');
    const btnJumpFish = env.$('btn-jump-fish');
    const btnResetCam = env.$('btn-reset-cam');
    const btnLightMode = env.$('btn-light-mode');
    const lightIcon = env.$('light-icon');
    const lightLabel = env.$('light-label');
    const btnToggleHud = env.$('btn-toggle-hud');
    const btnRestoreHud = env.$('btn-restore-hud');
    const hudLayer = env.$('hud-layer');
    const loopProgress = env.$('loop-progress');
    const timerDisplay = env.$('timer-display');

    function updateSoundButtonUI(playing) {
      soundBtnLabel.textContent = playing ? 'Pausar som' : 'Tocar som';
    }

    function updateSliderFill() {
      const val = volumeSlider.value;
      volumeSlider.style.setProperty('--val', val + '%');
    }
    updateSliderFill();

    btnToggleSound.addEventListener('click', (e) => {
      e.stopPropagation();
      audioUnlocked = true;
      const playing = soundEngine.toggle();
      userPausedAudio = !playing;
      updateSoundButtonUI(playing);
    });

    volumeSlider.addEventListener('input', () => {
      updateSliderFill();
      const v = parseFloat(volumeSlider.value) / 100;
      soundEngine.setVolume(v);
      if (v > 0 && !soundEngine.isPlaying && audioUnlocked) {
        soundEngine.resume();
        userPausedAudio = false;
        updateSoundButtonUI(true);
      }
    });

    btnCreditsToggle.addEventListener('click', () => {
      const isHidden = creditsPanel.classList.contains('hidden');
      creditsPanel.classList.toggle('hidden');
      btnCreditsToggle.setAttribute('aria-expanded', String(isHidden));
      creditsArrow.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
    });

    btnCloseEnv.addEventListener('click', () => {
      soundEngine.pause();
      updateSoundButtonUI(false);
      ambientModal.classList.remove('opacity-0', 'invisible');
    });

    btnResumeEnv.addEventListener('click', () => {
      ambientModal.classList.add('opacity-0', 'invisible');
      audioUnlocked = true;
      userPausedAudio = false;
      soundEngine.resume();
      updateSoundButtonUI(true);
    });

    let cycleElapsed = 0;
    btnRestartCycle.addEventListener('click', () => {
      cycleElapsed = 0;
      ambientModal.classList.add('opacity-0', 'invisible');
      audioUnlocked = true;
      userPausedAudio = false;
      soundEngine.resume();
      updateSoundButtonUI(true);
      triggerFishJumpAt(-0.65, 3.35);
    });

    btnJumpFish.addEventListener('click', () => {
      const spot = jumpSpots[Math.floor(Math.random() * jumpSpots.length)];
      triggerFishJumpAt(spot.x, spot.z);
    });

    btnResetCam.addEventListener('click', () => {
      camera.position.copy(DEFAULT_CAM_POS);
      controls.target.copy(DEFAULT_CAM_TARGET);
      controls.update();
    });

    // Lighting Presets (Morning Sun, Golden Afternoon, Misty Forest)
    const lightModes = [
      {
        name: 'Sol da Manhã',
        icon: '☀️',
        bg: 0xD8E2CE,
        sunColor: 0xFFF3D6,
        sunInt: 1.35,
        hemiInt: 0.82,
        deepWater: 0x2F5A48,
        shallowWater: 0x6D8C62
      },
      {
        name: 'Luz Dourada',
        icon: '🌅',
        bg: 0xE6D5B8,
        sunColor: 0xFFD28A,
        sunInt: 1.55,
        hemiInt: 0.72,
        deepWater: 0x3A5842,
        shallowWater: 0x8C8250
      },
      {
        name: 'Brisa da Mata',
        icon: '🌿',
        bg: 0xC6D6CC,
        sunColor: 0xE6F4F0,
        sunInt: 1.05,
        hemiInt: 0.92,
        deepWater: 0x244E48,
        shallowWater: 0x567E6C
      }
    ];
    let currentLightIdx = 0;

    btnLightMode.addEventListener('click', () => {
      currentLightIdx = (currentLightIdx + 1) % lightModes.length;
      const m = lightModes[currentLightIdx];
      lightIcon.textContent = m.icon;
      lightLabel.textContent = m.name;
      scene.background.setHex(m.bg);
      scene.fog.color.setHex(m.bg);
      sunLight.color.setHex(m.sunColor);
      sunLight.intensity = (m.sunInt) * Math.PI;
      hemiLight.intensity = (m.hemiInt) * Math.PI;
      waterUniforms.uDeepColor.value.setHex(m.deepWater);
      waterUniforms.uShallowColor.value.setHex(m.shallowWater);
    });

    btnToggleHud.addEventListener('click', () => {
      hudLayer.classList.add('opacity-0', 'pointer-events-none');
      btnRestoreHud.classList.remove('hidden');
    });

    btnRestoreHud.addEventListener('click', () => {
      hudLayer.classList.remove('opacity-0', 'pointer-events-none');
      btnRestoreHud.classList.add('hidden');
    });

    // Raycasting on water surface: clicking the stream creates ripples and triggers a jumping fish!
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    renderer.domElement.addEventListener('pointerdown', (e) => {
      pointerDownPos.x = e.clientX;
      pointerDownPos.y = e.clientY;
    });

    renderer.domElement.addEventListener('pointerup', (e) => {
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist > 6) return; // Was a camera drag, not a click

      pointer.x = (e.clientX / env.W()) * 2 - 1;
      pointer.y = -(e.clientY / env.H()) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObject(waterMesh);
      if (hits.length > 0) {
        const pt = hits[0].point;
        spawnWaterRipples(pt.x, pt.z, 1.15);
        spawnWaterSplash(pt.x, pt.z, 10);
        // If clicked near the central stream channel, make a fish leap there
        if (Math.abs(pt.x - getStreamCenterX(pt.z)) < 5.5) {
          triggerFishJumpAt(pt.x, pt.z);
        }
      }
    });

    // ============================================================================
    // 11. MAIN ANIMATION LOOP (Physics, Shaders, Fish Jumps, Particles & 45s Timer)
    // ============================================================================
    const clock = new THREE.Clock();

    function animate() {
      env.raf(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Update 45-second audio/visual contemplation progress bar
      if (!userPausedAudio) {
        cycleElapsed = (cycleElapsed + dt) % 45.0;
        const pct = (cycleElapsed / 45.0) * 100;
        loopProgress.style.width = pct.toFixed(1) + '%';
        const rem = Math.max(1, Math.ceil(45 - cycleElapsed));
        timerDisplay.textContent = `${rem}s / 45 segundos`;
      }

      // 1. Update Water Shader Uniforms
      waterUniforms.uTime.value = elapsed;

      // 2. Update Floating Stream Bubbles (flowing downhill from upper-right to lower-left)
      const bAttr = bubbleGeo.attributes.position;
      for (let i = 0; i < bubbleCount; i++) {
        const bd = bubbleData[i];
        let z = bAttr.getZ(i) + dt * bd.speed * 0.72;
        if (z > 8.2) {
          z = -6.5;
        }
        const cx = getStreamCenterX(z);
        const x = cx + bd.offsetSpread + Math.sin(elapsed * 1.5 + bd.bobPhase) * 0.25;
        const y = getStreamElevation(x, z) + 0.08 + Math.sin(elapsed * 3.2 + bd.bobPhase) * 0.06;
        bAttr.setXYZ(i, x, y, z);
      }
      bAttr.needsUpdate = true;

      // 3. Update Cascade Mist Spray Particles
      const sAttr = sprayGeo.attributes.position;
      for (let i = 0; i < sprayCount; i++) {
        const sd = sprayData[i];
        sd.life += dt * 1.35;
        if (sd.life >= 1.0) {
          sd.life = 0;
        }
        const curX = sd.baseX - sd.life * 0.35;
        const curZ = sd.baseZ + sd.life * 0.35;
        const arcY = sd.baseY + Math.sin(sd.life * Math.PI) * 0.42 * sd.vy;
        sAttr.setXYZ(i, curX, arcY, curZ);
      }
      sAttr.needsUpdate = true;

      // 4. Update Articulated Jumping & Swimming Fish
      for (let i = 0; i < fishes.length; i++) {
        const f = fishes[i];
        f.timer += dt;

        if (f.state === 'swimming') {
          // Swim gracefully beneath the translucent water surface
          const swimAngle = elapsed * 1.1 + f.phaseOffset;
          const sx = f.spot.x + Math.cos(swimAngle) * 0.85;
          const sz = f.spot.z + Math.sin(swimAngle * 0.8) * 0.65;
          const sy = getStreamElevation(sx, sz) - 0.24 + Math.sin(elapsed * 2.5 + i) * 0.04;

          f.mesh.position.set(sx, sy, sz);
          // Point nose along swimming velocity tangent
          const vx = -Math.sin(swimAngle) * 0.85;
          const vz = Math.cos(swimAngle * 0.8) * 0.52;
          f.mesh.rotation.set(0, Math.atan2(-vz, vx), 0);

          updateFishAnimation(f.mesh, elapsed + f.phaseOffset, 12.0, 0.065);

          // Ready to leap out of the water!
          if (f.timer >= f.spot.interval) {
            f.state = 'jumping';
            f.timer = 0;
            f.enteredWater = false;
            const baseElev = getStreamElevation(f.spot.x, f.spot.z);
            f.startPos.set(f.spot.x - f.spot.dx * 0.5, baseElev - 0.1, f.spot.z - f.spot.dz * 0.5);
            f.endPos.set(f.spot.x + f.spot.dx * 0.5, baseElev - 0.1, f.spot.z + f.spot.dz * 0.5);

            // Exit splash & concentric ripples
            spawnWaterRipples(f.startPos.x, f.startPos.z, 1.05);
            spawnWaterSplash(f.startPos.x, f.startPos.z, 12);
            soundEngine.playSplashSound();
          }
        } else if (f.state === 'jumping') {
          const u = f.timer / f.jumpDuration;

          if (u <= 1.0) {
            // Parabolic trajectory: P(u) = lerp(start, end, u) + 4 * H * u * (1 - u) * up
            const px = THREE.MathUtils.lerp(f.startPos.x, f.endPos.x, u);
            const pz = THREE.MathUtils.lerp(f.startPos.z, f.endPos.z, u);
            const baseY = THREE.MathUtils.lerp(f.startPos.y, f.endPos.y, u);
            const arcY = 4.0 * f.peakHeight * u * (1.0 - u);
            f.mesh.position.set(px, baseY + arcY, pz);

            // Tangent vector for realistic pitch and heading during the leap
            const vx = f.endPos.x - f.startPos.x;
            const vz = f.endPos.z - f.startPos.z;
            const vy = (f.endPos.y - f.startPos.y) + 4.0 * f.peakHeight * (1.0 - 2.0 * u);
            const horizSpeed = Math.hypot(vx, vz) || 0.001;

            const yaw = Math.atan2(-vz, vx);
            const pitch = Math.atan2(vy, horizSpeed) * 0.72;
            f.mesh.rotation.set(0, yaw, pitch);

            // Vigorous mid-air tail propulsion
            updateFishAnimation(f.mesh, elapsed + f.phaseOffset, 22.0, 0.11);

            // Trigger splash & concentric ripple rings as the fish re-enters the water!
            if (u >= 0.88 && !f.enteredWater) {
              f.enteredWater = true;
              spawnWaterRipples(f.endPos.x, f.endPos.z, 1.25);
              spawnWaterSplash(f.endPos.x, f.endPos.z, 16);
              soundEngine.playSplashSound();
            }
          } else {
            f.state = 'swimming';
            f.timer = 0;
          }
        }
      }

      // 5. Update Expanding Concentric Water Ripple Rings
      for (let i = activeRipples.length - 1; i >= 0; i--) {
        const rp = activeRipples[i];
        rp.age += dt;
        const p = rp.age / rp.maxAge;
        if (p >= 1.0) {
          scene.remove(rp.mesh);
          rp.mesh.material.dispose();
          activeRipples.splice(i, 1);
        } else {
          const curScale = THREE.MathUtils.lerp(rp.startScale, rp.endScale, Math.pow(p, 0.75));
          // Slightly elliptical perspective matching the reference rings
          rp.mesh.scale.set(curScale * 1.35, 1, curScale * 0.88);
          rp.mesh.material.opacity = rp.initOpacity * (1.0 - Math.pow(p, 1.3));
        }
      }

      // 6. Update Water Splash Droplets (Gravity physics)
      for (let i = splashDrops.length - 1; i >= 0; i--) {
        const d = splashDrops[i];
        d.age += dt;
        if (d.age >= d.maxAge) {
          scene.remove(d.mesh);
          splashDrops.splice(i, 1);
        } else {
          d.vy -= 9.2 * dt; // Gravity
          d.mesh.position.x += d.vx * dt;
          d.mesh.position.y += d.vy * dt;
          d.mesh.position.z += d.vz * dt;
        }
      }

      // 7. Gentle Wind Sway on Foliage & Wildflowers
      for (let i = 0; i < swayingPlants.length; i++) {
        const sp = swayingPlants[i];
        sp.group.rotation.z = sp.baseRotZ + Math.sin(elapsed * sp.speed + sp.phase) * 0.035;
        sp.group.rotation.x = sp.baseRotX + Math.cos(elapsed * sp.speed * 0.8 + sp.phase) * 0.025;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    env.listen('resize', () => {
      camera.aspect = env.W() / env.H();
      camera.updateProjectionMatrix();
      renderer.setSize(env.W(), env.H());
    });

    animate();
  
  return () => { __scene.dispose(); __runtime.dispose(); };
}
