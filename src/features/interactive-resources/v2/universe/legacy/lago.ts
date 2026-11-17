// @ts-nocheck — cena portada do HTML original (lago); o motor é legado e foi preservado.
import { createLegacyRuntime, createSceneEnv, type SceneEnv } from "./three-legacy";

/** Monta a cena dentro de `root` (que contém a interface com os mesmos ids). Devolve a limpeza. */
export function mount(root: HTMLElement): () => void {
  const __runtime = createLegacyRuntime();
  const THREE = __runtime.THREE;
  const __scene = createSceneEnv(root);
  const env: SceneEnv = __scene.env;

    (function () {
      'use strict';

      // =========================================================================
      // 1. CURATED DATA: IMAGES + AUTHOR AFFIRMATIONS (Autoestima, Empoderamento, Psicologia)
      // =========================================================================
      const IMAGES = {
        autoestima: "/assets/fv/ambientes/lago-autoestima.jpg",
        empoderamento: "/assets/fv/ambientes/lago-empoderamento.jpg",
        psicologia: "/assets/fv/ambientes/lago-psicologia.jpg"
      };

      const AFFIRMATIONS = [
        {
          id: 'rogers-1',
          category: 'Psicologia Humanista',
          image: IMAGES.psicologia,
          title: 'O Paradoxo da Aceitação',
          quote: '“O curioso paradoxo é que, quando me aceito exatamente como sou, então posso mudar.”',
          author: 'Carl Rogers — Psicólogo',
          extraLabel: 'Afirmação complementar (Psicologia)',
          extraQuote: '“A verdadeira mudança nasce quando paramos de lutar contra quem somos e passamos a nos escutar com presença.”',
          reflection: 'Convite à pausa: o que em você hoje merece ser acolhido sem julgamento?'
        },
        {
          id: 'branden-1',
          category: 'Autoestima',
          image: IMAGES.autoestima,
          title: 'Os Pilares do Valor Próprio',
          quote: '“A autoestima é a reputação que adquirimos conosco mesmos.”',
          author: 'Nathaniel Branden — Psicoterapeuta',
          extraLabel: 'Afirmação complementar (Autoestima)',
          extraQuote: '“Sou digno(a) de respeito, cuidado e pertencimento, independentemente das expectativas alheias.”',
          reflection: 'Respire fundo: que pequeno gesto de cuidado você pode oferecer a si hoje?'
        },
        {
          id: 'perls-1',
          category: 'Gestalt-terapia & Psicologia',
          image: IMAGES.psicologia,
          title: 'Presença no Aqui e Agora',
          quote: '“A awareness (consciência plena) por si só já é curativa.”',
          author: 'Fritz Perls — Criador da Gestalt-terapia',
          extraLabel: 'Afirmação complementar (Psicologia)',
          extraQuote: '“Quando volto minha atenção ao momento presente, encontro espaço para escolher minha própria resposta.”',
          reflection: 'Observe sua respiração e as ondas do lago: o que se torna figura para você agora?'
        },
        {
          id: 'brown-1',
          category: 'Empoderamento & Coragem',
          image: IMAGES.empoderamento,
          title: 'Pertencimento e Autenticidade',
          quote: '“Acolher nossas vulnerabilidades é o caminho mais corajoso para a conexão e a força interior.”',
          author: 'Brené Brown — Pesquisadora e Psicóloga',
          extraLabel: 'Afirmação complementar (Empoderamento)',
          extraQuote: '“Não preciso diminuir minha luz nem vestir armaduras para ter valor no mundo.”',
          reflection: 'Qual fronteira saudável fortalece a sua autonomia neste momento?'
        },
        {
          id: 'lispector-1',
          category: 'Autoestima & Empoderamento',
          image: IMAGES.autoestima,
          title: 'A Força de Ser Quem Se É',
          quote: '“Liberdade é pouco. O que eu desejo ainda não tem nome.”',
          author: 'Clarice Lispector — Escritora',
          extraLabel: 'Afirmação complementar (Autoestima)',
          extraQuote: '“Eu confio na minha própria travessia, no meu ritmo e na sabedoria silenciosa da minha história.”',
          reflection: 'Permita-se reconhecer uma conquista recente, por menor que pareça.'
        },
        {
          id: 'satir-1',
          category: 'Empoderamento & Psicologia',
          image: IMAGES.empoderamento,
          title: 'Autoria da Própria Vida',
          quote: '“Nós não somos apenas o que nos aconteceu; somos também o que escolhemos nos tornar a partir daqui.”',
          author: 'Virginia Satir — Psicoterapeuta',
          extraLabel: 'Afirmação complementar (Empoderamento)',
          extraQuote: '“Minha voz importa, minhas escolhas têm direção e eu posso reescrever meus próximos passos.”',
          reflection: 'Que escolha gentil e firme você deseja sustentar a partir de hoje?'
        }
      ];

      // =========================================================================
      // 2. APPLICATION STATE
      // =========================================================================
      const state = {
        mode: 'ripple', // 'ripple' | 'stone' | 'feed'
        ambient: 'day', // 'day' | 'sunset' | 'night'
        rain: false,
        sound: false,
        favorites: [],
        currentAffirmation: null,
        affIndex: 0,
        // Glowing fish cycle (every 30s)
        glowActive: false,
        glowTimer: 6.0, // First appearance in 6s, then every 30s
        glowDurationRemaining: 0,
        glowCycleSeconds: 30,
        glowVisibleDuration: 18
      };

      // =========================================================================
      // 3. SYNTHESIZED WEB AUDIO (Water & Harmonic Chime)
      // =========================================================================
      const audio = {
        ctx: null,
        rainGain: null,
        init() {
          if (this.ctx) return;
          this.ctx = env.audio();
          // Ambient gentle water/rain noise
          const bufSize = this.ctx.sampleRate * 2;
          const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
          const data = buf.getChannelData(0);
          let lastOut = 0;
          for (let i = 0; i < bufSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 2.2;
          }
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 650;

          this.rainGain = this.ctx.createGain();
          this.rainGain.gain.value = 0;

          src.connect(filter);
          filter.connect(this.rainGain);
          this.rainGain.connect(this.ctx.destination);
          src.start();
        },
        updateAmbient() {
          if (!this.ctx || !this.rainGain) return;
          const target = state.sound ? (state.rain ? 0.14 : 0.035) : 0;
          this.rainGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.25);
        },
        playDrop(pitch = 520) {
          if (!state.sound) return;
          this.init();
          if (this.ctx.state === 'suspended') this.ctx.resume();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, now);
          osc.frequency.exponentialRampToValueAtTime(pitch * 1.6, now + 0.09);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.17);
        },
        playChime() {
          if (!state.sound) return;
          this.init();
          if (this.ctx.state === 'suspended') this.ctx.resume();
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.95);
          });
        }
      };

      // =========================================================================
      // 4. THREE.JS SCENE, RENDERER, CAMERA & CONTROLS
      // =========================================================================
      const container = env.$('canvas-container');
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xcde8f5, 0.011);

      const camera = new THREE.PerspectiveCamera(
        48,
        env.W() / env.H(),
        0.1,
        220
      );
      camera.position.set(0, 10.5, 16.5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(env.W(), env.H());
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.appendChild(renderer.domElement);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxPolarAngle = Math.PI * 0.465; // Keep above ground
      controls.minPolarAngle = 0.15;
      controls.minDistance = 6;
      controls.maxDistance = 32;
      controls.target.set(0, -0.2, 0);

      // =========================================================================
      // 5. LIGHTING & SKY DOME
      // =========================================================================
      const hemiLight = new THREE.HemisphereLight(0xdff4ff, 0x3b4d3b, 0.75);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfff4dd, 1.35);
      dirLight.position.set(16, 22, 12);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 2;
      dirLight.shadow.camera.far = 70;
      const d = 22;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      scene.add(dirLight);

      const underwaterGlowLight = new THREE.PointLight(0x2bb5c6, 0.65, 22);
      underwaterGlowLight.position.set(0, -0.6, 0);
      scene.add(underwaterGlowLight);

      // Sky Dome Shader
      const skyUniforms = {
        uTopColor: { value: new THREE.Color(0x4a90c2) },
        uMidColor: { value: new THREE.Color(0x9bd2ea) },
        uHorizonColor: { value: new THREE.Color(0xeef6f9) },
        uSunDir: { value: new THREE.Vector3(16, 22, 12).normalize() },
        uSunColor: { value: new THREE.Color(0xfff7dc) }
      };

      const skyGeo = new THREE.SphereGeometry(110, 32, 24);
      const skyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: skyUniforms,
        vertexShader: `
          varying vec3 vWorldPos;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform vec3 uTopColor;
          uniform vec3 uMidColor;
          uniform vec3 uHorizonColor;
          uniform vec3 uSunDir;
          uniform vec3 uSunColor;
          varying vec3 vWorldPos;
          void main() {
            vec3 dir = normalize(vWorldPos);
            float h = clamp(dir.y, 0.0, 1.0);
            vec3 col = mix(uHorizonColor, uMidColor, smoothstep(0.0, 0.28, h));
            col = mix(col, uTopColor, smoothstep(0.25, 0.85, h));
            float sunAmt = max(dot(dir, normalize(uSunDir)), 0.0);
            col += uSunColor * pow(sunAmt, 42.0) * 0.75;
            col += uSunColor * pow(sunAmt, 8.0) * 0.16;
            gl_FragColor = vec4(col, 1.0);
          }
        `
      });
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      scene.add(skyMesh);

      // Stars (visible at night)
      const starCount = 450;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(0.15 + Math.random() * 0.85);
        const r = 98;
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.cos(phi);
        starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xf8f8f8, size: 0.45, transparent: true, opacity: 0 });
      const starsMesh = new THREE.Points(starGeo, starMat);
      scene.add(starsMesh);

      // Soft Clouds
      const cloudsGroup = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.85
      });
      for (let c = 0; c < 8; c++) {
        const cloud = new THREE.Group();
        const puffs = 3 + Math.floor(Math.random() * 3);
        for (let p = 0; p < puffs; p++) {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry(1.6 + Math.random() * 1.4, 12, 10),
            cloudMat
          );
          puff.position.set((p - puffs / 2) * 1.6, Math.random() * 0.5, (Math.random() - 0.5) * 0.8);
          puff.scale.y = 0.55;
          cloud.add(puff);
        }
        const angle = (c / 8) * Math.PI * 2;
        const dist = 34 + Math.random() * 18;
        cloud.position.set(Math.cos(angle) * dist, 18 + Math.random() * 6, Math.sin(angle) * dist);
        cloud.userData.speed = 0.008 + Math.random() * 0.008;
        cloud.userData.angle = angle;
        cloud.userData.dist = dist;
        cloudsGroup.add(cloud);
      }
      scene.add(cloudsGroup);

      // =========================================================================
      // 6. LAKEBED, SHORELINE TERRAIN & DISTANT HILLS
      // =========================================================================
      function createRiverbedTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#3c4a3e';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 1800; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const r = 1.5 + Math.random() * 6;
          const tones = ['#4f5c50', '#5e6456', '#333d34', '#6d7160', '#7e7a66'];
          ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
          ctx.globalAlpha = 0.35 + Math.random() * 0.4;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(6, 6);
        return tex;
      }

      // Lake radius ~ 11.5
      const LAKE_RADIUS = 11.5;
      function getTerrainHeight(x, z) {
        const r = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);
        // Organic shoreline contour
        const shoreRadius = LAKE_RADIUS + Math.sin(angle * 3) * 0.8 + Math.cos(angle * 5) * 0.45;
        if (r < shoreRadius) {
          // Underwater basin: smooth depth down to -1.75
          const t = r / shoreRadius;
          const baseDepth = -1.75 * (1.0 - Math.pow(t, 2.2));
          const ripples = Math.sin(x * 0.8) * Math.cos(z * 0.8) * 0.08;
          return baseDepth + ripples;
        } else {
          // Rising mossy/grassy bank and outer hills
          const out = r - shoreRadius;
          const bank = Math.min(2.6, out * 0.22);
          const hill = Math.max(0, out - 8) * 0.16 * (0.6 + 0.4 * Math.sin(angle * 4 + 1.1));
          return bank + hill + Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.25;
        }
      }

      const terrainGeo = new THREE.PlaneGeometry(76, 76, 110, 110);
      terrainGeo.rotateX(-Math.PI / 2);
      const posAttr = terrainGeo.attributes.position;
      const colors = [];
      const colDeep = new THREE.Color(0x283834);
      const colSand = new THREE.Color(0x6b6a58);
      const colGrass = new THREE.Color(0x4b7447);
      const colHill = new THREE.Color(0x3a5b3c);

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const y = getTerrainHeight(x, z);
        posAttr.setY(i, y);

        const c = new THREE.Color();
        if (y < -0.6) {
          c.copy(colDeep).lerp(colSand, (y + 1.8) / 1.2);
        } else if (y < 0.15) {
          c.copy(colSand).lerp(colGrass, (y + 0.6) / 0.75);
        } else {
          c.copy(colGrass).lerp(colHill, Math.min(1, y / 3.0));
        }
        colors.push(c.r, c.g, c.b);
      }
      terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        map: createRiverbedTexture(),
        vertexColors: true,
        roughness: 0.92,
        metalness: 0.02
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.receiveShadow = true;
      scene.add(terrainMesh);

      // =========================================================================
      // 7. LAKEBED ELEMENTS (3D Rocks, Driftwood, Pebbles, Underwater Plants)
      // =========================================================================
      const lakebedGroup = new THREE.Group();
      scene.add(lakebedGroup);

      const rockMat = new THREE.MeshStandardMaterial({ color: 0x5c615b, roughness: 0.88, flatShading: true });
      const darkRockMat = new THREE.MeshStandardMaterial({ color: 0x3e4440, roughness: 0.9, flatShading: true });
      const mossRockMat = new THREE.MeshStandardMaterial({ color: 0x4b5f49, roughness: 0.9, flatShading: true });

      // Underwater & shoreline rocks
      for (let i = 0; i < 42; i++) {
        const isShore = i >= 26;
        const angle = Math.random() * Math.PI * 2;
        const r = isShore ? LAKE_RADIUS - 0.3 + Math.random() * 2.5 : 1.2 + Math.random() * 8.5;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = getTerrainHeight(x, z);

        const size = isShore ? (0.45 + Math.random() * 0.75) : (0.22 + Math.random() * 0.45);
        const geo = new THREE.DodecahedronGeometry(size, 1);
        const mat = i % 3 === 0 ? mossRockMat : i % 2 === 0 ? rockMat : darkRockMat;
        const rock = new THREE.Mesh(geo, mat);
        rock.position.set(x, y + size * 0.32, z);
        rock.scale.set(1 + Math.random() * 0.5, 0.55 + Math.random() * 0.35, 1 + Math.random() * 0.5);
        rock.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
        rock.castShadow = true;
        rock.receiveShadow = true;
        lakebedGroup.add(rock);
      }

      // Submerged Driftwood Logs
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x4f3b2b, roughness: 0.95 });
      for (let i = 0; i < 3; i++) {
        const logGroup = new THREE.Group();
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.8, 8), woodMat);
        log.rotation.z = Math.PI / 2 - 0.12;
        log.castShadow = true;
        log.receiveShadow = true;
        logGroup.add(log);

        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 1.1, 6), woodMat);
        branch.position.set(0.4, 0.3, 0.1);
        branch.rotation.z = 0.6;
        logGroup.add(branch);

        const angle = i * 2.1 + 0.5;
        const r = 4.0 + i * 1.4;
        const lx = Math.cos(angle) * r;
        const lz = Math.sin(angle) * r;
        logGroup.position.set(lx, getTerrainHeight(lx, lz) + 0.16, lz);
        logGroup.rotation.y = Math.random() * Math.PI;
        lakebedGroup.add(logGroup);
      }

      // Underwater Aquatic Plants (Kelp / Vallisneria ribbons)
      const underwaterPlants = [];
      const seaPlantMat = new THREE.MeshStandardMaterial({
        color: 0x2f754d,
        roughness: 0.75,
        side: THREE.DoubleSide
      });
      for (let i = 0; i < 38; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 1.8 + Math.random() * 8.2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = getTerrainHeight(x, z);
        if (y > -0.35) continue;

        const cluster = new THREE.Group();
        cluster.position.set(x, y, z);
        const blades = 3 + Math.floor(Math.random() * 3);
        for (let b = 0; b < blades; b++) {
          const h = 0.45 + Math.random() * Math.min(0.85, Math.abs(y) * 0.75);
          const bladeGeo = new THREE.PlaneGeometry(0.11, h, 1, 5);
          bladeGeo.translate(0, h / 2, 0);
          const blade = new THREE.Mesh(bladeGeo, seaPlantMat);
          blade.rotation.y = (b / blades) * Math.PI;
          blade.userData.phase = Math.random() * Math.PI * 2;
          cluster.add(blade);
          underwaterPlants.push(blade);
        }
        lakebedGroup.add(cluster);
      }

      // =========================================================================
      // 8. EXTERNAL VEGETATION (Trees, Reeds/Cattails, Grass Tufts)
      // =========================================================================
      const envGroup = new THREE.Group();
      scene.add(envGroup);

      // Reeds / Cattails around the shoreline
      const reedStemMat = new THREE.MeshStandardMaterial({ color: 0x3b6e3c, roughness: 0.8 });
      const cattailTopMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
      const reeds = [];

      for (let i = 0; i < 48; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = LAKE_RADIUS - 0.5 + Math.random() * 2.2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = getTerrainHeight(x, z);
        if (y < -0.35 || y > 1.2) continue;

        const clump = new THREE.Group();
        clump.position.set(x, y, z);
        const stalks = 3 + Math.floor(Math.random() * 3);
        for (let s = 0; s < stalks; s++) {
          const h = 0.9 + Math.random() * 0.8;
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, h, 5), reedStemMat);
          stalk.position.set((Math.random() - 0.5) * 0.35, h / 2, (Math.random() - 0.5) * 0.35);
          stalk.rotation.z = (Math.random() - 0.5) * 0.18;
          if (s === 0 && Math.random() > 0.35) {
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 6), cattailTopMat);
            top.position.y = h * 0.42;
            stalk.add(top);
          }
          stalk.userData.phase = Math.random() * Math.PI * 2;
          clump.add(stalk);
          reeds.push(stalk);
        }
        envGroup.add(clump);
      }

      // Stylized Trees around the outer bank
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b4232, roughness: 0.92 });
      const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x3d6e47, roughness: 0.85, flatShading: true });
      const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x4f8454, roughness: 0.85, flatShading: true });

      const treePositions = [
        [-14.5, -9.5], [14.2, -10.0], [-16.0, 5.5],
        [15.5, 6.8], [-7.5, -15.5], [8.5, -14.8],
        [-13.0, 13.0], [13.5, 13.5]
      ];
      treePositions.forEach(([tx, tz], idx) => {
        const ty = getTerrainHeight(tx, tz);
        const tree = new THREE.Group();
        tree.position.set(tx, ty, tz);

        const trunkH = 2.6 + (idx % 3) * 0.6;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, trunkH, 7), trunkMat);
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);

        const crownCount = 3;
        for (let c = 0; c < crownCount; c++) {
          const rad = 1.45 - c * 0.22;
          const crown = new THREE.Mesh(
            new THREE.DodecahedronGeometry(rad, 1),
            c % 2 === 0 ? leafMat1 : leafMat2
          );
          crown.position.set(
            (c - 1) * 0.35,
            trunkH + 0.5 + c * 0.65,
            (c % 2 === 0 ? 0.2 : -0.2)
          );
          crown.scale.y = 0.82;
          crown.castShadow = true;
          crown.receiveShadow = true;
          tree.add(crown);
        }
        envGroup.add(tree);
      });

      // =========================================================================
      // 9. INTERACTIVE 3D WATER SURFACE (Shader with 16 Real-Time Ripples)
      // =========================================================================
      const MAX_RIPPLES = 16;
      const rippleArray = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -999, 0));
      let rippleIndex = 0;

      const waterUniforms = {
        uTime: { value: 0 },
        uRipples: { value: rippleArray },
        uShallowColor: { value: new THREE.Color(0x2bb5c6) },
        uDeepColor: { value: new THREE.Color(0x10466b) },
        uSkyColor: { value: new THREE.Color(0x9bd2ea) },
        uSunDir: { value: new THREE.Vector3(16, 22, 12).normalize() },
        uSunColor: { value: new THREE.Color(0xfff7dc) }
      };

      const waterGeo = new THREE.CircleGeometry(LAKE_RADIUS + 1.4, 128);
      waterGeo.rotateX(-Math.PI / 2);

      // Subdivide radial circle cleanly by using a high-res plane masked by distance
      const waterPlaneGeo = new THREE.PlaneGeometry(28, 28, 128, 128);
      waterPlaneGeo.rotateX(-Math.PI / 2);

      const waterMat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: waterUniforms,
        vertexShader: `
          uniform float uTime;
          uniform vec4 uRipples[${MAX_RIPPLES}];
          varying vec3 vWorldPos;
          varying vec3 vNormal;
          varying float vWaveHeight;

          float calcWave(vec2 p, float t) {
            float h = sin(p.x * 0.65 + t * 1.1) * 0.018 + cos(p.y * 0.72 + t * 0.9) * 0.018;
            for (int i = 0; i < ${MAX_RIPPLES}; i++) {
              vec4 rip = uRipples[i];
              float age = t - rip.z;
              if (age > 0.0 && age < 5.5 && rip.w > 0.0) {
                float dist = length(p - rip.xy);
                float waveRadius = age * 3.4;
                float band = exp(-pow((dist - waveRadius) * 1.35, 2.0));
                float decay = exp(-age * 0.85) * exp(-dist * 0.16);
                h += sin((dist - waveRadius) * 6.5) * band * decay * rip.w;
              }
            }
            return h;
          }

          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            float h = calcWave(wp.xz, uTime);
            float eps = 0.08;
            float hx = calcWave(wp.xz + vec2(eps, 0.0), uTime);
            float hz = calcWave(wp.xz + vec2(0.0, eps), uTime);
            vNormal = normalize(vec3(h - hx, eps, h - hz));
            wp.y += h;
            vWorldPos = wp.xyz;
            vWaveHeight = h;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uShallowColor;
          uniform vec3 uDeepColor;
          uniform vec3 uSkyColor;
          uniform vec3 uSunDir;
          uniform vec3 uSunColor;
          varying vec3 vWorldPos;
          varying vec3 vNormal;
          varying float vWaveHeight;

          void main() {
            float r = length(vWorldPos.xz);
            float depthFactor = clamp(1.0 - r / 12.2, 0.0, 1.0);
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            vec3 N = normalize(vNormal);

            // Fresnel reflection
            float fresnel = pow(1.0 - max(dot(viewDir, N), 0.0), 3.2);
            fresnel = clamp(fresnel * 0.85 + 0.1, 0.0, 0.92);

            vec3 waterBase = mix(uShallowColor, uDeepColor, depthFactor * 0.85);

            // Subtle caustics shimmer
            float caustic = sin(vWorldPos.x * 2.3 + uTime * 1.6) * sin(vWorldPos.z * 2.3 - uTime * 1.3);
            waterBase += vec3(0.06, 0.14, 0.16) * max(0.0, caustic) * depthFactor;

            // Sun / Moon specular highlight
            vec3 halfVec = normalize(normalize(uSunDir) + viewDir);
            float spec = pow(max(dot(N, halfVec), 0.0), 96.0);
            vec3 col = mix(waterBase, uSkyColor, fresnel);
            col += uSunColor * spec * 0.95;

            // Wave crest highlight
            col += vec3(0.18, 0.25, 0.28) * max(0.0, vWaveHeight * 4.5);

            float alpha = mix(0.45, 0.72, fresnel) * smoothstep(13.2, 11.4, r);
            gl_FragColor = vec4(col, alpha);
          }
        `
      });

      const waterMesh = new THREE.Mesh(waterPlaneGeo, waterMat);
      waterMesh.position.y = 0;
      scene.add(waterMesh);

      function addRipple(x, z, strength = 0.09) {
        rippleArray[rippleIndex].set(x, z, clockTime, strength);
        rippleIndex = (rippleIndex + 1) % MAX_RIPPLES;
      }

      // =========================================================================
      // 10. FLOATING SURFACE VEGETATION (Lily Pads & Lotus Flowers)
      // =========================================================================
      const lilyPads = [];
      const padMat = new THREE.MeshStandardMaterial({ color: 0x3b7a47, roughness: 0.72, side: THREE.DoubleSide });
      const pinkLotusMat = new THREE.MeshStandardMaterial({ color: 0xf4a8b8, roughness: 0.5 });
      const whiteLotusMat = new THREE.MeshStandardMaterial({ color: 0xfaf7f2, roughness: 0.5 });

      const padSpots = [
        [-4.2, -3.5, true, true], [-5.4, -2.4, false, false],
        [4.8, 3.2, true, false], [5.8, 2.2, false, false],
        [-2.8, 5.2, true, true], [2.4, -5.6, false, false],
        [-6.8, 1.5, true, false], [6.6, -3.4, false, false]
      ];
      padSpots.forEach(([px, pz, hasFlower, isPink], i) => {
        const padGroup = new THREE.Group();
        const radius = 0.42 + (i % 3) * 0.14;
        const padGeo = new THREE.CircleGeometry(radius, 20, 0.15, Math.PI * 1.85);
        padGeo.rotateX(-Math.PI / 2);
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.receiveShadow = true;
        padGroup.add(pad);

        if (hasFlower) {
          const flower = new THREE.Group();
          const fMat = isPink ? pinkLotusMat : whiteLotusMat;
          for (let p = 0; p < 8; p++) {
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 5), fMat);
            const a = (p / 8) * Math.PI * 2;
            petal.position.set(Math.cos(a) * 0.09, 0.06, Math.sin(a) * 0.09);
            petal.rotation.z = -Math.cos(a) * 0.65;
            petal.rotation.x = Math.sin(a) * 0.65;
            flower.add(petal);
          }
          const center = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xf5c842 })
          );
          center.position.y = 0.06;
          flower.add(center);
          padGroup.add(flower);
        }

        padGroup.position.set(px, 0.025, pz);
        padGroup.rotation.y = Math.random() * Math.PI * 2;
        padGroup.userData.phase = Math.random() * Math.PI * 2;
        padGroup.userData.baseX = px;
        padGroup.userData.baseZ = pz;
        scene.add(padGroup);
        lilyPads.push(padGroup);
      });

      // =========================================================================
      // 11. MULTI-SPECIES 3D FISH + GLOWING FISH (EVERY 30s)
      // =========================================================================
      const fishList = [];
      const foodPellets = [];
      const stonesList = [];

      function buildFishMesh(species) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        root.add(bodyGroup);

        let bodyColor = 0xfaf7f2;
        let accentColor = 0xd95b26;
        let finColor = 0xfaf7f2;
        let scaleVec = [0.22, 0.24, 0.62]; // width, height, length
        let tailScale = 1.0;
        let isGlowing = false;

        if (species === 'koi_kohaku') {
          bodyColor = 0xfaf7f2; accentColor = 0xd85525; scaleVec = [0.24, 0.25, 0.68];
        } else if (species === 'koi_yamabuki') {
          bodyColor = 0xf5c42e; accentColor = 0xffe27a; finColor = 0xf9db6d; scaleVec = [0.23, 0.24, 0.65];
        } else if (species === 'angelfish') {
          bodyColor = 0xe8edf2; accentColor = 0x1d2d3b; finColor = 0xc5d4e2; scaleVec = [0.1, 0.44, 0.42]; tailScale = 1.25;
        } else if (species === 'neon_tetra') {
          bodyColor = 0x1e6ea8; accentColor = 0x2df2ff; finColor = 0x99e9ff; scaleVec = [0.11, 0.13, 0.36]; tailScale = 0.75;
        } else if (species === 'veil_betta') {
          bodyColor = 0x1b7a8c; accentColor = 0x6a4c93; finColor = 0x3ec6d8; scaleVec = [0.16, 0.22, 0.48]; tailScale = 1.6;
        } else if (species === 'glowing') {
          bodyColor = 0xfff4c2; accentColor = 0x2bb5c6; finColor = 0x7ef9ff; scaleVec = [0.26, 0.28, 0.76]; tailScale = 1.35;
          isGlowing = true;
        }

        const bodyMat = isGlowing
          ? new THREE.MeshStandardMaterial({
              color: 0xfff8d6,
              emissive: new THREE.Color(0x36e2f5),
              emissiveIntensity: 1.5,
              roughness: 0.25
            })
          : new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.1 });

        const accentMat = isGlowing
          ? new THREE.MeshStandardMaterial({
              color: 0xffd166,
              emissive: new THREE.Color(0xffb703),
              emissiveIntensity: 1.4
            })
          : new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.4 });

        const finMat = new THREE.MeshStandardMaterial({
          color: finColor,
          transparent: true,
          opacity: isGlowing ? 0.88 : 0.75,
          side: THREE.DoubleSide,
          emissive: isGlowing ? new THREE.Color(0x2bb5c6) : new THREE.Color(0x000000),
          emissiveIntensity: isGlowing ? 0.9 : 0
        });

        // Torso
        const torsoGeo = new THREE.SphereGeometry(1, 16, 12);
        const torso = new THREE.Mesh(torsoGeo, bodyMat);
        torso.scale.set(scaleVec[0], scaleVec[1], scaleVec[2]);
        torso.castShadow = !isGlowing;
        bodyGroup.add(torso);

        // Pattern patch / dorsal stripe
        const patch = new THREE.Mesh(new THREE.SphereGeometry(0.68, 12, 10), accentMat);
        patch.scale.set(scaleVec[0] * 1.04, scaleVec[1] * 0.95, scaleVec[2] * 0.55);
        patch.position.set(0, scaleVec[1] * 0.22, scaleVec[2] * 0.1);
        bodyGroup.add(patch);

        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        [-1, 1].forEach((side) => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), eyeMat);
          eye.position.set(side * scaleVec[0] * 0.72, scaleVec[1] * 0.28, scaleVec[2] * 0.62);
          bodyGroup.add(eye);
        });

        // Articulated Tail Pivot
        const tailPivot = new THREE.Group();
        tailPivot.position.set(0, 0, -scaleVec[2] * 0.85);
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.lineTo(-0.36 * tailScale, 0.24 * tailScale);
        tailShape.lineTo(-0.24 * tailScale, 0);
        tailShape.lineTo(-0.36 * tailScale, -0.24 * tailScale);
        tailShape.closePath();
        const tailGeo = new THREE.ShapeGeometry(tailShape);
        tailGeo.rotateY(Math.PI / 2);
        const tailMesh = new THREE.Mesh(tailGeo, finMat);
        tailPivot.add(tailMesh);
        bodyGroup.add(tailPivot);

        // Pectoral Fins
        const finGeo = new THREE.ConeGeometry(0.09 * tailScale, 0.24 * tailScale, 4);
        finGeo.rotateZ(Math.PI / 2);
        const leftFin = new THREE.Mesh(finGeo, finMat);
        leftFin.position.set(scaleVec[0] * 0.85, -scaleVec[1] * 0.2, scaleVec[2] * 0.2);
        bodyGroup.add(leftFin);

        const rightFin = new THREE.Mesh(finGeo, finMat);
        rightFin.rotation.y = Math.PI;
        rightFin.position.set(-scaleVec[0] * 0.85, -scaleVec[1] * 0.2, scaleVec[2] * 0.2);
        bodyGroup.add(rightFin);

        if (isGlowing) {
          const glowLight = new THREE.PointLight(0x56f0ff, 2.2, 6.5);
          glowLight.position.set(0, 0.2, 0);
          root.add(glowLight);

          // Invisible generous hit-sphere for easy clicking
          const hitSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.05, 10, 10),
            new THREE.MeshBasicMaterial({ visible: false })
          );
          hitSphere.userData.isGlowingFish = true;
          root.add(hitSphere);

          // Outer aura ring
          const auraGeo = new THREE.RingGeometry(0.55, 0.72, 24);
          auraGeo.rotateX(-Math.PI / 2);
          const auraMat = new THREE.MeshBasicMaterial({
            color: 0x7ef9ff,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
          });
          const aura = new THREE.Mesh(auraGeo, auraMat);
          aura.position.y = 0.05;
          root.add(aura);
          root.userData.aura = aura;
        }

        return { root, bodyGroup, tailPivot, leftFin, rightFin, isGlowing };
      }

      const speciesRoster = [
        'koi_kohaku', 'koi_kohaku',
        'koi_yamabuki', 'koi_yamabuki',
        'angelfish', 'angelfish',
        'neon_tetra', 'neon_tetra', 'neon_tetra',
        'veil_betta'
      ];

      speciesRoster.forEach((sp, i) => {
        const built = buildFishMesh(sp);
        const angle = (i / speciesRoster.length) * Math.PI * 2;
        const dist = 2.0 + Math.random() * 5.8;
        const depth = sp === 'neon_tetra' ? -0.35 : -0.45 - Math.random() * 0.55;
        built.root.position.set(Math.cos(angle) * dist, depth, Math.sin(angle) * dist);
        scene.add(built.root);
        fishList.push({
          ...built,
          species: sp,
          depth,
          angle: Math.random() * Math.PI * 2,
          speed: sp === 'neon_tetra' ? 2.1 : 1.1 + Math.random() * 0.65,
          targetAngle: Math.random() * Math.PI * 2,
          wigglePhase: Math.random() * Math.PI * 2,
          changeTimer: Math.random() * 3
        });
      });

      // Special Glowing Fish (appears every 30s)
      const glowingFish = {
        ...buildFishMesh('glowing'),
        species: 'glowing',
        depth: -0.38,
        angle: 0,
        speed: 1.55,
        targetAngle: 0.4,
        wigglePhase: 0,
        changeTimer: 2
      };
      glowingFish.root.visible = false;
      glowingFish.root.position.set(-8, -0.38, -2);
      scene.add(glowingFish.root);

      // =========================================================================
      // 12. PARTICLES (Underwater Motes, Fireflies, Splash, Bioluminescent Trail, Rain)
      // =========================================================================
      // Underwater Motes
      const moteCount = 140;
      const motePos = new Float32Array(moteCount * 3);
      for (let i = 0; i < moteCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 9.5;
        motePos[i * 3] = Math.cos(a) * r;
        motePos[i * 3 + 1] = -0.15 - Math.random() * 1.25;
        motePos[i * 3 + 2] = Math.sin(a) * r;
      }
      const moteGeo = new THREE.BufferGeometry();
      moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      const moteMat = new THREE.PointsMaterial({ color: 0xa8e8f0, size: 0.06, transparent: true, opacity: 0.55 });
      const motesMesh = new THREE.Points(moteGeo, moteMat);
      scene.add(motesMesh);

      // Fireflies / Pollen above water
      const fireflyCount = 45;
      const ffPos = new Float32Array(fireflyCount * 3);
      const ffBase = [];
      for (let i = 0; i < fireflyCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 11;
        const x = Math.cos(a) * r;
        const y = 0.4 + Math.random() * 2.6;
        const z = Math.sin(a) * r;
        ffPos[i * 3] = x;
        ffPos[i * 3 + 1] = y;
        ffPos[i * 3 + 2] = z;
        ffBase.push({ x, y, z, phase: Math.random() * Math.PI * 2 });
      }
      const ffGeo = new THREE.BufferGeometry();
      ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
      const ffMat = new THREE.PointsMaterial({ color: 0xffe885, size: 0.14, transparent: true, opacity: 0.6 });
      const firefliesMesh = new THREE.Points(ffGeo, ffMat);
      scene.add(firefliesMesh);

      // Rain particles
      const rainCount = 350;
      const rainPos = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount; i++) {
        rainPos[i * 3] = (Math.random() - 0.5) * 26;
        rainPos[i * 3 + 1] = Math.random() * 14;
        rainPos[i * 3 + 2] = (Math.random() - 0.5) * 26;
      }
      const rainGeo = new THREE.BufferGeometry();
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
      const rainMat = new THREE.PointsMaterial({ color: 0xd0efff, size: 0.09, transparent: true, opacity: 0.65 });
      const rainMesh = new THREE.Points(rainGeo, rainMat);
      rainMesh.visible = false;
      scene.add(rainMesh);

      // Dynamic Splash & Bioluminescent Trail Particles
      const dynamicParticles = [];
      const particleGeo = new THREE.SphereGeometry(0.045, 6, 6);
      function spawnParticles(x, y, z, count, colorHex, isTrail = false) {
        for (let i = 0; i < count; i++) {
          const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });
          const p = new THREE.Mesh(particleGeo, mat);
          p.position.set(x, y, z);
          scene.add(p);
          dynamicParticles.push({
            mesh: p,
            vx: (Math.random() - 0.5) * (isTrail ? 0.5 : 2.2),
            vy: isTrail ? (0.2 + Math.random() * 0.4) : (1.5 + Math.random() * 2.4),
            vz: (Math.random() - 0.5) * (isTrail ? 0.5 : 2.2),
            life: isTrail ? 1.1 : 0.75,
            maxLife: isTrail ? 1.1 : 0.75,
            gravity: isTrail ? 0.1 : 6.5
          });
        }
      }

      // =========================================================================
      // 13. INTERACTIVITY (Raycaster, Mouse Ripples, Stones, Food, Glowing Fish Click)
      // =========================================================================
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let pointerDownPos = { x: 0, y: 0 };
      let lastHoverRipple = 0;

      function updatePointer(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }

      renderer.domElement.addEventListener('pointerdown', (e) => {
        pointerDownPos = { x: e.clientX, y: e.clientY };
      });

      renderer.domElement.addEventListener('pointermove', (e) => {
        updatePointer(e);
        raycaster.setFromCamera(pointer, camera);

        // Cursor hint if hovering glowing fish
        if (state.glowActive && glowingFish.root.visible) {
          const fishHits = raycaster.intersectObject(glowingFish.root, true);
          if (fishHits.length > 0) {
            renderer.domElement.style.cursor = 'pointer';
          } else {
            renderer.domElement.style.cursor = 'grab';
          }
        } else {
          renderer.domElement.style.cursor = 'grab';
        }

        // Hover water ripple in 'ripple' mode
        if (state.mode === 'ripple' && performance.now() - lastHoverRipple > 95) {
          const hits = raycaster.intersectObject(waterMesh);
          if (hits.length > 0) {
            const pt = hits[0].point;
            if (Math.hypot(pt.x, pt.z) < LAKE_RADIUS + 0.5) {
              addRipple(pt.x, pt.z, 0.045);
              lastHoverRipple = performance.now();
            }
          }
        }
      });

      renderer.domElement.addEventListener('pointerup', (e) => {
        const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        if (distMoved > 7) return; // Ignore camera orbit drags

        updatePointer(e);
        raycaster.setFromCamera(pointer, camera);

        // 1. Priority check: Did user click the Glowing Fish?
        if (state.glowActive && glowingFish.root.visible) {
          const fishHits = raycaster.intersectObject(glowingFish.root, true);
          if (fishHits.length > 0) {
            openAffirmationModal();
            return;
          }
        }

        // 2. Otherwise interact with water surface
        const waterHits = raycaster.intersectObject(waterMesh);
        if (waterHits.length > 0) {
          const pt = waterHits[0].point;
          if (Math.hypot(pt.x, pt.z) > LAKE_RADIUS + 0.8) return;

          if (state.mode === 'ripple') {
            addRipple(pt.x, pt.z, 0.11);
            spawnParticles(pt.x, 0.05, pt.z, 6, 0xdff8ff, false);
            audio.playDrop(540);
          } else if (state.mode === 'stone') {
            tossStoneAt(pt.x, pt.z);
          } else if (state.mode === 'feed') {
            dropFoodAt(pt.x, pt.z);
          }
        }
      });

      function tossStoneAt(tx, tz) {
        const stone = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.14, 0),
          rockMat
        );
        stone.position.set(tx, 3.8, tz);
        stone.castShadow = true;
        scene.add(stone);
        stonesList.push({ mesh: stone, x: tx, z: tz, vy: -2.0, splashed: false });
      }

      function dropFoodAt(fx, fz) {
        for (let i = 0; i < 3; i++) {
          const px = fx + (Math.random() - 0.5) * 0.6;
          const pz = fz + (Math.random() - 0.5) * 0.6;
          const pellet = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xd49b54, roughness: 0.7 })
          );
          pellet.position.set(px, 0.03, pz);
          scene.add(pellet);
          foodPellets.push({ mesh: pellet, x: px, z: pz, life: 14 });
        }
        addRipple(fx, fz, 0.05);
        audio.playDrop(680);
      }

      // =========================================================================
      // 14. AMBIENT & GLOWING FISH CYCLE LOGIC
      // =========================================================================
      function applyAmbient(mode) {
        state.ambient = mode;
        if (mode === 'day') {
          skyUniforms.uTopColor.value.setHex(0x4a90c2);
          skyUniforms.uMidColor.value.setHex(0x9bd2ea);
          skyUniforms.uHorizonColor.value.setHex(0xeef6f9);
          skyUniforms.uSunColor.value.setHex(0xfff7dc);
          skyUniforms.uSunDir.value.set(16, 22, 12).normalize();
          dirLight.position.set(16, 22, 12);
          dirLight.color.setHex(0xfff4dd);
          dirLight.intensity = (1.35) * Math.PI;
          hemiLight.intensity = (0.75) * Math.PI;
          waterUniforms.uSkyColor.value.setHex(0x9bd2ea);
          waterUniforms.uSunColor.value.setHex(0xfff7dc);
          waterUniforms.uSunDir.value.set(16, 22, 12).normalize();
          scene.fog.color.setHex(0xcde8f5);
          starMat.opacity = 0;
          ffMat.opacity = 0.35;
        } else if (mode === 'sunset') {
          skyUniforms.uTopColor.value.setHex(0x283655);
          skyUniforms.uMidColor.value.setHex(0xc06c84);
          skyUniforms.uHorizonColor.value.setHex(0xf8b195);
          skyUniforms.uSunColor.value.setHex(0xffb76b);
          skyUniforms.uSunDir.value.set(-18, 5, -14).normalize();
          dirLight.position.set(-18, 8, -14);
          dirLight.color.setHex(0xffa96b);
          dirLight.intensity = (1.15) * Math.PI;
          hemiLight.intensity = (0.55) * Math.PI;
          waterUniforms.uSkyColor.value.setHex(0xf69d7e);
          waterUniforms.uSunColor.value.setHex(0xffc988);
          waterUniforms.uSunDir.value.set(-18, 5, -14).normalize();
          scene.fog.color.setHex(0xd99b8c);
          starMat.opacity = 0.25;
          ffMat.opacity = 0.78;
        } else {
          // Night
          skyUniforms.uTopColor.value.setHex(0x050e1a);
          skyUniforms.uMidColor.value.setHex(0x0f253d);
          skyUniforms.uHorizonColor.value.setHex(0x1b3c59);
          skyUniforms.uSunColor.value.setHex(0xdbeeff);
          skyUniforms.uSunDir.value.set(14, 18, -12).normalize();
          dirLight.position.set(14, 18, -12);
          dirLight.color.setHex(0x9ec5f8);
          dirLight.intensity = (0.55) * Math.PI;
          hemiLight.intensity = (0.32) * Math.PI;
          waterUniforms.uSkyColor.value.setHex(0x16324f);
          waterUniforms.uSunColor.value.setHex(0xcfe5ff);
          waterUniforms.uSunDir.value.set(14, 18, -12).normalize();
          scene.fog.color.setHex(0x0d1f33);
          starMat.opacity = 0.9;
          ffMat.opacity = 0.95;
        }
      }

      const glowDot = env.$('glow-dot');
      const glowStatusText = env.$('glow-status-text');
      const btnGlowStatus = env.$('btn-glow-status');

      function activateGlowingFish() {
        state.glowActive = true;
        state.glowDurationRemaining = state.glowVisibleDuration;
        const startAngle = Math.random() * Math.PI * 2;
        glowingFish.root.position.set(Math.cos(startAngle) * 8.5, -0.35, Math.sin(startAngle) * 8.5);
        glowingFish.angle = startAngle + Math.PI + (Math.random() - 0.5) * 0.6;
        glowingFish.targetAngle = glowingFish.angle;
        glowingFish.root.visible = true;
        btnGlowStatus.setAttribute('aria-pressed', 'true');
        glowStatusText.textContent = 'Peixe brilhante ativo! Clique nele';
        addRipple(glowingFish.root.position.x, glowingFish.root.position.z, 0.12);
      }

      function deactivateGlowingFish() {
        state.glowActive = false;
        state.glowTimer = state.glowCycleSeconds;
        glowingFish.root.visible = false;
        btnGlowStatus.setAttribute('aria-pressed', 'false');
      }

      btnGlowStatus.addEventListener('click', () => {
        if (!state.glowActive) {
          activateGlowingFish();
        } else {
          openAffirmationModal();
        }
      });

      // =========================================================================
      // 15. MODALS & UI WIRING
      // =========================================================================
      const affModal = env.$('affirmation-modal');
      const favModal = env.$('favorites-modal');
      const infoModal = env.$('info-modal');
      const favCountEl = env.$('fav-count');
      const favListEl = env.$('favorites-list');
      const btnSaveFav = env.$('btn-save-fav');

      function openAffirmationModal() {
        audio.playChime();
        const item = AFFIRMATIONS[state.affIndex % AFFIRMATIONS.length];
        state.affIndex++;
        state.currentAffirmation = item;

        env.$('aff-image').src = item.image;
        env.$('aff-category').textContent = item.category;
        env.$('aff-title').textContent = item.title;
        env.$('aff-quote').textContent = item.quote;
        env.$('aff-author').textContent = `— ${item.author}`;
        env.$('aff-extra-label').textContent = item.extraLabel;
        env.$('aff-extra-quote').textContent = item.extraQuote;
        env.$('aff-reflection').textContent = item.reflection;

        const alreadySaved = state.favorites.some((f) => f.id === item.id);
        btnSaveFav.textContent = alreadySaved ? '★ Guardada nos favoritos' : '★ Salvar afirmação';

        affModal.classList.remove('hidden');
        affModal.classList.add('flex');
      }

      function closeModal(el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }

      env.$('btn-close-aff').addEventListener('click', () => closeModal(affModal));
      env.$('btn-return-lake').addEventListener('click', () => closeModal(affModal));

      btnSaveFav.addEventListener('click', () => {
        if (!state.currentAffirmation) return;
        const exists = state.favorites.some((f) => f.id === state.currentAffirmation.id);
        if (!exists) {
          state.favorites.push(state.currentAffirmation);
          favCountEl.textContent = String(state.favorites.length);
          btnSaveFav.textContent = '★ Guardada nos favoritos';
          renderFavorites();
        }
      });

      function renderFavorites() {
        if (state.favorites.length === 0) {
          favListEl.innerHTML = '<p class="fv-lg-empty">Clique no peixe brilhante para descobrir e guardar afirmações.</p>';
          return;
        }
        favListEl.innerHTML = state.favorites.map((item) => `
          <div class="fv-lg-fav">
            <span class="fv-label">${item.category}</span>
            <p>${item.quote}</p>
            <small>— ${item.author}</small>
          </div>
        `).join('');
      }

      env.$('btn-open-favorites').addEventListener('click', () => {
        renderFavorites();
        favModal.classList.remove('hidden');
        favModal.classList.add('flex');
      });
      env.$('btn-close-fav').addEventListener('click', () => closeModal(favModal));
      env.$('btn-open-info').addEventListener('click', () => {
        infoModal.classList.remove('hidden');
        infoModal.classList.add('flex');
      });
      env.$('btn-close-info').addEventListener('click', () => closeModal(infoModal));

      // Bottom Controls
      const modeHints = {
        ripple: 'Mova sobre a água para ondular · Arraste para girar a câmera',
        stone: 'Clique na água para atirar uma pedra',
        feed: 'Clique na água para alimentar os peixes'
      };
      env.qsa('.mode-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.mode = btn.dataset.mode;
          env.$('mode-hint-text').textContent = modeHints[state.mode];
          env.qsa('.mode-btn').forEach((b) => {
            const active = b.dataset.mode === state.mode;
            b.setAttribute('aria-pressed', String(active));
          });
        });
      });

      env.qsa('.ambient-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          applyAmbient(btn.dataset.ambient);
          env.qsa('.ambient-btn').forEach((b) => {
            const active = b.dataset.ambient === state.ambient;
            b.setAttribute('aria-pressed', String(active));
          });
        });
      });

      const btnRain = env.$('btn-rain');
      btnRain.addEventListener('click', () => {
        state.rain = !state.rain;
        rainMesh.visible = state.rain;
        btnRain.textContent = state.rain ? 'Chuva: On' : 'Chuva: Off';
        btnRain.setAttribute('aria-pressed', String(state.rain));
        audio.updateAmbient();
      });

      const btnSound = env.$('btn-sound');
      btnSound.addEventListener('click', () => {
        state.sound = !state.sound;
        if (state.sound) audio.init();
        audio.updateAmbient();
        btnSound.textContent = state.sound ? 'Som: On' : 'Som: Off';
        btnSound.setAttribute('aria-pressed', String(state.sound));
      });

      env.$('btn-reset-cam').addEventListener('click', () => {
        camera.position.set(0, 10.5, 16.5);
        controls.target.set(0, -0.2, 0);
        controls.update();
      });

      // =========================================================================
      // 16. MAIN ANIMATION LOOP
      // =========================================================================
      let lastTime = performance.now();
      let clockTime = 0;
      let rainRippleAcc = 0;
      let trailAcc = 0;

      function updateFishAgent(fish, dt, isGlowing = false) {
        fish.changeTimer -= dt;
        // Seek nearest food if not glowing
        let targetFood = null;
        if (!isGlowing && foodPellets.length > 0) {
          let bestDist = 5.5;
          for (const f of foodPellets) {
            const d = Math.hypot(f.x - fish.root.position.x, f.z - fish.root.position.z);
            if (d < bestDist) {
              bestDist = d;
              targetFood = f;
            }
          }
        }

        if (targetFood) {
          const dx = targetFood.x - fish.root.position.x;
          const dz = targetFood.z - fish.root.position.z;
          fish.targetAngle = Math.atan2(dx, dz);
          if (Math.hypot(dx, dz) < 0.45) {
            scene.remove(targetFood.mesh);
            foodPellets.splice(foodPellets.indexOf(targetFood), 1);
            addRipple(targetFood.x, targetFood.z, 0.06);
          }
        } else if (fish.changeTimer <= 0) {
          fish.targetAngle += (Math.random() - 0.5) * 1.6;
          fish.changeTimer = 2.0 + Math.random() * 3.5;
        }

        // Keep inside lake
        const r = Math.hypot(fish.root.position.x, fish.root.position.z);
        if (r > LAKE_RADIUS - 2.2) {
          const toCenter = Math.atan2(-fish.root.position.x, -fish.root.position.z);
          fish.targetAngle = toCenter + (Math.random() - 0.5) * 0.5;
        }

        // Smooth turn
        let diff = fish.targetAngle - fish.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        fish.angle += diff * Math.min(1, dt * 2.2);

        fish.root.position.x += Math.sin(fish.angle) * fish.speed * dt;
        fish.root.position.z += Math.cos(fish.angle) * fish.speed * dt;
        fish.root.position.y = fish.depth + Math.sin(clockTime * 1.8 + fish.wigglePhase) * 0.04;
        fish.root.rotation.y = fish.angle;

        // Articulated swimming motion
        fish.wigglePhase += dt * (4.5 + fish.speed * 2.2);
        fish.tailPivot.rotation.y = Math.sin(fish.wigglePhase) * 0.42;
        fish.bodyGroup.rotation.y = Math.sin(fish.wigglePhase - 0.8) * 0.08;
        fish.leftFin.rotation.z = Math.sin(fish.wigglePhase) * 0.25;
        fish.rightFin.rotation.z = -Math.sin(fish.wigglePhase) * 0.25;
      }

      function animate(now) {
        env.raf(animate);
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        clockTime += dt;
        waterUniforms.uTime.value = clockTime;

        // 1. Glowing fish 30s cycle
        if (state.glowActive) {
          state.glowDurationRemaining -= dt;
          updateFishAgent(glowingFish, dt, true);
          if (glowingFish.root.userData.aura) {
            const pulse = 1 + Math.sin(clockTime * 5) * 0.16;
            glowingFish.root.userData.aura.scale.set(pulse, pulse, pulse);
          }
          trailAcc += dt;
          if (trailAcc > 0.08) {
            trailAcc = 0;
            spawnParticles(
              glowingFish.root.position.x,
              glowingFish.root.position.y + 0.05,
              glowingFish.root.position.z,
              2,
              0x7ef9ff,
              true
            );
          }
          if (state.glowDurationRemaining <= 0) {
            deactivateGlowingFish();
          }
        } else {
          state.glowTimer -= dt;
          const secs = Math.max(0, Math.ceil(state.glowTimer));
          glowStatusText.textContent = `Peixe brilhante em ${secs}s`;
          if (state.glowTimer <= 0) {
            activateGlowingFish();
          }
        }

        // 2. Regular multi-species fish
        for (const f of fishList) {
          updateFishAgent(f, dt, false);
        }

        // 3. Clouds drift
        cloudsGroup.children.forEach((c) => {
          c.userData.angle += c.userData.speed * dt;
          c.position.x = Math.cos(c.userData.angle) * c.userData.dist;
          c.position.z = Math.sin(c.userData.angle) * c.userData.dist;
          c.lookAt(0, c.position.y, 0);
        });

        // 4. Sway underwater plants & shoreline reeds
        for (const blade of underwaterPlants) {
          blade.rotation.z = Math.sin(clockTime * 1.6 + blade.userData.phase) * 0.14;
        }
        for (const reed of reeds) {
          reed.rotation.x = Math.sin(clockTime * 1.4 + reed.userData.phase) * 0.06;
        }

        // 5. Bob lily pads
        for (const pad of lilyPads) {
          pad.position.y = 0.02 + Math.sin(clockTime * 1.5 + pad.userData.phase) * 0.015;
          pad.rotation.z = Math.sin(clockTime * 1.2 + pad.userData.phase) * 0.03;
        }

        // 6. Food pellets aging
        for (let i = foodPellets.length - 1; i >= 0; i--) {
          foodPellets[i].life -= dt;
          foodPellets[i].mesh.position.y = 0.025 + Math.sin(clockTime * 3 + i) * 0.01;
          if (foodPellets[i].life <= 0) {
            scene.remove(foodPellets[i].mesh);
            foodPellets.splice(i, 1);
          }
        }

        // 7. Falling stones
        for (let i = stonesList.length - 1; i >= 0; i--) {
          const s = stonesList[i];
          s.vy -= 14 * dt;
          s.mesh.position.y += s.vy * dt;
          if (!s.splashed && s.mesh.position.y <= 0) {
            s.splashed = true;
            addRipple(s.x, s.z, 0.15);
            spawnParticles(s.x, 0.08, s.z, 12, 0xe8fbff, false);
            audio.playDrop(320);
          }
          const bedY = getTerrainHeight(s.x, s.z);
          if (s.mesh.position.y <= bedY + 0.1) {
            scene.remove(s.mesh);
            stonesList.splice(i, 1);
          }
        }

        // 8. Dynamic splash & trail particles
        for (let i = dynamicParticles.length - 1; i >= 0; i--) {
          const p = dynamicParticles[i];
          p.life -= dt;
          p.vy -= p.gravity * dt;
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.material.dispose();
            dynamicParticles.splice(i, 1);
          }
        }

        // 9. Fireflies & Underwater motes
        const ffArr = ffGeo.attributes.position.array;
        for (let i = 0; i < fireflyCount; i++) {
          const b = ffBase[i];
          ffArr[i * 3] = b.x + Math.sin(clockTime * 0.7 + b.phase) * 0.45;
          ffArr[i * 3 + 1] = b.y + Math.cos(clockTime * 1.1 + b.phase) * 0.25;
          ffArr[i * 3 + 2] = b.z + Math.cos(clockTime * 0.6 + b.phase) * 0.45;
        }
        ffGeo.attributes.position.needsUpdate = true;

        // 10. Rain animation & ripples
        if (state.rain) {
          const rArr = rainGeo.attributes.position.array;
          for (let i = 0; i < rainCount; i++) {
            rArr[i * 3 + 1] -= 16 * dt;
            if (rArr[i * 3 + 1] < 0) {
              rArr[i * 3 + 1] = 12 + Math.random() * 4;
            }
          }
          rainGeo.attributes.position.needsUpdate = true;
          rainRippleAcc += dt;
          if (rainRippleAcc > 0.14) {
            rainRippleAcc = 0;
            const a = Math.random() * Math.PI * 2;
            const rad = Math.random() * (LAKE_RADIUS - 1);
            addRipple(Math.cos(a) * rad, Math.sin(a) * rad, 0.045);
          }
        }

        controls.update();
        renderer.render(scene, camera);
      }

      env.listen('resize', () => {
        camera.aspect = env.W() / env.H();
        camera.updateProjectionMatrix();
        renderer.setSize(env.W(), env.H());
      });

      // Kick off welcome ripple
      addRipple(0, 0, 0.11);
      env.raf(animate);
    })();
  
  return () => { __scene.dispose(); __runtime.dispose(); };
}
