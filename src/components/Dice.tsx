import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DiceProps {
  onSubmit?: () => void;
  onRoll?: (value: number) => void;
  onAnimationComplete?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Dice({ onRoll, onSubmit, onAnimationComplete, disabled, className }: DiceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    d20Group: THREE.Group;
    faceTriangles: THREE.Mesh[];
    labelPlanes: THREE.Mesh[];
    faceNormals: THREE.Vector3[];
    isThrowing: boolean;
    throwStartTime: number;
    animate: () => void;
    setFaceUp: (faceIndex: number) => void;
    clearWinner: () => void;
    setWinner: (faceIndex: number) => void;
    pickRandomWinner: () => void;
  }>();

  useEffect(() => {
    if (!containerRef.current) return;

    const faceNormals: THREE.Vector3[] = [];

    // Scene setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      precision: 'highp'
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(96, 96); // Match the container size (24rem = 96px)
    containerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    camera.position.set(0, 4, 0);
    camera.rotation.x -= 0.01745;
    camera.lookAt(0, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0x33ff33, 0.7));
    const pointLight = new THREE.PointLight(0x33ff33, 0.8);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // D20 Group
    const d20Group = new THREE.Group();
    scene.add(d20Group);

    // D20 Geometry
    const geometry = new THREE.IcosahedronGeometry(1);
    if (!geometry.index) {
      const posAttr = geometry.getAttribute('position');
      const vertexCount = posAttr.count;
      const indices = [];
      for (let i = 0; i < vertexCount; i++) indices.push(i);
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    }
    geometry.computeVertexNormals();

    // Main mesh (semi-transparent)
    const d20Material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
    });
    const d20Mesh = new THREE.Mesh(geometry, d20Material);
    d20Group.add(d20Mesh);

    // Green edges
    const edgesGeo = new THREE.EdgesGeometry(geometry);
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (i === 0 && j === 0) continue;
        const edgeMat = new THREE.LineBasicMaterial({ 
          color: 0x33ff33,
          linewidth: 1,
          transparent: true,
          opacity: 0.8
        });
        const edgeMesh = new THREE.LineSegments(edgesGeo, edgeMat);
        edgeMesh.position.x = i * 0.002;
        edgeMesh.position.y = j * 0.002;
        d20Group.add(edgeMesh);
      }
    }

    // Face triangles and numbers
    const faceTriangles: THREE.Mesh[] = [];
    const labelPlanes: THREE.Mesh[] = [];
    const idxAttr = geometry.index!;
    const posAttr = geometry.getAttribute('position');
    const faceCount = idxAttr.count / 3;

    for (let f = 0; f < faceCount; f++) {
      const a = idxAttr.getX(f * 3 + 0);
      const b = idxAttr.getX(f * 3 + 1);
      const c = idxAttr.getX(f * 3 + 2);

      const aPos = new THREE.Vector3().fromBufferAttribute(posAttr, a);
      const bPos = new THREE.Vector3().fromBufferAttribute(posAttr, b);
      const cPos = new THREE.Vector3().fromBufferAttribute(posAttr, c);

      const ab = new THREE.Vector3().subVectors(bPos, aPos);
      const ac = new THREE.Vector3().subVectors(cPos, aPos);
      const normal = new THREE.Vector3().crossVectors(ab, ac).normalize();
      faceNormals.push(normal.clone());

      const triGeo = new THREE.BufferGeometry();
      const verts = new Float32Array([
        aPos.x, aPos.y, aPos.z,
        bPos.x, bPos.y, bPos.z,
        cPos.x, cPos.y, cPos.z
      ]);
      triGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      triGeo.computeVertexNormals();

      const triMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x000000,
        transparent: false,
        opacity: 1.0,
        side: THREE.DoubleSide,
      });
      const triMesh = new THREE.Mesh(triGeo, triMat);
      d20Group.add(triMesh);
      faceTriangles.push(triMesh);

      // Add number
      const centroid = new THREE.Vector3()
        .add(aPos)
        .add(bPos)
        .add(cPos)
        .divideScalar(3);

      const labelMesh = createNumberPlane(f + 1);
      labelMesh.position.copy(centroid).multiplyScalar(1.01);

      const up = new THREE.Vector3(0, 0, 1);
      const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
      labelMesh.quaternion.copy(q);

      d20Group.add(labelMesh);
      labelPlanes.push(labelMesh);
    }

    // Animation
    let isThrowing = false;
    let throwStartTime = 0;
    const throwDuration = 1.0;
    const startY = -0.5;
    let animationCompleteCallback: (() => void) | null = null;
    const peakY = +0.5;
    const endY = -0.5;

    function animate() {
      requestAnimationFrame(sceneRef.current!.animate);

      if (sceneRef.current!.isThrowing) {
        const elapsed = (performance.now() - sceneRef.current!.throwStartTime) / 1000;
        let t = elapsed / throwDuration;
        if (t >= 1) {
          t = 1;
          sceneRef.current!.isThrowing = false;
          // Simulate Enter key press after dice finishes spinning
          if (onSubmit) {
            onSubmit();
          }
          if (animationCompleteCallback) {
            animationCompleteCallback();
            animationCompleteCallback = null;
          }
          pickRandomWinner();
        }

        const arcY = startY + (peakY - startY) * 4 * t * (1 - t);
        d20Group.position.y = arcY;

        d20Group.rotation.x += 0.15;
        d20Group.rotation.y += 0.2;
        d20Group.rotation.z += 0.1;
      }

      renderer.render(scene, camera);
    }

    // Helper functions
    function setFaceUp(faceIndex: number) {
      const upVec = new THREE.Vector3(0, 1, 0);
      const normal = faceNormals[faceIndex];
      const q = new THREE.Quaternion().setFromUnitVectors(normal, upVec);
      d20Group.setRotationFromQuaternion(q);
    }

    function clearWinner() {
      faceTriangles.forEach(triMesh => {
        triMesh.material.color.set(0x000000);
        triMesh.material.opacity = 1.0;
        triMesh.material.transparent = false;
      });
      labelPlanes.forEach((plane, i) => {
        const faceNum = i + 1;
        plane.material.map = createNumberTexture(faceNum, '#33ff33');
        plane.material.map.needsUpdate = true;
      });
    }

    function setWinner(faceIndex: number) {
      faceTriangles[faceIndex].material.color.set(0x33ff33);
      faceTriangles[faceIndex].material.opacity = 1.0;
      faceTriangles[faceIndex].material.transparent = false;

      const faceNum = faceIndex + 1;
      const blackTex = createNumberTexture(faceNum, '#000000');
      labelPlanes[faceIndex].material.map = blackTex;
      labelPlanes[faceIndex].material.map.needsUpdate = true;
    }

    function pickRandomWinner() {
      const winner = Math.floor(Math.random() * 20);
      console.log('Dice roll result:', winner + 1);
      setFaceUp(winner);
      setWinner(winner);
      onRoll?.(winner + 1); // Add 1 since face indices are 0-based
    }

    // Store references
    sceneRef.current = {
      renderer,
      scene,
      camera,
      d20Group,
      faceNormals,
      faceTriangles,
      labelPlanes,
      isThrowing: false,
      throwStartTime: 0,
      animate,
      setFaceUp,
      clearWinner,
      setWinner,
      pickRandomWinner
    };

    // Initial setup
    setFaceUp(0);
    clearWinner();
    setWinner(0);

    // Start animation
    animate();

    // Click handler
    const handleClick = () => {
      console.log('Dice clicked:', { isThrowing: sceneRef.current!.isThrowing, disabled });
      if (sceneRef.current!.isThrowing || disabled) {
        return;
      }
      
      console.log('Starting dice throw animation');
      sceneRef.current!.isThrowing = true;
      if (onAnimationComplete) {
        animationCompleteCallback = onAnimationComplete;
      }
      sceneRef.current!.throwStartTime = performance.now();
      sceneRef.current!.clearWinner();
      console.log('Dice animation started');
      
      // After animation completes, trigger the callback
      if (onAnimationComplete) {
        animationCompleteCallback = onAnimationComplete;
      }
    };

    containerRef.current.addEventListener('click', handleClick);
    
    // Add pointer-events: none when disabled
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = disabled ? 'none' : 'auto';
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [disabled]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''} ${disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer'}`} 
    />
  );
}

function createNumberTexture(num: number, textColor = '#33ff33') {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = textColor;
  ctx.font = 'bold 160px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(num.toString(), size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createNumberPlane(num: number, color = '#33ff33') {
  const planeGeom = new THREE.PlaneGeometry(0.7, 0.7);
  const texture = createNumberTexture(num, color);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9
  });
  return new THREE.Mesh(planeGeom, planeMat);
}