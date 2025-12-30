
"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const TreeVisualization = ({ emotions = [], onLeafClick, isModal = false }) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const leavesGroupRef = useRef(null);
    const nativeLeavesGroupRef = useRef(null);
    const leafAnchorsRef = useRef([]);
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());

    const leafMeshesRef = useRef(new Map());

    // --- TEXTURE GENERATION ---

    const createBarkTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base Brown
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(0, 0, 512, 512);

        // Noise/Stripes
        for (let i = 0; i < 300; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#4E342E' : '#2D1B18';
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const w = Math.random() * 5 + 1;
            const h = Math.random() * 100 + 20;
            ctx.fillRect(x, y, w, h);
        }

        return new THREE.CanvasTexture(canvas);
    }

    const createNativeLeafTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const cx = 64;
        const cy = 64;

        // Leaf Shape
        ctx.beginPath();
        ctx.moveTo(cx, 120);
        ctx.bezierCurveTo(20, 90, 20, 40, cx, 10);
        ctx.bezierCurveTo(108, 40, 108, 90, cx, 120);

        const grad = ctx.createLinearGradient(0, 0, 128, 128);
        grad.addColorStop(0, '#558B2F');
        grad.addColorStop(1, '#33691E');
        ctx.fillStyle = grad;
        ctx.fill();

        // Veins
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, 120);
        ctx.lineTo(cx, 20);
        ctx.stroke();

        return new THREE.CanvasTexture(canvas);
    };

    // Message Leaf Texture (Improved)
    const createLeafTexture = (color) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const width = 512; // Higher Res
        const height = 512;
        canvas.width = width;
        canvas.height = height;
        const cx = width / 2;
        const cy = height / 2;

        // More Organic Leaf Shape
        ctx.beginPath();
        ctx.moveTo(cx, 480);
        ctx.bezierCurveTo(80, 350, 40, 100, cx, 20);
        ctx.bezierCurveTo(472, 100, 432, 350, cx, 480);

        // Base Color
        ctx.fillStyle = color;
        ctx.fill();

        // Texture/Grain (Noise)
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // If pixel is not transparent
                const noise = (Math.random() - 0.5) * 20;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
            }
        }
        ctx.putImageData(imageData, 0, 0);

        // Gradient Overlay
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, 'rgba(255,255,255,0.3)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.1)');
        ctx.fillStyle = grad;
        ctx.fill(); // Re-fill shape with gradient

        // Veins
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, 480);
        ctx.quadraticCurveTo(cx + 10, 250, cx, 40); // Slight curve to main vein
        ctx.stroke();

        // Side veins
        for (let i = 1; i <= 6; i++) {
            let y = 480 - i * 65;
            ctx.lineWidth = 3 - (i * 0.2);

            // Left
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx - 60, y - 40, cx - 120, y - 80);
            ctx.stroke();

            // Right
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx + 60, y - 40, cx + 120, y - 80);
            ctx.stroke();
        }

        // Edge Highlight
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,255, 0.3)';
        ctx.stroke();

        return new THREE.CanvasTexture(canvas);
    };

    useEffect(() => {
        if (!containerRef.current) return;

        try {
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            const scene = new THREE.Scene();
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            camera.position.set(0, 30, 85); // Slightly further back
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.setClearColor(0x000000, 0);
            // Tone mapping for better look
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;

            containerRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.maxPolarAngle = Math.PI / 2 - 0.1;
            controls.minDistance = 40;
            controls.maxDistance = 150;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.8;
            controls.target.set(0, 25, 0);
            controlsRef.current = controls;

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xfffaed, 1.5); // Warm sun
            dirLight.position.set(50, 80, 50);
            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = 2048;
            dirLight.shadow.mapSize.height = 2048;
            scene.add(dirLight);

            // Backlight for subsurface effect feel
            const backLight = new THREE.SpotLight(0xaaccff, 0.8);
            backLight.position.set(-50, 50, -50);
            scene.add(backLight);

            // Floor (Shadow Catcher)
            const floorGeo = new THREE.PlaneGeometry(300, 300);
            const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);

            const treeGroup = new THREE.Group();
            treeGroup.position.set(0, -10, 0);
            scene.add(treeGroup);

            const nativeGroup = new THREE.Group();
            treeGroup.add(nativeGroup);
            nativeLeavesGroupRef.current = nativeGroup;

            const leavesGroup = new THREE.Group();
            treeGroup.add(leavesGroup);
            leavesGroupRef.current = leavesGroup;

            const barkTexture = createBarkTexture();
            const materials = {
                wood: new THREE.MeshStandardMaterial({
                    map: barkTexture,
                    color: 0x8D6E63,
                    roughness: 1.0,
                    bumpMap: barkTexture,
                    bumpScale: 0.5
                }),
                nativeLeaf: new THREE.SpriteMaterial({
                    map: createNativeLeafTexture(),
                    color: 0xffffff, // Use texture color
                    transparent: true,
                })
            };

            const growBranch = (startPos, length, radius, depth, rotation) => {
                const maxDepth = 5; // Reduced depth slightly for performance with high detail

                // Branch Meshes
                const geometry = new THREE.CylinderGeometry(radius * 0.7, radius, length, 8);
                geometry.translate(0, length / 2, 0);

                // Jitter verticies for organic look look
                const positionAttribute = geometry.attributes.position;
                for (let i = 0; i < positionAttribute.count; i++) {
                    const y = positionAttribute.getY(i);
                    if (y > 0 && y < length) { // Don't jitter base/top too much to keep connections
                        const amp = 0.1 * radius;
                        positionAttribute.setX(i, positionAttribute.getX(i) + (Math.random() - 0.5) * amp);
                        positionAttribute.setZ(i, positionAttribute.getZ(i) + (Math.random() - 0.5) * amp);
                    }
                }
                geometry.computeVertexNormals();

                const branch = new THREE.Mesh(geometry, materials.wood);
                branch.position.copy(startPos);
                branch.rotation.copy(rotation);
                branch.castShadow = true;
                branch.receiveShadow = true;
                treeGroup.add(branch);

                const tipPosition = new THREE.Vector3(0, length, 0);
                tipPosition.applyEuler(rotation);
                tipPosition.add(startPos);

                // Add foliage/native leaves
                if (depth >= maxDepth - 2) {
                    const numNativeLeaves = Math.floor(Math.random() * 4) + 2;
                    for (let k = 0; k < numNativeLeaves; k++) {
                        const leaf = new THREE.Sprite(materials.nativeLeaf.clone());
                        // Color variation
                        const hue = 0.25 + (Math.random() * 0.1); // Green range
                        leaf.material.color.setHSL(hue, 0.6, 0.4);

                        const offset = new THREE.Vector3(
                            (Math.random() - 0.5) * 5, // Wider spread
                            (Math.random() - 0.5) * 5,
                            (Math.random() - 0.5) * 5
                        );
                        leaf.position.copy(tipPosition).add(offset);
                        leaf.scale.set(3, 3, 1); // Bigger native leaves
                        nativeGroup.add(leaf);
                    }
                }

                // Add anchors for Message Leaves
                if (depth >= maxDepth - 1) {
                    leafAnchorsRef.current.push(tipPosition.clone());
                }

                if (depth >= maxDepth) return;

                const numBranches = depth === 0 ? 3 : Math.floor(Math.random() * 2) + 2;

                for (let i = 0; i < numBranches; i++) {
                    const newLength = length * (0.8 + Math.random() * 0.1);
                    const newRadius = radius * 0.6;
                    const angleSpread = 0.7 + (depth * 0.3);
                    const angleX = rotation.x + (Math.random() - 0.5) * angleSpread;
                    const angleZ = rotation.z + (Math.random() - 0.5) * angleSpread;
                    const angleY = rotation.y + (Math.random() - 0.5) * 2.0; // More twist

                    const newRotation = new THREE.Euler(angleX, angleY, angleZ);
                    growBranch(tipPosition, newLength, newRadius, depth + 1, newRotation);
                }
            };

            leafAnchorsRef.current = [];
            growBranch(new THREE.Vector3(0, 0, 0), 12, 1.8, 0, new THREE.Euler(0, 0, 0));
            leafAnchorsRef.current.sort(() => Math.random() - 0.5);

            const onMouseMove = (event) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            };

            const onClick = (event) => {
                if (!cameraRef.current || !leavesGroupRef.current) return;
                raycaster.current.setFromCamera(mouse.current, cameraRef.current);
                const intersects = raycaster.current.intersectObjects(leavesGroupRef.current.children);
                if (intersects.length > 0) {
                    const object = intersects[0].object;
                    if (onLeafClick && object.userData) {
                        onLeafClick(object.userData);

                        // "Jump" animation
                        const startY = object.position.y;
                        const jumpHeight = 8;
                        let frame = 0;
                        const jumpAnim = () => {
                            frame++;
                            object.position.y = startY + Math.sin(frame * 0.15) * jumpHeight;
                            if (frame < 20) requestAnimationFrame(jumpAnim);
                            else object.position.y = startY;
                        }
                        jumpAnim();
                    }
                }
            };

            const elm = renderer.domElement;
            elm.addEventListener('mousemove', onMouseMove);
            elm.addEventListener('click', onClick);

            const clock = new THREE.Clock();

            const animate = () => {
                requestAnimationFrame(animate);
                const time = clock.getElapsedTime();

                if (controlsRef.current) controlsRef.current.update();

                // Gentle Wind Animation
                if (nativeLeavesGroupRef.current) {
                    nativeLeavesGroupRef.current.children.forEach((child, i) => {
                        child.position.x += Math.cos(time * 0.5 + i) * 0.003;
                        child.position.y += Math.sin(time * 0.7 + i) * 0.003;
                    });
                }

                if (cameraRef.current && leavesGroupRef.current) {
                    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
                    const intersects = raycaster.current.intersectObjects(leavesGroupRef.current.children);
                    const hoveredObject = intersects.length > 0 ? intersects[0].object : null;

                    leavesGroupRef.current.children.forEach((child, i) => {
                        // Wind
                        child.position.y += Math.sin(time + i) * 0.005;

                        // Hover effect
                        const isHovered = child === hoveredObject;
                        const targetScale = isHovered ? 9.0 : 7.0; // Larger

                        child.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);

                        const targetRotation = isHovered ? child.userData.baseRotation + 0.5 : child.userData.baseRotation;
                        child.material.rotation += (targetRotation - child.material.rotation) * 0.1;
                    });

                    elm.style.cursor = hoveredObject ? 'pointer' : 'default';
                }

                if (rendererRef.current && sceneRef.current && cameraRef.current) {
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                }
            };
            animate();

            const handleResize = () => {
                if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;
                cameraRef.current.aspect = w / h;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(w, h);
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                elm.removeEventListener('mousemove', onMouseMove);
                elm.removeEventListener('click', onClick);
                if (containerRef.current && renderer.domElement) {
                    containerRef.current.removeChild(renderer.domElement);
                }
                controls.dispose();
                // Dispose resources...
                renderer.dispose();
            };
        } catch (e) {
            console.error("Three.js initialization error:", e);
        }
    }, []);

    useEffect(() => {
        if (!leavesGroupRef.current || !emotions) return;

        // Clear existing
        leafMeshesRef.current.forEach((sprite) => {
            leavesGroupRef.current?.remove(sprite);
            if (sprite.material.map) sprite.material.map.dispose();
            sprite.material.dispose();
        });
        leafMeshesRef.current.clear();

        emotions.forEach((emo, index) => {
            const totalAnchors = leafAnchorsRef.current.length;
            if (totalAnchors === 0) return;

            const anchorIndex = index % totalAnchors;
            const position = leafAnchorsRef.current[anchorIndex];

            if (position) {
                const texture = createLeafTexture(emo.color);
                if (texture) {
                    const material = new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true,
                        rotation: (Math.random() - 0.5) * 0.5 // Random initial tilt
                    });
                    const sprite = new THREE.Sprite(material);

                    sprite.position.copy(position).add(new THREE.Vector3(
                        (Math.random() - 0.5) * 6,
                        (Math.random() - 0.5) * 6,
                        (Math.random() - 0.5) * 6
                    ));

                    sprite.scale.set(0, 0, 1);
                    sprite.userData = { ...emo, baseRotation: material.rotation };

                    leavesGroupRef.current?.add(sprite);
                    leafMeshesRef.current.set(emo.id, sprite);

                    let s = 0;
                    const targetScale = 7.0;
                    const growInterval = setInterval(() => {
                        s += 0.3;
                        sprite.scale.set(s, s, 1);
                        if (s >= targetScale) clearInterval(growInterval);
                    }, 16);
                }
            }
        });
    }, [emotions]);

    return <div ref={containerRef} style={{ width: '100%', height: isModal ? '100vh' : '100%', minHeight: isModal ? 'auto' : '600px', pointerEvents: 'auto' }} />;
};

export default TreeVisualization;
