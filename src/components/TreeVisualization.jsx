
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
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

    // Native leaves for tree fullness
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

    // Message Leaf Texture (No text, just beautiful color shape)
    const createLeafTexture = (color) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const width = 256;
        const height = 256;
        canvas.width = width;
        canvas.height = height;
        const cx = width / 2;
        const cy = height / 2;

        // Draw Leaf Shape
        ctx.beginPath();
        ctx.moveTo(cx, 240); // Base
        ctx.bezierCurveTo(20, 180, 20, 60, cx, 20); // Left curve
        ctx.bezierCurveTo(236, 60, 236, 180, cx, 240); // Right curve

        ctx.fillStyle = color;
        ctx.fill();

        // Gradient overlay for depth
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, 'rgba(255,255,255,0.4)');
        grad.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Veins
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, 240);
        ctx.lineTo(cx, 40);
        ctx.stroke();

        // Side veins
        for (let i = 1; i <= 4; i++) {
            let y = 240 - i * 40;
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx - 30, y - 20, cx - 60, y - 40);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx + 30, y - 20, cx + 60, y - 40);
            ctx.stroke();
        }

        // Highlight Stroke
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255, 0.5)';
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
            camera.position.set(0, 30, 70);
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.setClearColor(0x000000, 0);

            containerRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.maxPolarAngle = Math.PI / 2 - 0.05;
            controls.minDistance = 30;
            controls.maxDistance = 120;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.0;
            controls.target.set(0, 20, 0);
            controlsRef.current = controls;

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
            dirLight.position.set(30, 60, 40);
            dirLight.castShadow = true;
            scene.add(dirLight);

            const floorGeo = new THREE.PlaneGeometry(300, 300);
            const floorMat = new THREE.ShadowMaterial({ opacity: 0.3 });
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

            const materials = {
                wood: new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9, flatShading: true }),
                nativeLeaf: new THREE.SpriteMaterial({
                    map: createNativeLeafTexture(),
                    color: 0x2E7D32,
                    transparent: true,
                })
            };

            const growBranch = (startPos, length, radius, depth, rotation) => {
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

                if (depth >= maxDepth - 1) {
                    const numNativeLeaves = Math.floor(Math.random() * 3) + 2;
                    for (let k = 0; k < numNativeLeaves; k++) {
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
            // Shuffle anchors
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

                        // "Jump" animation on click
                        const startY = object.position.y;
                        const jumpHeight = 5;
                        let frame = 0;
                        const jumpAnim = () => {
                            frame++;
                            object.position.y = startY + Math.sin(frame * 0.2) * jumpHeight;
                            if (frame < 15) requestAnimationFrame(jumpAnim);
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

                // Animate native leaves
                if (nativeLeavesGroupRef.current) {
                    nativeLeavesGroupRef.current.children.forEach((child, i) => {
                        child.position.x += Math.cos(time + i) * 0.002;
                        child.position.y += Math.sin(time * 2 + i) * 0.002;
                    });
                }

                // Interactive Leaves Animation
                if (cameraRef.current && leavesGroupRef.current) {
                    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
                    const intersects = raycaster.current.intersectObjects(leavesGroupRef.current.children);
                    const hoveredObject = intersects.length > 0 ? intersects[0].object : null;

                    leavesGroupRef.current.children.forEach((child, i) => {
                        child.position.y += Math.sin(time * 1.5 + i) * 0.005;

                        const isHovered = child === hoveredObject;
                        // Increased scale by ~20% (Base 6.0/7.0 instead of 5.0)
                        const targetScale = isHovered ? 8.0 : 6.0;

                        // Lerp scale
                        child.scale.lerp(new THREE.Vector3(targetScale, targetScale / 2, 1), 0.1);

                        const targetRotation = isHovered ? 0.3 : 0;
                        child.rotation.z += (targetRotation - child.rotation.z) * 0.1;
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
                scene.traverse((object) => {
                    if (object.isMesh || object.isSprite) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(mat => {
                                    if (mat.map) mat.map.dispose();
                                    mat.dispose();
                                });
                            } else {
                                if (object.material.map) object.material.map.dispose();
                                object.material.dispose();
                            }
                        }
                    }
                });
                Object.values(materials).forEach(mat => {
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                });
                renderer.dispose();
            };
        } catch (e) {
            console.error("Three.js initialization error:", e);
        }
    }, []);

    useEffect(() => {
        if (!leavesGroupRef.current || !emotions) return;

        if (emotions.length === 0) {
            leafMeshesRef.current.forEach((sprite) => {
                leavesGroupRef.current?.remove(sprite);
                if (sprite.material.map) sprite.material.map.dispose();
                sprite.material.dispose();
            });
            leafMeshesRef.current.clear();
            return;
        }

        // Just clear and rebuild for simplicity on "Reconstruct"
        leafMeshesRef.current.forEach((sprite) => {
            leavesGroupRef.current?.remove(sprite);
            if (sprite.material.map) sprite.material.map.dispose();
            sprite.material.dispose();
        });
        leafMeshesRef.current.clear();

        emotions.forEach((emo, index) => {
            const totalAnchors = leafAnchorsRef.current.length;
            if (totalAnchors === 0) return;

            // Pick anchor
            const anchorIndex = index % totalAnchors;
            const position = leafAnchorsRef.current[anchorIndex];

            if (position) {
                const texture = createLeafTexture(emo.color); // Pass color only
                if (texture) {
                    const material = new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true,
                        alphaTest: 0.1,
                        depthWrite: false
                    });
                    const sprite = new THREE.Sprite(material);

                    sprite.position.copy(position).add(new THREE.Vector3(
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3
                    ));

                    sprite.scale.set(0, 0, 1);
                    sprite.userData = { ...emo }; // pass full emo object to click handler

                    leavesGroupRef.current?.add(sprite);
                    leafMeshesRef.current.set(emo.id, sprite);

                    let s = 0;
                    const targetScale = 6.0; // Larger leaves
                    const growInterval = setInterval(() => {
                        s += 0.25;
                        sprite.scale.set(s, s / 2, 1);
                        if (s >= targetScale) clearInterval(growInterval);
                    }, 16);
                }
            }
        });
    }, [emotions]); // Re-run when emotions change (e.g., Shuffle)

    return <div ref={containerRef} style={{ width: '100%', height: isModal ? '100vh' : '100%', minHeight: isModal ? 'auto' : '500px', pointerEvents: 'auto' }} />;
};

export default TreeVisualization;
