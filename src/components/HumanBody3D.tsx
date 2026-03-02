import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { OrganInfo, organs } from '@/data/organs';
import * as THREE from 'three';

interface HumanBody3DProps {
  onSelectOrgan: (organ: OrganInfo) => void;
  selectedOrgan: OrganInfo | null;
}

const HumanModel = ({ onSelectOrgan, selectedOrgan }: HumanBody3DProps) => {
  const { scene } = useGLTF('/models/human-body.glb');
  const modelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Auto-rotate slowly
  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.15;
    }
  });

  const handleClick = useCallback(() => {
    // Cycle through organs on click for now
    if (!selectedOrgan) {
      onSelectOrgan(organs[0]);
    } else {
      const currentIndex = organs.findIndex(o => o.id === selectedOrgan.id);
      const nextIndex = (currentIndex + 1) % organs.length;
      onSelectOrgan(organs[nextIndex]);
    }
  }, [selectedOrgan, onSelectOrgan]);

  return (
    <group ref={modelRef} position={[0, -1, 0]} scale={1}>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        cursor={hovered ? 'pointer' : 'default'}
      />
    </group>
  );
};

const LoadingFallback = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshStandardMaterial color="#4fc3f7" wireframe />
  </mesh>
);

const SceneSetup = () => {
  const { gl } = useThree();
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.2;
  return null;
};

const HumanBody3D = ({ onSelectOrgan, selectedOrgan }: HumanBody3DProps) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 45 }}
        className="w-full h-full"
        dpr={[1, 2]}
      >
        <SceneSetup />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#4fc3f7" />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={<LoadingFallback />}>
          <HumanModel onSelectOrgan={onSelectOrgan} selectedOrgan={selectedOrgan} />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={false}
        />
      </Canvas>

      {/* Organ selection buttons overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 z-10 max-w-md px-4">
        {organs.map((organ) => (
          <button
            key={organ.id}
            onClick={() => onSelectOrgan(organ)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-md transition-all duration-300 ${
              selectedOrgan?.id === organ.id
                ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                : 'bg-card/70 text-foreground border-border/50 hover:bg-card hover:border-primary/50 hover:scale-105'
            }`}
          >
            {organ.emoji} {organ.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Preload the model
useGLTF.preload('/models/human-body.glb');

export default HumanBody3D;
