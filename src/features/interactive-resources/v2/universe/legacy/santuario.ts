// @ts-nocheck — cena portada do HTML original (santuario); o motor é legado e foi preservado.
import { createLegacyRuntime, createSceneEnv, type SceneEnv } from "./three-legacy";

/** Monta a cena dentro de `root` (que contém a interface com os mesmos ids). Devolve a limpeza. */
export function mount(root: HTMLElement): () => void {
  const __runtime = createLegacyRuntime();
  const THREE = __runtime.THREE;
  const __scene = createSceneEnv(root);
  const env: SceneEnv = __scene.env;

    (function () {
      'use strict';

      // ==========================================
      // 1. STATE & PARAMETERS
      // ==========================================
      const state = {
        smokeDensity: 1.0,
        fireIntensity: 1.0,
        sunIntensity: 1.0,
        glowIntensity: 1.0,
        breezeStrength: 1.0,
        autoOrbit: false,
        breathingGuide: true,
        audioActive: false,
        uiOpen: true,
        bowlRingTime: -10
      };

      const cameraPresets = {
        photo:   { pos: [0.0, 2.05, 6.25], target: [0.0, 1.48, -1.2] },
        incense: { pos: [-1.15, 1.42, 4.95], target: [-1.85, 0.98, 3.25] },
        altar:   { pos: [0.0, 2.15, 1.35], target: [0.0, 1.65, -3.55] },
        window:  { pos: [-1.2, 2.25, 3.4], target: [-4.6, 2.35, -1.6] },
        circle:  { pos: [0.0, 3.85, 4.35], target: [0.0, 0.35, 0.45] }
      };

      let activeCamTransition = null;

      // ==========================================
      // 2. PROCEDURAL HIGH-RES TEXTURE GENERATORS
      // ==========================================

      // 2.1 Purple & Gold Ornate Mandala Tapestry Texture
      function createMandalaTapestryTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Deep purple fabric base with subtle radial warmth
        const bgGrad = ctx.createRadialGradient(512, 512, 40, 512, 512, 700);
        bgGrad.addColorStop(0, '#5c3148');
        bgGrad.addColorStop(0.45, '#42223b');
        bgGrad.addColorStop(0.85, '#2d172b');
        bgGrad.addColorStop(1, '#211020');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Subtle woven textile grain
        ctx.fillStyle = 'rgba(255, 210, 150, 0.025)';
        for (let i = 0; i < 4000; i++) {
          ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
        }

        // Ornate border frame
        ctx.strokeStyle = '#d99b52';
        ctx.lineWidth = 6;
        ctx.strokeRect(22, 22, 980, 980);
        ctx.strokeStyle = 'rgba(235, 180, 105, 0.55)';
        ctx.lineWidth = 2;
        ctx.strokeRect(36, 36, 952, 952);

        // Draw concentric lotus mandala rings
        ctx.save();
        ctx.translate(512, 512);

        const rings = [
          { r: 440, petals: 32, style: '#c98844', lw: 2.2 },
          { r: 390, petals: 24, style: '#e5a85b', lw: 2.6 },
          { r: 335, petals: 24, style: '#d49248', lw: 2.2 },
          { r: 275, petals: 16, style: '#f2ba6d', lw: 3.0 },
          { r: 215, petals: 16, style: '#df9e50', lw: 2.5 },
          { r: 155, petals: 12, style: '#f6c57a', lw: 2.8 },
          { r: 100, petals: 12, style: '#e5a85b', lw: 2.2 },
          { r: 52,  petals: 8,  style: '#ffd48a', lw: 2.5 }
        ];

        rings.forEach((ring, idx) => {
          // Base circle
          ctx.beginPath();
          ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = ring.style;
          ctx.lineWidth = ring.lw;
          ctx.stroke();

          // Beaded dot ring
          const dots = ring.petals * 2;
          ctx.fillStyle = '#f5c276';
          for (let d = 0; d < dots; d++) {
            const a = (d / dots) * Math.PI * 2;
            const dx = Math.cos(a) * (ring.r - 8);
            const dy = Math.sin(a) * (ring.r - 8);
            ctx.beginPath();
            ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Lotus petals
          const prevR = idx < rings.length - 1 ? rings[idx + 1].r : 16;
          for (let p = 0; p < ring.petals; p++) {
            const angle = (p / ring.petals) * Math.PI * 2;
            const step = (Math.PI * 2) / ring.petals;
            ctx.save();
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(prevR, 0);
            ctx.quadraticCurveTo(
              (prevR + ring.r) * 0.55,
              Math.tan(step * 0.42) * ring.r * 0.55,
              ring.r,
              0
            );
            ctx.quadraticCurveTo(
              (prevR + ring.r) * 0.55,
              -Math.tan(step * 0.42) * ring.r * 0.55,
              prevR,
              0
            );
            ctx.strokeStyle = ring.style;
            ctx.lineWidth = ring.lw;
            ctx.stroke();

            // Inner petal fill glow
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(235, 168, 84, 0.12)' : 'rgba(180, 105, 65, 0.14)';
            ctx.fill();

            // Inner decorative rib
            ctx.beginPath();
            ctx.moveTo(prevR + 6, 0);
            ctx.lineTo(ring.r - 8, 0);
            ctx.strokeStyle = 'rgba(255, 215, 145, 0.45)';
            ctx.lineWidth = 1.1;
            ctx.stroke();

            ctx.restore();
          }
        });

        // Corner floral arabesques
        for (let c = 0; c < 4; c++) {
          ctx.save();
          ctx.rotate((c * Math.PI) / 2);
          ctx.translate(395, 395);
          ctx.strokeStyle = '#d8974e';
          ctx.lineWidth = 2.2;
          for (let k = 0; k < 7; k++) {
            ctx.beginPath();
            ctx.arc(0, 0, 22 + k * 14, Math.PI * 0.65, Math.PI * 1.85);
            ctx.stroke();
          }
          ctx.restore();
        }

        ctx.restore();
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 4;
        return tex;
      }

      // 2.2 Woven Jute Circular Mandala Rug Texture
      function createJuteRugTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.translate(512, 512);

        // Base golden-beige braided jute
        const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, 500);
        grad.addColorStop(0, '#c89d6c');
        grad.addColorStop(0.55, '#b88b58');
        grad.addColorStop(0.92, '#a37646');
        grad.addColorStop(1, '#7d5630');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 500, 0, Math.PI * 2);
        ctx.fill();

        // Braided concentric jute rings
        for (let r = 12; r < 496; r += 6) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.strokeStyle = r % 12 === 0 ? 'rgba(90, 55, 28, 0.35)' : 'rgba(245, 215, 175, 0.22)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Purple-brown printed mandala motif on the rug (matching photo)
        const rugRings = [
          { r: 465, petals: 28 },
          { r: 375, petals: 16 },
          { r: 270, petals: 12 },
          { r: 165, petals: 12 },
          { r: 80,  petals: 8 }
        ];

        rugRings.forEach((ring, i) => {
          ctx.beginPath();
          ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(72, 46, 56, 0.68)';
          ctx.lineWidth = 5;
          ctx.stroke();

          const innerR = i < rugRings.length - 1 ? rugRings[i + 1].r : 15;
          for (let p = 0; p < ring.petals; p++) {
            const a = (p / ring.petals) * Math.PI * 2;
            const step = (Math.PI * 2) / ring.petals;
            ctx.save();
            ctx.rotate(a);
            ctx.beginPath();
            ctx.moveTo(innerR, 0);
            ctx.quadraticCurveTo((innerR + ring.r) * 0.55, step * ring.r * 0.38, ring.r, 0);
            ctx.quadraticCurveTo((innerR + ring.r) * 0.55, -step * ring.r * 0.38, innerR, 0);
            ctx.fillStyle = i % 2 === 0 ? 'rgba(82, 50, 62, 0.36)' : 'rgba(235, 205, 168, 0.24)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(65, 38, 48, 0.72)';
            ctx.lineWidth = 3.2;
            ctx.stroke();
            ctx.restore();
          }
        });

        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 4;
        return tex;
      }

      // 2.3 Hardwood Plank Floor Texture + Window Sunbeams Baked & Dynamic
      function createWoodFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#6e472b';
        ctx.fillRect(0, 0, 1024, 1024);

        const planks = 16;
        const plankH = 1024 / planks;
        for (let i = 0; i < planks; i++) {
          const y = i * plankH;
          const hueShift = (Math.sin(i * 2.3) * 10) | 0;
          ctx.fillStyle = `rgb(${112 + hueShift}, ${71 + (hueShift >> 1)}, ${43 + (hueShift >> 2)})`;
          ctx.fillRect(0, y, 1024, plankH - 2);

          // Plank seam
          ctx.fillStyle = 'rgba(35, 18, 8, 0.65)';
          ctx.fillRect(0, y + plankH - 2, 1024, 2);

          // Vertical plank joints
          const jointX = ((i * 317) % 820) + 100;
          ctx.fillRect(jointX, y, 2, plankH);

          // Wood grain streaks
          ctx.strokeStyle = 'rgba(48, 25, 12, 0.16)';
          ctx.lineWidth = 1.5;
          for (let g = 0; g < 8; g++) {
            ctx.beginPath();
            const gy = y + (g + 0.5) * (plankH / 8);
            ctx.moveTo(0, gy);
            ctx.bezierCurveTo(340, gy + Math.sin(g) * 4, 680, gy - Math.cos(g) * 4, 1024, gy);
            ctx.stroke();
          }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 3);
        return tex;
      }

      // 2.4 7-Chakra Vertical Banner Texture (Right Wall)
      function createChakraBannerTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 0, 768);
        grad.addColorStop(0.0, '#2c1644');  // Crown / Third Eye
        grad.addColorStop(0.22, '#342458');
        grad.addColorStop(0.38, '#2d425a'); // Throat
        grad.addColorStop(0.54, '#3c5442'); // Heart
        grad.addColorStop(0.70, '#7c5c2a'); // Solar Plexus
        grad.addColorStop(0.85, '#8c3b20'); // Sacral
        grad.addColorStop(1.0, '#6a1b29');  // Root
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 768);

        // Border lines
        ctx.strokeStyle = 'rgba(255, 215, 160, 0.35)';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 236, 748);

        // 7 White/Gold Sacred Geometry Lotus Symbols
        const petalsPerChakra = [24, 16, 12, 12, 10, 6, 4];
        for (let i = 0; i < 7; i++) {
          const cy = 68 + i * 104;
          ctx.save();
          ctx.translate(128, cy);
          ctx.strokeStyle = 'rgba(255, 238, 215, 0.82)';
          ctx.lineWidth = 2;

          // Outer ring
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.stroke();

          // Petals
          const n = petalsPerChakra[i];
          for (let p = 0; p < n; p++) {
            const a = (p / n) * Math.PI * 2;
            ctx.save();
            ctx.rotate(a);
            ctx.beginPath();
            ctx.moveTo(22, -5);
            ctx.quadraticCurveTo(38, 0, 44, 0);
            ctx.quadraticCurveTo(38, 0, 22, 5);
            ctx.stroke();
            ctx.restore();
          }

          // Inner sacred triangle/square
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(13, 9);
          ctx.lineTo(-13, 9);
          ctx.closePath();
          ctx.stroke();

          ctx.restore();
        }

        return new THREE.CanvasTexture(canvas);
      }

      // 2.5 Pierced Lattice Candle Holder Alpha/Emissive Texture
      function createCandleLatticeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Dark bronze metal background
        ctx.fillStyle = '#2a180d';
        ctx.fillRect(0, 0, 512, 256);

        // Glowing golden diamond lattice cutouts
        const cols = 16;
        const rows = 6;
        const cw = 512 / cols;
        const rh = 256 / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = (c + 0.5) * cw;
            const cy = (r + 0.5) * rh;
            const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, cw * 0.45);
            g.addColorStop(0, '#fff7d6');
            g.addColorStop(0.55, '#ffae42');
            g.addColorStop(1, 'rgba(42, 24, 13, 0)');
            ctx.fillStyle = g;

            ctx.beginPath();
            ctx.moveTo(cx, cy - rh * 0.38);
            ctx.lineTo(cx + cw * 0.36, cy);
            ctx.lineTo(cx, cy + rh * 0.38);
            ctx.lineTo(cx - cw * 0.36, cy);
            ctx.closePath();
            ctx.fill();
          }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        return tex;
      }

      // 2.6 Soft Volumetric Smoke Puff Sprite Texture
      function createSmokeSpriteTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
        g.addColorStop(0, 'rgba(255, 248, 240, 0.55)');
        g.addColorStop(0.35, 'rgba(235, 225, 220, 0.28)');
        g.addColorStop(0.7, 'rgba(210, 198, 195, 0.08)');
        g.addColorStop(1, 'rgba(200, 190, 190, 0.0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(canvas);
      }

      // 2.7 Warm Plaster Wall Texture
      function createPlasterWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0, '#c69e7e');
        g.addColorStop(0.5, '#d1ab8c');
        g.addColorStop(1, '#b58b6b');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 3500; i++) {
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 235, 210, 0.035)' : 'rgba(70, 40, 20, 0.035)';
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 6, 6);
        }
        return new THREE.CanvasTexture(canvas);
      }

      // ==========================================
      // 3. THREE.JS SCENE, CAMERA & RENDERER
      // ==========================================
      const container = env.$('canvas-container');
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1b100b);
      scene.fog = new THREE.FogExp2(0x24150e, 0.042);

      const camera = new THREE.PerspectiveCamera(42, env.W() / env.H(), 0.1, 60);
      camera.position.set(...cameraPresets.photo.pos);

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(env.W(), env.H());
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      container.appendChild(renderer.domElement);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(...cameraPresets.photo.target);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxPolarAngle = Math.PI * 0.485;
      controls.minPolarAngle = 0.15;
      controls.minDistance = 1.6;
      controls.maxDistance = 11.5;
      controls.update();

      const interactables = [];

      // ==========================================
      // 4. LIGHTING SYSTEM (GOLDEN HOUR + CANDLES)
      // ==========================================
      const ambientLight = new THREE.HemisphereLight(0xffd7a8, 0x3b2316, 0.58);
      scene.add(ambientLight);

      // Golden sunset sunlight streaming through left window
      const sunLight = new THREE.DirectionalLight(0xffa947, 2.35);
      sunLight.position.set(-9.5, 4.2, 1.2);
      sunLight.target.position.set(1.2, 0.0, 0.8);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 22;
      sunLight.shadow.camera.left = -7;
      sunLight.shadow.camera.right = 7;
      sunLight.shadow.camera.top = 6;
      sunLight.shadow.camera.bottom = -4;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);
      scene.add(sunLight.target);

      // Warm fill lights for the room
      const lotusLight = new THREE.PointLight(0xffb84d, 1.45, 5.5, 1.8);
      lotusLight.position.set(0, 1.28, -3.38);
      scene.add(lotusLight);

      const bowlFlameLight = new THREE.PointLight(0xff9933, 1.15, 4.5, 2.0);
      bowlFlameLight.position.set(0.95, 1.48, -3.45);
      scene.add(bowlFlameLight);

      const saltLampLight = new THREE.PointLight(0xff7b29, 1.65, 5.5, 1.8);
      saltLampLight.position.set(3.28, 0.82, -2.85);
      scene.add(saltLampLight);

      const moroccanLight = new THREE.PointLight(0xffba52, 1.35, 6.5, 1.6);
      moroccanLight.position.set(2.85, 4.25, -2.55);
      scene.add(moroccanLight);

      const fgCandleLight = new THREE.PointLight(0xffa033, 1.55, 4.2, 1.8);
      fgCandleLight.position.set(-1.62, 1.08, 3.22);
      scene.add(fgCandleLight);

      const leftVotiveLight = new THREE.PointLight(0xff9c38, 0.95, 3.5, 2.0);
      leftVotiveLight.position.set(-2.15, 0.42, -2.55);
      scene.add(leftVotiveLight);

      // ==========================================
      // 5. ROOM ARCHITECTURE & SUNSET BACKDROP
      // ==========================================
      const plasterTex = createPlasterWallTexture();
      const woodFloorTex = createWoodFloorTexture();

      // Floor
      const floorGeo = new THREE.PlaneGeometry(14, 14);
      const floorMat = new THREE.MeshStandardMaterial({
        map: woodFloorTex,
        roughness: 0.42,
        metalness: 0.08
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Back wall
      const wallMat = new THREE.MeshStandardMaterial({
        map: plasterTex,
        roughness: 0.88,
        metalness: 0.02
      });
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 6.8), wallMat);
      backWall.position.set(0, 3.4, -4.2);
      backWall.receiveShadow = true;
      scene.add(backWall);

      // Right wall
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(11, 6.8), wallMat);
      rightWall.position.set(5.4, 3.4, 0.8);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.receiveShadow = true;
      scene.add(rightWall);

      // Left wall around window
      const leftWallGroup = new THREE.Group();
      // Back section of left wall (where dreamcatcher hangs)
      const leftWallBack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 6.8, 3.6), wallMat);
      leftWallBack.position.set(-4.8, 3.4, -2.45);
      leftWallBack.receiveShadow = true;
      leftWallGroup.add(leftWallBack);

      // Low windowsill ledge along the window
      const windowLedge = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 1.35, 6.2),
        new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.78 })
      );
      windowLedge.position.set(-4.72, 0.675, 2.35);
      windowLedge.receiveShadow = true;
      windowLedge.castShadow = true;
      leftWallGroup.add(windowLedge);

      // Wooden window frame grid (left side)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.55 });
      const windowMuntins = new THREE.Group();
      windowMuntins.position.set(-4.82, 3.35, 2.1);

      // Vertical posts
      [-2.6, -1.3, 0.0, 1.3, 2.6].forEach(zPos => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.1, 0.1), frameMat);
        post.position.set(0, 0, zPos);
        post.castShadow = true;
        windowMuntins.add(post);
      });
      // Horizontal transoms
      [-1.95, -0.65, 0.65, 1.95].forEach(yPos => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 5.3), frameMat);
        bar.position.set(0, yPos, 0);
        bar.castShadow = true;
        windowMuntins.add(bar);
      });
      leftWallGroup.add(windowMuntins);
      scene.add(leftWallGroup);

      // Outside Golden Sunset Backdrop + Foliage silhouettes outside window
      const skyCanvas = document.createElement('canvas');
      skyCanvas.width = 512;
      skyCanvas.height = 512;
      const sCtx = skyCanvas.getContext('2d');
      const sGrad = sCtx.createLinearGradient(0, 0, 0, 512);
      sGrad.addColorStop(0, '#ff9a3c');
      sGrad.addColorStop(0.45, '#ffc966');
      sGrad.addColorStop(0.75, '#ffe89e');
      sGrad.addColorStop(1, '#8c5a2b');
      sCtx.fillStyle = sGrad;
      sCtx.fillRect(0, 0, 512, 512);
      // Sun glow orb
      const sunOrb = sCtx.createRadialGradient(290, 290, 10, 290, 290, 180);
      sunOrb.addColorStop(0, 'rgba(255, 255, 230, 1)');
      sunOrb.addColorStop(0.4, 'rgba(255, 200, 90, 0.6)');
      sunOrb.addColorStop(1, 'rgba(255, 160, 50, 0)');
      sCtx.fillStyle = sunOrb;
      sCtx.fillRect(0, 0, 512, 512);

      const skyBackdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(9.0, 6.5),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(skyCanvas) })
      );
      skyBackdrop.position.set(-6.8, 3.4, 2.0);
      skyBackdrop.rotation.y = Math.PI / 2;
      scene.add(skyBackdrop);

      // Sun Patch Projections on the wooden floor (matching photo's golden window bars)
      const sunPatchGroup = new THREE.Group();
      const patchMat = new THREE.MeshBasicMaterial({
        color: 0xffb84d,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      for (let i = 0; i < 4; i++) {
        const patch = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.42), patchMat);
        patch.rotation.x = -Math.PI / 2;
        patch.rotation.z = -0.32;
        patch.position.set(-0.35 + i * 0.48, 0.008, 2.55 + i * 0.28);
        sunPatchGroup.add(patch);
      }
      scene.add(sunPatchGroup);

      // ==========================================
      // 6. CENTER MANDALA TAPESTRY & ALTAR CREDENZA
      // ==========================================
      const mandalaTex = createMandalaTapestryTexture();
      const tapestryGeo = new THREE.PlaneGeometry(4.45, 4.35, 24, 24);
      // Slight fabric wave distortion
      const posAttr = tapestryGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        posAttr.setZ(i, Math.sin(vx * 3.5) * 0.015 + Math.cos(vy * 2.5) * 0.01);
      }
      tapestryGeo.computeVertexNormals();

      const tapestryMat = new THREE.MeshStandardMaterial({
        map: mandalaTex,
        roughness: 0.85,
        metalness: 0.08
      });
      const tapestry = new THREE.Mesh(tapestryGeo, tapestryMat);
      tapestry.position.set(0, 3.22, -4.14);
      tapestry.receiveShadow = true;
      scene.add(tapestry);

      // Wooden Altar Credenza (Low Dark Wood Console)
      const altarGroup = new THREE.Group();
      altarGroup.position.set(0, 0, -3.58);
      const darkWoodMat = new THREE.MeshStandardMaterial({
        color: 0x3d2212,
        roughness: 0.52,
        metalness: 0.06
      });
      const altarBody = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.88, 0.82), darkWoodMat);
      altarBody.position.y = 0.44;
      altarBody.castShadow = true;
      altarBody.receiveShadow = true;
      altarGroup.add(altarBody);

      const altarTop = new THREE.Mesh(new THREE.BoxGeometry(4.62, 0.07, 0.88), darkWoodMat);
      altarTop.position.y = 0.91;
      altarTop.castShadow = true;
      altarTop.receiveShadow = true;
      altarGroup.add(altarTop);

      // Subtle drawer panel seams on the altar
      for (let d = -1; d <= 1; d++) {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(1.36, 0.68, 0.02),
          new THREE.MeshStandardMaterial({ color: 0x311a0d, roughness: 0.6 })
        );
        panel.position.set(d * 1.44, 0.44, 0.415);
        altarGroup.add(panel);
      }
      scene.add(altarGroup);

      // ==========================================
      // 7. SCULPTED BUDDHA STATUE & GLOWING LOTUS
      // ==========================================
      const buddhaGroup = new THREE.Group();
      buddhaGroup.position.set(0, 0.95, -3.55);
      buddhaGroup.userData = { name: 'Estátua de Buda em Meditação (Dhyana Mudra)', type: 'buddha' };

      const bronzeMat = new THREE.MeshStandardMaterial({
        color: 0x593d25,
        roughness: 0.36,
        metalness: 0.62
      });

      // Lotus pedestal base
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.12, 32), bronzeMat);
      pedestal.position.y = 0.06;
      pedestal.castShadow = true;
      buddhaGroup.add(pedestal);

      // Crossed legs (Padmasana)
      const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), bronzeMat);
      leftKnee.scale.set(1.75, 0.55, 1.15);
      leftKnee.position.set(-0.2, 0.18, 0.05);
      leftKnee.rotation.z = -0.12;
      leftKnee.castShadow = true;
      buddhaGroup.add(leftKnee);

      const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), bronzeMat);
      rightKnee.scale.set(1.75, 0.55, 1.15);
      rightKnee.position.set(0.2, 0.18, 0.05);
      rightKnee.rotation.z = 0.12;
      rightKnee.castShadow = true;
      buddhaGroup.add(rightKnee);

      // Torso & draped robe
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.30, 0.58, 28), bronzeMat);
      torso.position.set(0, 0.52, -0.02);
      torso.scale.set(1.12, 1, 0.78);
      torso.castShadow = true;
      buddhaGroup.add(torso);

      // Broad shoulders
      const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), bronzeMat);
      shoulders.scale.set(1.38, 0.55, 0.78);
      shoulders.position.set(0, 0.77, -0.02);
      shoulders.castShadow = true;
      buddhaGroup.add(shoulders);

      // Arms & Dhyana Mudra hands resting in lap
      [-1, 1].forEach(side => {
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 16), bronzeMat);
        upperArm.position.set(side * 0.31, 0.54, 0.02);
        upperArm.rotation.z = side * 0.28;
        upperArm.rotation.x = 0.22;
        upperArm.castShadow = true;
        buddhaGroup.add(upperArm);

        const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 16), bronzeMat);
        forearm.position.set(side * 0.17, 0.31, 0.14);
        forearm.rotation.z = side * 1.25;
        forearm.rotation.y = -side * 0.35;
        buddhaGroup.add(forearm);
      });

      const mudraHands = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), bronzeMat);
      mudraHands.scale.set(1.4, 0.55, 0.9);
      mudraHands.position.set(0, 0.27, 0.2);
      buddhaGroup.add(mudraHands);

      // Neck & Serene Head
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.1, 16), bronzeMat);
      neck.position.set(0, 0.92, -0.01);
      buddhaGroup.add(neck);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 28, 24), bronzeMat);
      head.scale.set(0.92, 1.12, 0.95);
      head.position.set(0, 1.09, 0.0);
      head.castShadow = true;
      buddhaGroup.add(head);

      // Elongated earlobes
      [-1, 1].forEach(side => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), bronzeMat);
        ear.scale.set(0.45, 1.9, 0.6);
        ear.position.set(side * 0.155, 1.05, 0.0);
        buddhaGroup.add(ear);
      });

      // Ushnisha (top hair knot) + Spire
      const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), bronzeMat);
      ushnisha.position.set(0, 1.27, -0.01);
      buddhaGroup.add(ushnisha);

      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.08, 12), bronzeMat);
      spire.position.set(0, 1.35, -0.01);
      buddhaGroup.add(spire);

      scene.add(buddhaGroup);
      interactables.push(head, torso);
      head.userData = buddhaGroup.userData;
      torso.userData = buddhaGroup.userData;

      // Glowing Lotus Lamp directly in front of the Buddha
      const lotusGroup = new THREE.Group();
      lotusGroup.position.set(0, 0.96, -3.22);
      const lotusPetalMat = new THREE.MeshStandardMaterial({
        color: 0xfff3d1,
        emissive: 0xffae38,
        emissiveIntensity: 1.45,
        roughness: 0.25,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide
      });

      // Two rings of glowing lotus petals
      for (let ring = 0; ring < 2; ring++) {
        const count = ring === 0 ? 10 : 8;
        const tilt = ring === 0 ? 0.85 : 0.42;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + ring * 0.3;
          const petalGeo = new THREE.ConeGeometry(0.068, 0.21, 5);
          const petal = new THREE.Mesh(petalGeo, lotusPetalMat);
          petal.position.set(Math.cos(a) * 0.08, 0.06, Math.sin(a) * 0.08);
          petal.rotation.y = -a + Math.PI / 2;
          petal.rotation.x = tilt;
          lotusGroup.add(petal);
        }
      }
      const lotusCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffe0 })
      );
      lotusCore.position.y = 0.07;
      lotusGroup.add(lotusCore);
      scene.add(lotusGroup);

      // ==========================================
      // 8. AMETHYST GEODE & TIBETAN SINGING BOWL + MALA
      // ==========================================
      // 8.1 Amethyst Geode (Left of Buddha on Altar)
      const geodeGroup = new THREE.Group();
      geodeGroup.position.set(-0.92, 0.95, -3.52);

      // Outer basalt rock shell
      const outerGeo = new THREE.ConeGeometry(0.24, 0.56, 7);
      const outerRockMat = new THREE.MeshStandardMaterial({ color: 0x2c242d, roughness: 0.85 });
      const outerRock = new THREE.Mesh(outerGeo, outerRockMat);
      outerRock.position.y = 0.28;
      outerRock.scale.set(1.0, 1.0, 0.65);
      outerRock.castShadow = true;
      geodeGroup.add(outerRock);

      // Inner sparkling purple crystal cavity
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x7e38b7,
        emissive: 0x3b125e,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.35
      });
      for (let c = 0; c < 28; c++) {
        const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.032 + (c % 3) * 0.012, 0), crystalMat);
        const row = Math.floor(c / 5);
        const col = (c % 5) - 2;
        cr.position.set(col * 0.048, 0.09 + row * 0.075, 0.08);
        cr.rotation.set(c * 0.7, c * 1.1, c * 0.4);
        geodeGroup.add(cr);
      }
      scene.add(geodeGroup);

      // Glass Votive Candle next to Amethyst Geode
      const altarVotive = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.08, 0.22, 20),
        new THREE.MeshStandardMaterial({
          color: 0xffd9b3,
          emissive: 0xff9436,
          emissiveIntensity: 0.85,
          transparent: true,
          opacity: 0.82,
          roughness: 0.2
        })
      );
      altarVotive.position.set(-1.35, 1.06, -3.48);
      scene.add(altarVotive);

      // 8.2 Tibetan Singing Bowl with Live Flame & Japamala Beads (Right of Buddha)
      const bowlGroup = new THREE.Group();
      bowlGroup.position.set(0.95, 0.95, -3.45);
      bowlGroup.userData = { name: 'Tigela Tibetana de Bronze (Clique para tocar)', type: 'bowl' };

      const brassBowlMat = new THREE.MeshStandardMaterial({
        color: 0xb88038,
        roughness: 0.26,
        metalness: 0.82
      });
      const singingBowl = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 32, 20, 0, Math.PI * 2, Math.PI * 0.28, Math.PI * 0.72),
        brassBowlMat
      );
      singingBowl.position.y = 0.18;
      singingBowl.castShadow = true;
      singingBowl.userData = bowlGroup.userData;
      bowlGroup.add(singingBowl);
      interactables.push(singingBowl);

      //Japamala prayer beads hanging over the altar edge below the bowl
      const beadMat = new THREE.MeshStandardMaterial({ color: 0xa66e44, roughness: 0.55 });
      for (let b = 0; b < 26; b++) {
        const t = b / 25;
        const bx = Math.sin(t * Math.PI) * 0.16 - 0.04;
        const by = -Math.sin(t * Math.PI) * 0.34 + 0.02;
        const bz = 0.22 + Math.sin(t * Math.PI) * 0.08;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), beadMat);
        bead.position.set(bx, by, bz);
        bowlGroup.add(bead);
      }
      // Tassel at bottom of Japamala
      const tassel = new THREE.Mesh(
        new THREE.ConeGeometry(0.028, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0xd8bda0, roughness: 0.8 })
      );
      tassel.position.set(-0.04, -0.37, 0.28);
      bowlGroup.add(tassel);

      scene.add(bowlGroup);

      // ==========================================
      // 9. ANIMATED FLAMES (BOWL, VOTIVES & LANTERN)
      // ==========================================
      const flames = [];
      function createFlameMesh(x, y, z, scale = 1.0) {
        const flameGroup = new THREE.Group();
        flameGroup.position.set(x, y, z);

        const outerFlame = new THREE.Mesh(
          new THREE.ConeGeometry(0.042 * scale, 0.16 * scale, 14),
          new THREE.MeshBasicMaterial({
            color: 0xff8c1a,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending
          })
        );
        outerFlame.position.y = 0.08 * scale;
        flameGroup.add(outerFlame);

        const innerCore = new THREE.Mesh(
          new THREE.ConeGeometry(0.022 * scale, 0.10 * scale, 12),
          new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.95
          })
        );
        innerCore.position.y = 0.05 * scale;
        flameGroup.add(innerCore);

        scene.add(flameGroup);
        flames.push({ group: flameGroup, outer: outerFlame, inner: innerCore, baseScale: scale, phase: Math.random() * 10 });
        return flameGroup;
      }

      // Add flames to all candles and bowls in the photo
      createFlameMesh(0.95, 1.18, -3.45, 1.35);  // Singing bowl fire on altar
      createFlameMesh(-1.35, 1.16, -3.48, 0.75); // Altar glass votive
      createFlameMesh(-1.62, 0.96, 3.22, 1.15);  // Foreground pierced lantern
      createFlameMesh(-2.35, 0.22, -2.85, 0.90); // Left floor lantern 1
      createFlameMesh(-1.95, 0.14, -2.05, 0.75); // Left floor votive 2
      createFlameMesh(2.25, 0.18, -2.95, 0.85);  // Right floor votive

      // ==========================================
      // 10. FOREGROUND LEFT TABLE, INCENSE & VOLUMETRIC SMOKE
      // ==========================================
      const fgTableGroup = new THREE.Group();
      fgTableGroup.position.set(-1.82, 0, 3.28);

      const fgTableTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.82, 0.92),
        new THREE.MeshStandardMaterial({ color: 0x6e4427, roughness: 0.48 })
      );
      fgTableTop.position.y = 0.41;
      fgTableTop.castShadow = true;
      fgTableTop.receiveShadow = true;
      fgTableGroup.add(fgTableTop);

      // Circular wooden tray on top of foreground table
      const woodenTray = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.035, 36),
        new THREE.MeshStandardMaterial({ color: 0x543118, roughness: 0.45 })
      );
      woodenTray.position.set(0.04, 0.835, -0.02);
      woodenTray.receiveShadow = true;
      fgTableGroup.add(woodenTray);

      const trayRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.335, 0.018, 12, 36),
        new THREE.MeshStandardMaterial({ color: 0x472812, roughness: 0.45 })
      );
      trayRim.rotation.x = Math.PI / 2;
      trayRim.position.set(0.04, 0.855, -0.02);
      fgTableGroup.add(trayRim);

      // Pierced Metal Lattice Candle Holder on Foreground Tray
      const latticeTex = createCandleLatticeTexture();
      const fgLantern = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.115, 0.29, 28),
        new THREE.MeshStandardMaterial({
          map: latticeTex,
          emissiveMap: latticeTex,
          emissive: 0xff9d3b,
          emissiveIntensity: 1.55,
          roughness: 0.35,
          metalness: 0.5
        })
      );
      fgLantern.position.set(0.18, 0.99, -0.05);
      fgLantern.castShadow = true;
      fgLantern.userData = { name: 'Lanterna Rendada Acesa', type: 'candle' };
      fgTableGroup.add(fgLantern);
      interactables.push(fgLantern);

      // Dark Ceramic Incense Pot + Glowing Ember Stick
      const incensePot = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 24, 18),
        new THREE.MeshStandardMaterial({ color: 0x2b1d16, roughness: 0.32, metalness: 0.25 })
      );
      incensePot.scale.set(1.15, 0.78, 1.15);
      incensePot.position.set(-0.08, 0.92, 0.06);
      incensePot.castShadow = true;
      incensePot.userData = { name: 'Queimador de Incenso Zen', type: 'incense' };
      fgTableGroup.add(incensePot);
      interactables.push(incensePot);

      const incenseNeck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.055, 0.05, 18),
        new THREE.MeshStandardMaterial({ color: 0x3b261a, roughness: 0.35 })
      );
      incenseNeck.position.set(-0.08, 0.99, 0.06);
      fgTableGroup.add(incenseNeck);

      // Incense stick + glowing red tip
      const incenseStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.14, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3c24 })
      );
      incenseStick.position.set(-0.08, 1.05, 0.06);
      incenseStick.rotation.z = -0.06;
      fgTableGroup.add(incenseStick);

      const emberTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.009, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xff4500 })
      );
      emberTip.position.set(-0.076, 1.12, 0.06);
      fgTableGroup.add(emberTip);

      scene.add(fgTableGroup);

      // Volumetric Swirling Incense Smoke Ribbon + Puff Particles
      const smokeOrigin = new THREE.Vector3(-1.896, 1.13, 3.34);
      const smokeTex = createSmokeSpriteTexture();
      const smokePuffs = [];
      const SMOKE_COUNT = 75;

      for (let i = 0; i < SMOKE_COUNT; i++) {
        const mat = new THREE.SpriteMaterial({
          map: smokeTex,
          color: 0xf5ece6,
          transparent: true,
          opacity: 0.0,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        scene.add(sprite);
        smokePuffs.push({
          sprite,
          mat,
          age: (i / SMOKE_COUNT) * 6.5,
          maxLife: 6.5,
          seed: Math.random() * 100
        });
      }

      // ==========================================
      // 11. CENTER RUG & 6 MEDITATION CUSHIONS
      // ==========================================
      const rugTex = createJuteRugTexture();
      const centerRug = new THREE.Mesh(
        new THREE.CylinderGeometry(1.92, 1.92, 0.024, 64),
        new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.92, metalness: 0.02 })
      );
      centerRug.position.set(0, 0.012, 0.55);
      centerRug.receiveShadow = true;
      scene.add(centerRug);

      // Helper to create Round Purple Tufted Pouf (Zafu)
      function createPurplePouf(x, z, rotY = 0) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.rotation.y = rotY;

        const poufMat = new THREE.MeshStandardMaterial({
          color: 0x522b47,
          roughness: 0.88,
          metalness: 0.03
        });

        const bodyGeo = new THREE.SphereGeometry(0.48, 36, 24);
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const px = pos.getX(i);
          const py = pos.getY(i);
          const pz = pos.getZ(i);
          const angle = Math.atan2(pz, px);
          const pleat = 1.0 + Math.sin(angle * 16) * 0.018;
          const rDist = Math.sqrt(px * px + pz * pz);
          // Center button tuft depression
          const tuftDip = rDist < 0.18 ? (0.18 - rDist) * 0.35 : 0;
          pos.setXYZ(i, px * pleat, (py * 0.44) - Math.sign(py) * tuftDip, pz * pleat);
        }
        bodyGeo.computeVertexNormals();

        const mesh = new THREE.Mesh(bodyGeo, poufMat);
        mesh.position.y = 0.20;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        scene.add(group);
        return group;
      }

      // Helper to create Square Beige Linen Floor Pillow
      function createBeigePillow(x, z, rotY = 0) {
        const geo = new THREE.BoxGeometry(0.84, 0.24, 0.84, 18, 8, 18);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const px = pos.getX(i);
          const py = pos.getY(i);
          const pz = pos.getZ(i);
          // Bulge center like a plump linen pillow with pinched corners
          const nx = px / 0.42;
          const nz = pz / 0.42;
          const dome = Math.cos(nx * Math.PI * 0.46) * Math.cos(nz * Math.PI * 0.46);
          pos.setY(i, py * (0.25 + 0.95 * dome));
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          color: 0xc5a88c,
          roughness: 0.86,
          metalness: 0.02
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0.13, z);
        mesh.rotation.y = rotY;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        return mesh;
      }

      // Exact placement of the 6 cushions around the rug matching the reference photo
      createPurplePouf(-0.08, -1.62, 0.2);  // Back center purple pouf
      createPurplePouf(-2.15, 0.62, 0.5);   // Left purple pouf
      createPurplePouf(2.18, 0.68, -0.4);   // Right purple pouf

      createBeigePillow(-1.68, -0.78, 0.42); // Back-left beige pillow
      createBeigePillow(1.68, -0.72, -0.38); // Back-right beige pillow
      createBeigePillow(-1.05, 1.98, 0.28);  // Front-left beige pillow
      createBeigePillow(1.18, 1.92, -0.32);  // Front-right beige pillow

      // ==========================================
      // 12. RIGHT SIDE: MOROCCAN LANTERN, SALT LAMP, CHAKRA BANNER & PLANT
      // ==========================================
      // 12.1 Hanging Moroccan Pierced Brass Lantern
      const moroccanGroup = new THREE.Group();
      moroccanGroup.position.set(2.85, 4.35, -2.55);

      const chain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 1.3, 8),
        brassBowlMat
      );
      chain.position.y = 0.85;
      moroccanGroup.add(chain);

      const lanternDomeTop = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.26, 16),
        brassBowlMat
      );
      lanternDomeTop.position.y = 0.24;
      moroccanGroup.add(lanternDomeTop);

      const lanternCage = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.20, 0.46, 16),
        new THREE.MeshStandardMaterial({
          map: latticeTex,
          emissiveMap: latticeTex,
          emissive: 0xffb347,
          emissiveIntensity: 1.85,
          roughness: 0.3,
          metalness: 0.7
        })
      );
      moroccanGroup.add(lanternCage);

      const lanternFinial = new THREE.Mesh(
        new THREE.ConeGeometry(0.20, 0.24, 16),
        brassBowlMat
      );
      lanternFinial.rotation.x = Math.PI;
      lanternFinial.position.y = -0.34;
      moroccanGroup.add(lanternFinial);

      scene.add(moroccanGroup);

      // 12.2 Himalayan Salt Lamp (Glowing Amber-Pink Crystal Rock)
      const saltLampGroup = new THREE.Group();
      saltLampGroup.position.set(3.28, 0, -2.85);
      saltLampGroup.userData = { name: 'Luminária de Sal do Himalaia', type: 'salt' };

      const saltBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.28, 0.08, 24),
        darkWoodMat
      );
      saltBase.position.y = 0.04;
      saltLampGroup.add(saltBase);

      const saltGeo = new THREE.DodecahedronGeometry(0.34, 2);
      const sPos = saltGeo.attributes.position;
      for (let i = 0; i < sPos.count; i++) {
        const x = sPos.getX(i);
        const y = sPos.getY(i);
        const z = sPos.getZ(i);
        const taper = y > 0 ? 1.0 - y * 0.55 : 1.0;
        const noise = 1.0 + Math.sin(x * 9 + y * 7) * 0.08;
        sPos.setXYZ(i, x * taper * noise, (y + 0.34) * 1.32, z * taper * noise);
      }
      saltGeo.computeVertexNormals();

      const saltMat = new THREE.MeshStandardMaterial({
        color: 0xff944d,
        emissive: 0xff5e1a,
        emissiveIntensity: 1.35,
        roughness: 0.45
      });
      const saltRock = new THREE.Mesh(saltGeo, saltMat);
      saltRock.position.y = 0.06;
      saltRock.castShadow = true;
      saltRock.userData = saltLampGroup.userData;
      saltLampGroup.add(saltRock);
      interactables.push(saltRock);
      scene.add(saltLampGroup);

      // 12.3 7-Chakra Banner on Right Wall
      const chakraBannerGroup = new THREE.Group();
      chakraBannerGroup.position.set(5.32, 3.15, -1.55);
      chakraBannerGroup.rotation.y = -Math.PI / 2;

      const chakraTex = createChakraBannerTexture();
      const bannerCloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 2.75),
        new THREE.MeshStandardMaterial({ map: chakraTex, roughness: 0.85, side: THREE.DoubleSide })
      );
      chakraBannerGroup.add(bannerCloth);

      // Top & bottom wooden dowel rods
      [-1.38, 1.38].forEach(ry => {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.08, 12), darkWoodMat);
        rod.rotation.z = Math.PI / 2;
        rod.position.y = ry;
        chakraBannerGroup.add(rod);
      });
      scene.add(chakraBannerGroup);

      // Floor lanterns on left and right of the altar
      function createFloorLantern(x, z, h = 0.34) {
        const l = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.11, h, 24),
          new THREE.MeshStandardMaterial({
            map: latticeTex,
            emissiveMap: latticeTex,
            emissive: 0xff9a33,
            emissiveIntensity: 1.25,
            roughness: 0.4
          })
        );
        l.position.set(x, h / 2, z);
        l.castShadow = true;
        scene.add(l);
      }
      createFloorLantern(-2.35, -2.85, 0.36);
      createFloorLantern(-1.95, -2.05, 0.24);
      createFloorLantern(2.25, -2.95, 0.28);

      // ==========================================
      // 13. DREAMCATCHER ON LEFT WALL
      // ==========================================
      const dreamcatcherGroup = new THREE.Group();
      dreamcatcherGroup.position.set(-4.65, 3.05, -2.05);
      dreamcatcherGroup.rotation.y = Math.PI / 2;

      const hoopMat = new THREE.MeshStandardMaterial({ color: 0x8c6239, roughness: 0.7 });
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.018, 12, 48), hoopMat);
      dreamcatcherGroup.add(hoop);

      const innerHoop = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.01, 10, 32), hoopMat);
      dreamcatcherGroup.add(innerHoop);

      // Woven web spokes
      const webMat = new THREE.MeshStandardMaterial({ color: 0xd9c3a9, roughness: 0.8 });
      for (let s = 0; s < 16; s++) {
        const a = (s / 16) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.1, 6), webMat);
        spoke.rotation.z = a;
        dreamcatcherGroup.add(spoke);
      }

      // Hanging feathers (animated with breeze)
      const feathers = [];
      for (let f = -3; f <= 3; f++) {
        const fGroup = new THREE.Group();
        const hangY = -0.56 - Math.abs(f) * 0.04;
        fGroup.position.set(f * 0.14, hangY, 0);

        const cordLen = 0.38 - Math.abs(f) * 0.04;
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, cordLen, 6), webMat);
        cord.position.y = -cordLen / 2;
        fGroup.add(cord);

        const feather = new THREE.Mesh(
          new THREE.ConeGeometry(0.048, 0.42, 4),
          new THREE.MeshStandardMaterial({
            color: f % 2 === 0 ? 0xe6d2b8 : 0xb58863,
            roughness: 0.9
          })
        );
        feather.scale.set(1.0, 1.0, 0.18);
        feather.position.y = -cordLen - 0.18;
        fGroup.add(feather);

        dreamcatcherGroup.add(fGroup);
        feathers.push({ group: fGroup, phase: f * 0.7 });
      }
      scene.add(dreamcatcherGroup);

      // ==========================================
      // 14. LUSH FOLIAGE: HANGING VINES, ALTAR PLANTS & TROPICAL PLANT
      // ==========================================
      const animatedLeaves = [];
      const leafMatDark = new THREE.MeshStandardMaterial({ color: 0x284d23, roughness: 0.48, side: THREE.DoubleSide });
      const leafMatMid = new THREE.MeshStandardMaterial({ color: 0x3b692f, roughness: 0.42, side: THREE.DoubleSide });

      // Heart-shaped leaf helper
      function createLeafMesh(scale = 1.0, mat = leafMatMid) {
        const geo = new THREE.ConeGeometry(0.085 * scale, 0.18 * scale, 5);
        geo.scale(1.0, 1.0, 0.18);
        const leaf = new THREE.Mesh(geo, mat);
        leaf.castShadow = true;
        return leaf;
      }

      // 14.1 Cascading Pothos / Ivy Vines from Ceiling Left & Window Frame
      function createHangingVine(x, yTop, z, length = 3.2, leafCount = 24) {
        const vineGroup = new THREE.Group();
        vineGroup.position.set(x, yTop, z);
        for (let i = 0; i < leafCount; i++) {
          const t = i / leafCount;
          const ly = -t * length;
          const lx = Math.sin(t * 9 + x) * 0.08;
          const lz = Math.cos(t * 7 + z) * 0.08;
          const leaf = createLeafMesh(0.95 + (i % 3) * 0.2, i % 2 === 0 ? leafMatMid : leafMatDark);
          leaf.position.set(lx, ly, lz);
          leaf.rotation.set(0.6 + (i % 3) * 0.2, i * 1.4, Math.sin(i) * 0.4);
          vineGroup.add(leaf);
        }
        scene.add(vineGroup);
        animatedLeaves.push({ mesh: vineGroup, baseRotZ: 0, phase: x + z });
      }

      // Vines hanging on back-left wall & near window (matching photo)
      createHangingVine(-2.85, 5.2, -3.85, 4.7, 34);
      createHangingVine(-2.45, 5.2, -3.82, 3.8, 28);
      createHangingVine(-3.25, 5.2, -3.75, 3.2, 22);
      // Window frame vines in foreground left
      createHangingVine(-4.35, 4.8, 2.85, 3.8, 30);
      createHangingVine(-4.42, 4.8, 1.55, 3.4, 24);
      createHangingVine(-4.30, 4.8, 3.65, 3.9, 28);

      // 14.2 Altar Side Bushy Plants (Left and Right edges of Altar)
      [-1.78, 1.72].forEach((ax, idx) => {
        const potGroup = new THREE.Group();
        potGroup.position.set(ax, 0.94, -3.48);

        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.14, 0.28, 20),
          new THREE.MeshStandardMaterial({ color: 0x6b4c35, roughness: 0.75 })
        );
        pot.position.y = 0.14;
        potGroup.add(pot);

        // Trailing & bushy leaves
        for (let l = 0; l < 36; l++) {
          const leaf = createLeafMesh(1.05, l % 2 === 0 ? leafMatMid : leafMatDark);
          const angle = (l / 36) * Math.PI * 2 * 3;
          const isTrailing = l > 18;
          const r = isTrailing ? 0.16 + (l - 18) * 0.012 : 0.08 + (l % 4) * 0.05;
          const ly = isTrailing ? 0.22 - (l - 18) * 0.055 : 0.28 + (l % 5) * 0.07;
          leaf.position.set(Math.cos(angle) * r, ly, Math.sin(angle) * r + 0.06);
          leaf.rotation.set(0.5, angle, 0.3);
          potGroup.add(leaf);
        }
        scene.add(potGroup);
        animatedLeaves.push({ mesh: potGroup, baseRotZ: 0, phase: idx * 2.5 });
      });

      // 14.3 Large Tropical Peace Lily / Philodendron in Ceramic Pot on Wooden Stand (Right Side)
      const bigPlantGroup = new THREE.Group();
      bigPlantGroup.position.set(2.68, 0, -2.88);

      // Wooden tripod stand
      for (let leg = 0; leg < 3; leg++) {
        const a = (leg / 3) * Math.PI * 2;
        const standLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.42, 10), darkWoodMat);
        standLeg.position.set(Math.cos(a) * 0.22, 0.21, Math.sin(a) * 0.22);
        standLeg.rotation.z = Math.cos(a) * 0.12;
        bigPlantGroup.add(standLeg);
      }

      // Large ceramic planter pot
      const ceramicPot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.26, 0.56, 28),
        new THREE.MeshStandardMaterial({ color: 0x6e5239, roughness: 0.65 })
      );
      ceramicPot.position.y = 0.62;
      ceramicPot.castShadow = true;
      bigPlantGroup.add(ceramicPot);

      // Broad arching tropical leaves
      const foliageCluster = new THREE.Group();
      foliageCluster.position.y = 0.88;
      for (let b = 0; b < 14; b++) {
        const branch = new THREE.Group();
        const angle = (b / 14) * Math.PI * 2;
        const heightScale = 0.75 + (b % 3) * 0.28;

        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.018, 0.75 * heightScale, 8),
          leafMatDark
        );
        stem.position.y = 0.36 * heightScale;
        stem.rotation.x = 0.38 + (b % 2) * 0.18;
        branch.add(stem);

        const bigLeaf = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.68 * heightScale, 6),
          b % 2 === 0 ? leafMatMid : leafMatDark
        );
        bigLeaf.scale.set(1.0, 1.0, 0.12);
        bigLeaf.position.set(0, 0.72 * heightScale, 0.28 * heightScale);
        bigLeaf.rotation.x = 0.78;
        bigLeaf.castShadow = true;
        branch.add(bigLeaf);

        branch.rotation.y = angle;
        foliageCluster.add(branch);
      }
      bigPlantGroup.add(foliageCluster);
      scene.add(bigPlantGroup);
      animatedLeaves.push({ mesh: foliageCluster, baseRotZ: 0, phase: 4.2 });

      // ==========================================
      // 15. GOLDEN SUNLIGHT DUST MOTES (PARTICLES)
      // ==========================================
      const dustCount = 160;
      const dustGeo = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 8.5;
        dustPositions[i * 3 + 1] = 0.3 + Math.random() * 4.2;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 7.5;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0xffe0a3,
        size: 0.038,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const dustParticles = new THREE.Points(dustGeo, dustMat);
      scene.add(dustParticles);

      // ==========================================
      // 16. SYNTHESIZED WEB AUDIO (AMBIENT + TIBETAN BOWL)
      // ==========================================
      let audioCtx = null;
      let ambientGain = null;

      function initAudio() {
        if (audioCtx) return;
        audioCtx = env.audio();

        ambientGain = audioCtx.createGain();
        ambientGain.gain.value = 0.001;
        ambientGain.connect(audioCtx.destination);

        // Warm 432Hz harmonic meditation drone
        const freqs = [108, 162, 216, 324];
        freqs.forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const oscGain = audioCtx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = f;
          oscGain.gain.value = 0.045 / (idx + 1);
          osc.connect(oscGain);
          oscGain.connect(ambientGain);
          osc.start();
        });
      }

      function toggleAmbientAudio() {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        state.audioActive = !state.audioActive;
        const now = audioCtx.currentTime;
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
        ambientGain.gain.exponentialRampToValueAtTime(state.audioActive ? 0.35 : 0.0001, now + 0.8);

        env.$('audio-icon').textContent = state.audioActive ? '🔊' : '🔇';
        env.$('audio-label').textContent = state.audioActive ? 'Som Relaxante: ON' : 'Ativar Som Relaxante';
      }

      function strikeSingingBowl() {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const partials = [
          { freq: 256, amp: 0.22, decay: 5.5 },
          { freq: 512, amp: 0.12, decay: 4.2 },
          { freq: 768, amp: 0.07, decay: 3.1 },
          { freq: 1028, amp: 0.03, decay: 2.2 }
        ];

        partials.forEach(p => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(p.amp, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + p.decay + 0.05);
        });

        state.bowlRingTime = performance.now() * 0.001;
        showToast('🔔 Ressonância da Tigela Tibetana ativada');
      }

      // ==========================================
      // 17. UI EVENT HANDLERS & RAYCASTER INTERACTION
      // ==========================================
      const toastEl = env.$('interaction-toast');
      const toastText = env.$('toast-text');
      let toastTimeout = null;

      function showToast(msg) {
        toastText.textContent = msg;
        toastEl.style.opacity = '1';
        clearTimeout(toastTimeout);
        toastTimeout = env.timeout(() => {
          toastEl.style.opacity = '0';
        }, 2800);
      }

      // Camera preset navigation
      const camBtns = env.qsa('.cam-btn');
      camBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          camBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.getAttribute('data-cam');
          const preset = cameraPresets[key];
          if (preset) {
            activeCamTransition = {
              startPos: camera.position.clone(),
              endPos: new THREE.Vector3(...preset.pos),
              startTarget: controls.target.clone(),
              endTarget: new THREE.Vector3(...preset.target),
              progress: 0
            };
          }
        });
      });

      // Sliders
      function bindSlider(id, valId, stateKey) {
        const el = env.$(id);
        const valEl = env.$(valId);
        el.addEventListener('input', () => {
          const v = Number(el.value);
          state[stateKey] = v / 100;
          valEl.textContent = v + '%';
        });
      }
      bindSlider('slider-smoke', 'val-smoke', 'smokeDensity');
      bindSlider('slider-fire', 'val-fire', 'fireIntensity');
      bindSlider('slider-sun', 'val-sun', 'sunIntensity');
      bindSlider('slider-glow', 'val-glow', 'glowIntensity');
      bindSlider('slider-breeze', 'val-breeze', 'breezeStrength');

      // Buttons
      env.$('btn-bowl-strike').addEventListener('click', strikeSingingBowl);
      env.$('btn-audio-toggle').addEventListener('click', toggleAmbientAudio);

      const orbitBtn = env.$('btn-orbit-auto');
      const orbitStateSpan = env.$('orbit-state');
      orbitBtn.addEventListener('click', () => {
        state.autoOrbit = !state.autoOrbit;
        controls.autoRotate = state.autoOrbit;
        controls.autoRotateSpeed = 0.65;
        orbitStateSpan.textContent = state.autoOrbit ? 'ON' : 'OFF';
        orbitBtn.classList.toggle('active', state.autoOrbit);
      });

      const breathBtn = env.$('btn-breath-toggle');
      breathBtn.addEventListener('click', () => {
        state.breathingGuide = !state.breathingGuide;
        breathBtn.textContent = state.breathingGuide ? 'Ativo' : 'Pausado';
      });

      const drawer = env.$('control-drawer');
      env.$('btn-toggle-ui').addEventListener('click', () => {
        state.uiOpen = !state.uiOpen;
        drawer.style.opacity = state.uiOpen ? '1' : '0';
        drawer.style.pointerEvents = state.uiOpen ? 'auto' : 'none';
      });

      const modalDetails = env.$('modal-details');
      env.$('btn-ref-modal').addEventListener('click', () => {
        modalDetails.classList.remove('hidden');
        modalDetails.classList.add('flex');
      });
      env.$('btn-close-modal').addEventListener('click', () => {
        modalDetails.classList.add('hidden');
        modalDetails.classList.remove('flex');
      });

      // 3D Raycaster Click on Objects
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      renderer.domElement.addEventListener('pointerdown', (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(interactables, false);
        if (hits.length > 0) {
          const obj = hits[0].object;
          const info = obj.userData || {};
          if (info.type === 'bowl') {
            strikeSingingBowl();
          } else if (info.type === 'incense') {
            state.smokeDensity = state.smokeDensity > 1.4 ? 1.0 : 1.75;
            env.$('slider-smoke').value = Math.round(state.smokeDensity * 100);
            env.$('val-smoke').textContent = Math.round(state.smokeDensity * 100) + '%';
            showToast('💨 Espiral de fumaça do incenso intensificada');
          } else if (info.type === 'buddha') {
            showToast('🪷 "A paz vem de dentro. Não a procure à sua volta."');
          } else if (info.name) {
            showToast('✨ ' + info.name);
          }
        }
      });

      env.listen('resize', () => {
        camera.aspect = env.W() / env.H();
        camera.updateProjectionMatrix();
        renderer.setSize(env.W(), env.H());
      });

      // ==========================================
      // 18. ANIMATION LOOP (SMOKE, FLAMES, BREEZE)
      // ==========================================
      let lastTime = performance.now();
      let frameCount = 0;
      let fpsTimer = 0;
      const fpsBadge = env.$('fps-badge');
      const breathStatus = env.$('breath-status');

      function animate(nowMs) {
        env.raf(animate);

        const dt = Math.min((nowMs - lastTime) * 0.001, 0.1);
        lastTime = nowMs;
        const t = nowMs * 0.001;

        // FPS counter
        frameCount++;
        fpsTimer += dt;
        if (fpsTimer >= 0.5) {
          fpsBadge.textContent = Math.round(frameCount / fpsTimer) + ' FPS';
          frameCount = 0;
          fpsTimer = 0;
        }

        // Smooth camera preset transition
        if (activeCamTransition) {
          activeCamTransition.progress += dt * 1.65;
          const k = Math.min(activeCamTransition.progress, 1.0);
          const ease = 1 - Math.pow(1 - k, 3);
          camera.position.lerpVectors(activeCamTransition.startPos, activeCamTransition.endPos, ease);
          controls.target.lerpVectors(activeCamTransition.startTarget, activeCamTransition.endTarget, ease);
          if (k >= 1.0) activeCamTransition = null;
        }
        controls.update();

        // 1. Update Volumetric Incense Smoke Puffs (Sinuous double-curl column like the photo)
        smokePuffs.forEach((p, idx) => {
          p.age += dt * (0.72 + (idx % 5) * 0.06);
          if (p.age > p.maxLife) {
            p.age = 0;
          }
          const lifeRatio = p.age / p.maxLife;
          const height = lifeRatio * 1.48;

          // Sinuous S-curve and vortex curl matching the photo's incense smoke
          const waveX = Math.sin(height * 5.2 - t * 1.8 + p.seed * 0.15) * (0.025 + lifeRatio * 0.14);
          const waveZ = Math.cos(height * 4.4 - t * 1.5 + p.seed * 0.15) * (0.02 + lifeRatio * 0.09);

          p.sprite.position.set(
            smokeOrigin.x + waveX,
            smokeOrigin.y + height,
            smokeOrigin.z + waveZ
          );

          const scale = 0.055 + Math.pow(lifeRatio, 1.15) * 0.34;
          p.sprite.scale.set(scale, scale * 1.18, 1);

          const fadeIn = Math.min(lifeRatio * 4.5, 1.0);
          const fadeOut = Math.pow(1.0 - lifeRatio, 1.5);
          p.mat.opacity = fadeIn * fadeOut * 0.34 * state.smokeDensity;
        });

        // Glow pulse on the incense ember tip
        emberTip.material.color.setHSL(0.04, 1.0, 0.48 + Math.sin(t * 6) * 0.12);

        // 2. Update Candle & Singing Bowl Flames + Dynamic Point Lights
        flames.forEach(f => {
          const flicker = 1.0 + Math.sin(t * 14 + f.phase) * 0.12 + Math.cos(t * 23 + f.phase) * 0.08;
          const swayX = Math.sin(t * 5.5 + f.phase) * 0.08 * state.breezeStrength;
          const s = f.baseScale * Math.max(0.15, state.fireIntensity);
          f.outer.scale.set(s, s * flicker, s);
          f.inner.scale.set(s, s * (0.95 + (flicker - 1) * 0.6), s);
          f.group.rotation.z = swayX;
        });

        const fireMod = state.fireIntensity;
        fgCandleLight.intensity = ((1.55 + Math.sin(t * 11) * 0.18) * fireMod) * Math.PI;
        bowlFlameLight.intensity = ((1.15 + Math.cos(t * 13) * 0.16) * fireMod) * Math.PI;
        leftVotiveLight.intensity = ((0.95 + Math.sin(t * 9.5) * 0.12) * fireMod) * Math.PI;
        moroccanLight.intensity = ((1.35 + Math.sin(t * 7) * 0.1) * fireMod) * Math.PI;

        // 3. Update Sunset & Salt Lamp / Lotus Glow
        sunLight.intensity = (2.35 * state.sunIntensity) * Math.PI;
        patchMat.opacity = 0.24 * state.sunIntensity;

        const breathPulse = state.breathingGuide ? (0.88 + Math.sin(t * 0.9) * 0.18) : 1.0;
        saltLampLight.intensity = (1.65 * state.glowIntensity * breathPulse) * Math.PI;
        lotusLight.intensity = (1.45 * state.glowIntensity * breathPulse) * Math.PI;

        if (state.breathingGuide) {
          const cycle = t % 11;
          if (cycle < 4) breathStatus.textContent = 'Inspire profundamente pelo nariz...';
          else if (cycle < 7.5) breathStatus.textContent = 'Sustente a presença no agora...';
          else breathStatus.textContent = 'Expire soltando as tensões...';
        }

        // Singing bowl acoustic vibration visual feedback
        const ringElapsed = t - state.bowlRingTime;
        if (ringElapsed >= 0 && ringElapsed < 4.5) {
          const vib = Math.sin(t * 45) * 0.015 * (1 - ringElapsed / 4.5);
          singingBowl.scale.set(1 + vib, 1 - vib * 0.5, 1 + vib);
        } else {
          singingBowl.scale.set(1, 1, 1);
        }

        // 4. Breeze animation on plants & dreamcatcher feathers
        const bStr = state.breezeStrength;
        feathers.forEach(f => {
          f.group.rotation.z = Math.sin(t * 1.8 + f.phase) * 0.065 * bStr;
        });
        animatedLeaves.forEach(item => {
          item.mesh.rotation.z = Math.sin(t * 1.35 + item.phase) * 0.022 * bStr;
        });

        // 5. Floating golden dust motes
        const dPos = dustGeo.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          dPos[i * 3 + 1] += Math.sin(t * 0.6 + i) * 0.0008;
          dPos[i * 3] += Math.cos(t * 0.4 + i) * 0.0006 * bStr;
        }
        dustGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      }

      env.raf(animate);
    })();
  
  return () => { __scene.dispose(); __runtime.dispose(); };
}
