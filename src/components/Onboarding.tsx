import React, { useState } from 'react';
import * as THREE from 'three';
import { generateName, PATH_GENERATION_PROMPT, SPECIALIZATION_PROMPT } from '../characterCreation';
import { Dice } from './Dice';
import { SlotMachine } from './SlotMachine';

interface OnboardingProps {
  onCharacterCreated: (characterData: {
    path: string;
    special: string;
    name: string;
  }) => void;
}

export function Onboarding({ onCharacterCreated }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [generatedPath, setGeneratedPath] = useState('');
  const [characterName, setCharacterName] = useState(generateName());
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    sphere: THREE.Mesh;
  }>();

  React.useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(600, 600);
    canvasRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 10;

    // Create glowing wireframe sphere
    const geometry = new THREE.SphereGeometry(4, 12, 12);
    
    // Create multiple spheres for glow effect
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x33ff33,
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0x33ff33,
      wireframe: true,
      wireframeLinewidth: 1,
      transparent: true,
      opacity: 0.4
    });
    
    // Create inner and outer spheres for glow effect
    const sphere = new THREE.Group();
    const innerSphere = new THREE.Mesh(geometry, innerMaterial);
    const outerSphere = new THREE.Mesh(geometry.clone(), outerMaterial);
    outerSphere.scale.multiplyScalar(1.1); // Slightly larger
    
    sphere.add(innerSphere);
    sphere.add(outerSphere);
    
    scene.add(sphere);

    // Store references
    sceneRef.current = {
      renderer,
      scene,
      camera,
      sphere
    };

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      if (sceneRef.current) {
        // Faster rotation when spinning
        const speedMultiplier = isSpinning ? 8 : 1;
        sceneRef.current.sphere.rotation.y += 0.005 * speedMultiplier;
        sceneRef.current.sphere.rotation.x += 0.002 * speedMultiplier;
        sceneRef.current.sphere.rotation.z += 0.001 * speedMultiplier;
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
      }
    }
    animate();

    // Cleanup
    return () => {
      if (canvasRef.current && renderer.domElement) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isSpinning]);
  
  const handlePathGenerated = (path: string) => {
    setGeneratedPath(path);
    setStep(2);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generatedPath && characterName.trim()) {
      onCharacterCreated({
        path: generatedPath,
        name: characterName
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-black p-8 max-w-4xl w-full mx-4 relative">
        <div className={`min-h-[500px] flex flex-col items-center justify-between relative ${step !== 1 ? 'hidden' : ''}`}>
          {/* Background Elements */}
          <div className="absolute inset-0 flex flex-col items-center pointer-events-none">
            {/* Background Sphere */}
            <div 
              ref={canvasRef} 
              className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"
              style={{ width: '600px', height: '600px' }}
            />
            
            {/* ASCII Title */}
            <div className="text-[#33ff33] text-[0.75rem] font-mono relative z-10 scale-75 transform-gpu mt-[calc(10%+10px)]">
              <div className="whitespace-pre" style={{ lineHeight: '1' }}>
{`░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓██████████████▓▒░░▒▓███████▓▒░░▒▓███████▓▒░ ░▒▓██████▓▒░\n░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░\n░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░\n░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓███████▓▒░░▒▓█▓▒▒▓███▓▒░\n░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░\n░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░\n░▒▓████████▓▒░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░       ░▒▓██████▓▒░`}</div>
            </div>
          </div>
          
          {/* Single Slot Machine */}
          <div className="relative z-20 mt-auto mb-8">
            <SlotMachine 
              onComplete={handlePathGenerated}
              onSpinStart={() => setIsSpinning(true)}
              onSpinEnd={() => setIsSpinning(false)}
            />
          </div>
        </div>

        {step === 2 && (
          <form onSubmit={handleNameSubmit} className="space-y-4 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="text-[#33ff33] font-mono text-sm mb-4">
                <span className="typing-animation">World recipe</span>
              </div>
              <div className="text-xl font-bold text-[#33ff33]">{generatedPath}</div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter your character's name"
                className="w-full bg-transparent border border-[#33ff33] rounded px-4 py-2 pr-12 focus:outline-none focus:ring-1 focus:ring-[#33ff33]"
                autoFocus
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#33ff33] hover:text-[#33ff33]/80 text-sm px-2"
                onClick={async () => {
                  const name = generateName();
                  setCharacterName(name);
                }}
              >
                ↺
              </button>
            </div>
            <button
              type="submit"
              disabled={!characterName.trim()}
              className="w-full py-3 px-4 border border-[#33ff33] rounded hover:bg-[#33ff33]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Your Journey
            </button>
          </form>
        )}
      </div>
    </div>
  );
}