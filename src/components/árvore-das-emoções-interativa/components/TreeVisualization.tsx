
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EmotionData } from '../types';

interface TreeVisualizationProps {
  emotions: EmotionData[];
  onLeafClick: (emotion: EmotionData) => void;
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ emotions, onLeafClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const leavesGroupRef = useRef<THREE.Group | null>(null);
  const nativeLeavesGroupRef = useRef<THREE.Group | null>(null);
  const leafAnchorsRef = useRef<THREE.Vector3[]>([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  const leafMeshesRef = useRef<Map<string, THREE.Sprite>>(new Map());

  // Textura para folhas nativas (decoração)
  const createNativeLeafTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.moveTo(32, 60);
        ctx.bezierCurveTo(10, 40, 10, 20, 32, 4);
        ctx.bezierCurveTo(54, 20, 54, 40, 32, 60);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(24, 32, 8, 16, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
  };

  // Textura para folhas interativas (Emoções)
  const createLeafTexture = (text: string | undefined, color: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const width = 512;
    const height = 256;
    canvas.width = width;
    canvas.height = height;
    const centerY = height / 2;

    // --- DESENHO DA FORMA ---
    ctx.beginPath();
    ctx.moveTo(40, centerY);
    ctx.bezierCurveTo(120, 10, 380, 10, 480, centerY);
    ctx.bezierCurveTo(380, 246, 120, 246, 40, centerY);
    
    // Cor base
    ctx.fillStyle = color;
    ctx.fill();

    // Gradiente
    ctx.globalCompositeOperation = 'source-atop'; 
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Nervuras
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Um pouco mais escuro para contraste
    ctx.lineCap = 'round';

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(40, centerY);
    ctx.lineTo(470, centerY);
    ctx.stroke();

    ctx.lineWidth = 3;
    const startX = 100;
    const endX = 400;
    const step = 60;
    for (let x = startX; x < endX; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.quadraticCurveTo(x + 30, centerY - 40, x + 50, centerY - 80);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.quadraticCurveTo(x + 30, centerY + 40, x + 50, centerY + 80);
        ctx.stroke();
    }

    // Borda
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();

    // Texto (Opcional - se houver texto, desenha)
    if (text) {
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        let fontSize = 48;
        if (text.length > 8) fontSize = 40;
        if (text.length > 12) fontSize = 32;
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.fillText(text.toUpperCase(), 240, centerY);
    } else {
        // Se não houver texto, desenha um pequeno símbolo de brilho ou interrogação sutil
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `900 60px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // ctx.fillText("?", 240, centerY); // Opcional: Interrogação
    }

    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // --- 1. SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 30, 120);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 70); // Câmera um pouco mais longe para ver a árvore toda
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 30;
    controls.maxDistance = 120;
    controls.target.set(0, 20, 0); // Foco no centro da copa
    controlsRef.current = controls;

    // --- 2. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(30, 60, 40);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- 3. FLOOR ---
    const floorGeo = new THREE.PlaneGeometry(300, 300);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x7CFC00, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- 4. TREE GENERATION ---
    const treeGroup = new THREE.Group();
    // Centraliza a árvore no mundo
    treeGroup.position.set(0, 0, 0);
    scene.add(treeGroup);

    const nativeGroup = new THREE.Group();
    treeGroup.add(nativeGroup);
    nativeLeavesGroupRef.current = nativeGroup;

    const leavesGroup = new THREE.Group();
    treeGroup.add(leavesGroup);
    leavesGroupRef.current = leavesGroup;

    const materials = {
      wood: new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9, flatShading: true }),
      nativeLeaf: new THREE.SpriteMaterial({ 
          map: createNativeLeafTexture(),
          color: 0x2E7D32,
          transparent: true,
      })
    };

    const growBranch = (startPos: THREE.Vector3, length: number, radius: number, depth: number, rotation: THREE.Euler) => {
      const maxDepth = 6;
      
      const geometry = new THREE.CylinderGeometry(radius * 0.7, radius, length, 7);
      geometry.translate(0, length / 2, 0);
      const branch = new THREE.Mesh(geometry, materials.wood);
      branch.position.copy(startPos);
      branch.rotation.copy(rotation);
      branch.castShadow = true;
      branch.receiveShadow = true;
      treeGroup.add(branch);

      const tipPosition = new THREE.Vector3(0, length, 0);
      tipPosition.applyEuler(rotation);
      tipPosition.add(startPos);

      // Folhas nativas decorativas
      if (depth >= maxDepth - 1) {
          const numNativeLeaves = Math.floor(Math.random() * 3) + 2;
          for(let k=0; k<numNativeLeaves; k++) {
              const leaf = new THREE.Sprite(materials.nativeLeaf.clone());
              leaf.material.color.setHSL(0.3 + Math.random() * 0.1, 0.6, 0.3 + Math.random() * 0.2);
              const offset = new THREE.Vector3(
                  (Math.random() - 0.5) * 2.5,
                  (Math.random() - 0.5) * 2.5,
                  (Math.random() - 0.5) * 2.5
              );
              leaf.position.copy(tipPosition).add(offset);
              leaf.scale.set(1.5, 1.5, 1);
              nativeGroup.add(leaf);
          }
      }

      // Âncoras para folhas interativas
      if (depth >= maxDepth - 2) {
        leafAnchorsRef.current.push(tipPosition.clone());
      }
      
      if (depth >= maxDepth) return;

      const numBranches = depth === 0 ? 3 : Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numBranches; i++) {
        const newLength = length * (0.75 + Math.random() * 0.1);
        const newRadius = radius * 0.65;
        const angleSpread = 0.8 + (depth * 0.2);
        const angleX = rotation.x + (Math.random() - 0.5) * angleSpread;
        const angleZ = rotation.z + (Math.random() - 0.5) * angleSpread;
        const angleY = rotation.y + (Math.random() - 0.5) * 1.5;
        
        const newRotation = new THREE.Euler(angleX, angleY, angleZ);
        growBranch(tipPosition, newLength, newRadius, depth + 1, newRotation);
      }
    };

    leafAnchorsRef.current = [];
    growBranch(new THREE.Vector3(0, 0, 0), 8, 1.2, 0, new THREE.Euler(0, 0, 0));
    // Embaralha as posições para distribuição natural
    leafAnchorsRef.current.sort(() => Math.random() - 0.5);

    // --- 5. INTERACTIVITY ---
    const onMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = (event: MouseEvent) => {
      if (!cameraRef.current || !leavesGroupRef.current) return;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(leavesGroupRef.current.children);
      if (intersects.length > 0) {
        const object = intersects[0].object;
        const emotionId = object.userData.id;
        const event = new CustomEvent('leaf-click', { detail: emotionId });
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // --- 6. ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (controlsRef.current) controlsRef.current.update();
      
      if (nativeLeavesGroupRef.current) {
          nativeLeavesGroupRef.current.children.forEach((child, i) => {
             child.position.x += Math.cos(time + i) * 0.002;
             child.position.y += Math.sin(time * 2 + i) * 0.002;
          });
      }

      if (cameraRef.current && leavesGroupRef.current) {
        raycaster.current.setFromCamera(mouse.current, cameraRef.current);
        const intersects = raycaster.current.intersectObjects(leavesGroupRef.current.children);
        const hoveredObject = intersects.length > 0 ? intersects[0].object : null;
        
        leavesGroupRef.current.children.forEach((child, i) => {
           child.position.y += Math.sin(time * 1.5 + i) * 0.005;

           const isHovered = child === hoveredObject;
           
           // Aumenta bastante no hover para convidar ao clique
           const targetScale = isHovered ? 7.0 : 5.0; 
           child.scale.lerp(new THREE.Vector3(targetScale, targetScale / 2, 1), 0.1);

           const targetRotation = isHovered ? 0.3 : 0;
           child.rotation.z += (targetRotation - child.rotation.z) * 0.1;
        });

        document.body.style.cursor = hoveredObject ? 'pointer' : 'default';
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // --- UPDATE LEAVES ---
  useEffect(() => {
    if (!leavesGroupRef.current) return;

    // Reset se array estiver vazio
    if (emotions.length === 0) {
        leafMeshesRef.current.forEach((sprite) => {
            leavesGroupRef.current?.remove(sprite);
            sprite.material.dispose();
        });
        leafMeshesRef.current.clear();
        return;
    }

    const currentIds = new Set(emotions.map(e => e.id));
    
    // Remove antigas
    leafMeshesRef.current.forEach((sprite, id) => {
        if (!currentIds.has(id)) {
            leavesGroupRef.current?.remove(sprite);
            sprite.material.dispose();
            leafMeshesRef.current.delete(id);
        }
    });

    // Adiciona novas
    emotions.forEach((emo, index) => {
      if (leafMeshesRef.current.has(emo.id)) return;

      const totalAnchors = leafAnchorsRef.current.length;
      if (totalAnchors === 0) return;

      // Distribuição cíclica nos pontos de ancoragem disponíveis
      const anchorIndex = (index * 2) % totalAnchors; // *2 para espalhar mais
      const position = leafAnchorsRef.current[anchorIndex];

      if (position) {
        const texture = createLeafTexture(emo.text, emo.color);
        if (texture) {
            const material = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                alphaTest: 0.1,
                depthWrite: false // Ajuda na transparência
            });
            const sprite = new THREE.Sprite(material);
            
            // Adiciona variação aleatória pequena à posição para não sobrepor se usar a mesma âncora
            sprite.position.copy(position).add(new THREE.Vector3(
                (Math.random()-0.5) * 2, 
                (Math.random()-0.5) * 2, 
                (Math.random()-0.5) * 2
            ));
            
            sprite.scale.set(0, 0, 1);
            sprite.userData = { id: emo.id, color: emo.color };
            
            leavesGroupRef.current?.add(sprite);
            leafMeshesRef.current.set(emo.id, sprite);

            // Pop-in animation
            let s = 0;
            const targetScale = 5.0; 
            const growInterval = setInterval(() => {
              s += 0.25;
              sprite.scale.set(s, s / 2, 1); 
              if (s >= targetScale) clearInterval(growInterval);
            }, 16);
        }
      }
    });
  }, [emotions]);

  useEffect(() => {
    const handleLeafClick = (e: CustomEvent) => {
      const clickedEmotion = emotions.find(em => em.id === e.detail);
      if (clickedEmotion) {
        onLeafClick(clickedEmotion);
      }
    };
    window.addEventListener('leaf-click', handleLeafClick as EventListener);
    return () => window.removeEventListener('leaf-click', handleLeafClick as EventListener);
  }, [emotions, onLeafClick]);

  return <div ref={containerRef} id="canvas-container" />;
};

export default TreeVisualization;
