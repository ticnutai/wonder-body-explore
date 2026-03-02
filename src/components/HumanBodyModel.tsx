import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { OrganInfo, organs } from '@/data/organs';
import * as THREE from 'three';

interface OrganMeshProps {
  organ: OrganInfo;
  onSelect: (organ: OrganInfo) => void;
  isSelected: boolean;
}

const OrganMesh = ({ organ, onSelect, isSelected }: OrganMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetEmissive = hovered || isSelected ? 0.6 : 0;
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      targetEmissive,
      delta * 5
    );
    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(
        organ.scale[0] * targetScale,
        organ.scale[1] * targetScale,
        organ.scale[2] * targetScale
      ),
      delta * 5
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={organ.position}
      scale={organ.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(organ);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color={hovered || isSelected ? organ.hoverColor : organ.color}
        emissive={organ.color}
        emissiveIntensity={0}
        transparent
        opacity={hovered || isSelected ? 0.95 : 0.7}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
};

const BodyOutline = () => {
  const points = [
    // Head
    new THREE.Vector3(0, 3.3, 0),
    // Neck
    new THREE.Vector3(0, 2.2, 0),
    // Shoulders
    new THREE.Vector3(-0.8, 2.0, 0),
    new THREE.Vector3(0.8, 2.0, 0),
    // Torso
    new THREE.Vector3(-0.5, 0.3, 0),
    new THREE.Vector3(0.5, 0.3, 0),
    // Hips
    new THREE.Vector3(-0.45, 0.0, 0),
    new THREE.Vector3(0.45, 0.0, 0),
  ];

  return (
    <group>
      {/* Head circle */}
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#1a3a5c"
          transparent
          opacity={0.15}
          roughness={0.8}
          wireframe
        />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.55, 0.45, 2.2, 16, 1, true]} />
        <meshStandardMaterial
          color="#1a3a5c"
          transparent
          opacity={0.12}
          roughness={0.8}
          wireframe
        />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.95, 1.2, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.12, 0.1, 1.8, 8, 1, true]} />
        <meshStandardMaterial color="#1a3a5c" transparent opacity={0.1} wireframe />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.95, 1.2, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.12, 0.1, 1.8, 8, 1, true]} />
        <meshStandardMaterial color="#1a3a5c" transparent opacity={0.1} wireframe />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.25, -1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.12, 2.2, 8, 1, true]} />
        <meshStandardMaterial color="#1a3a5c" transparent opacity={0.1} wireframe />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.25, -1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.12, 2.2, 8, 1, true]} />
        <meshStandardMaterial color="#1a3a5c" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  );
};

interface HumanBodyModelProps {
  onSelectOrgan: (organ: OrganInfo) => void;
  selectedOrgan: OrganInfo | null;
}

const HumanBodyModel = ({ onSelectOrgan, selectedOrgan }: HumanBodyModelProps) => {
  return (
    <Canvas
      camera={{ position: [0, 1, 6], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#4fc3f7" />
      <pointLight position={[-5, 3, 3]} intensity={0.5} color="#80cbc4" />
      <pointLight position={[0, -3, 5]} intensity={0.3} color="#ce93d8" />

      <BodyOutline />

      {organs.map((organ) => (
        <OrganMesh
          key={organ.id}
          organ={organ}
          onSelect={onSelectOrgan}
          isSelected={selectedOrgan?.id === organ.id}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default HumanBodyModel;
