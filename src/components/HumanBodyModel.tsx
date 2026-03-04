import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrganInfo, organs } from '@/data/organs';
import { useThemeContext } from '@/contexts/ThemeContext';

/* ------------------------------------------------------------------ */
/*  Types & exports                                                    */
/* ------------------------------------------------------------------ */
export type ViewMode = 'surface' | 'xray' | 'isolate';
export type FocusZone = 'full' | 'head' | 'chest' | 'abdomen' | 'legs';
export type BodyLayers = { skin: boolean; organs: boolean; skeleton: boolean };

interface HumanBodyModelProps {
  onSelectOrgan: (organ: OrganInfo) => void;
  selectedOrgan: OrganInfo | null;
  viewMode?: ViewMode;
  focusZone?: FocusZone;
  layers?: BodyLayers;
}

/* ------------------------------------------------------------------ */
/*  Camera Focus presets                                               */
/* ------------------------------------------------------------------ */
const FOCUS_PRESETS: Record<FocusZone, { target: THREE.Vector3; offset: THREE.Vector3 }> = {
  full:    { target: new THREE.Vector3(0, 0.3, 0),    offset: new THREE.Vector3(0, 0.3, 7.8) },
  head:    { target: new THREE.Vector3(0, 2.2, 0),    offset: new THREE.Vector3(0, 0.3, 2.4) },
  chest:   { target: new THREE.Vector3(0, 1.3, 0.1),  offset: new THREE.Vector3(0, 0.2, 2.8) },
  abdomen: { target: new THREE.Vector3(0, 0.4, 0.1),  offset: new THREE.Vector3(0, 0.1, 2.8) },
  legs:    { target: new THREE.Vector3(0, -1.0, 0.1), offset: new THREE.Vector3(0, 0.2, 3.2) },
};

/* ------------------------------------------------------------------ */
/*  REALISTIC ORGAN GEOMETRY BUILDERS                                  */
/*  Creates anatomically-shaped 3D geometries for each organ           */
/*  instead of plain spheres, for a much more realistic look.          */
/* ------------------------------------------------------------------ */

/** Create heart geometry — two lobes + aorta stem via merged BufferGeometries */
function createHeartGeometry(): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Main heart body — slightly squashed sphere, rotated for anatomical tilt
  const body = new THREE.SphereGeometry(1, 32, 32);
  body.scale(0.92, 1.05, 0.85);
  // Flatten bottom tip
  const pos = body.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Pull bottom vertices into a point (heart apex)
    if (y < -0.3) {
      const factor = Math.pow(Math.abs(y + 0.3) / 0.75, 0.7);
      pos.setX(i, x * (1 - factor * 0.85));
      pos.setZ(i, z * (1 - factor * 0.85));
      pos.setY(i, y - factor * 0.25);
    }
    // Indent top center for the two-lobe look
    if (y > 0.5) {
      const dist = Math.sqrt(x * x + z * z);
      if (dist < 0.5) {
        const indent = (1 - dist / 0.5) * 0.35 * ((y - 0.5) / 0.55);
        pos.setY(i, y - indent);
      }
    }
  }
  pos.needsUpdate = true;
  body.computeVertexNormals();

  // Aorta — tube coming out the top
  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 0.85, 0.05),
    new THREE.Vector3(0.15, 1.15, 0.0),
    new THREE.Vector3(0.05, 1.35, -0.1),
    new THREE.Vector3(-0.15, 1.30, -0.15),
  ]);
  const aorta = new THREE.TubeGeometry(aortaCurve, 16, 0.18, 12, false);

  // Pulmonary artery
  const pulCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 0.80, 0.15),
    new THREE.Vector3(-0.30, 1.10, 0.10),
    new THREE.Vector3(-0.20, 1.25, -0.05),
  ]);
  const pulmonary = new THREE.TubeGeometry(pulCurve, 12, 0.12, 10, false);

  // Merge into one geometry
  const merged = new THREE.BufferGeometry();
  const mergedGeos = [body, aorta, pulmonary];
  // Use utility to merge
  let totalVerts = 0;
  let totalIndices = 0;
  mergedGeos.forEach(g => {
    totalVerts += g.getAttribute('position').count;
    totalIndices += (g.index ? g.index.count : 0);
  });
  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const indices: number[] = [];
  let vertOffset = 0;
  let idxOffset = 0;
  mergedGeos.forEach(g => {
    const gPos = g.getAttribute('position') as THREE.BufferAttribute;
    const gNorm = g.getAttribute('normal') as THREE.BufferAttribute;
    for (let i = 0; i < gPos.count; i++) {
      positions[(vertOffset + i) * 3]     = gPos.getX(i);
      positions[(vertOffset + i) * 3 + 1] = gPos.getY(i);
      positions[(vertOffset + i) * 3 + 2] = gPos.getZ(i);
      normals[(vertOffset + i) * 3]       = gNorm.getX(i);
      normals[(vertOffset + i) * 3 + 1]   = gNorm.getY(i);
      normals[(vertOffset + i) * 3 + 2]   = gNorm.getZ(i);
    }
    if (g.index) {
      for (let i = 0; i < g.index.count; i++) {
        indices.push(g.index.array[i] + vertOffset);
      }
    }
    vertOffset += gPos.count;
  });
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}

/** Create brain geometry — two hemispheres with sulci (wrinkles) */
function createBrainGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 40, 40);
  const pos = geo.getAttribute('position');
  const normal = geo.getAttribute('normal');

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Flatten bottom
    if (y < -0.2) {
      y = -0.2 - (y + 0.2) * 0.3;
    }

    // Central fissure (longitudinal split between hemispheres)
    const fissureDepth = Math.exp(-(x * x) / 0.012) * 0.18;
    if (Math.abs(x) < 0.25 && y > -0.1) {
      y -= fissureDepth * (y + 0.1);
    }

    // Gyri/sulci — wrinkled surface using multiple sine waves
    const dist = Math.sqrt(x * x + y * y + z * z);
    const nx = x / dist, ny = y / dist, nz = z / dist;
    const wrinkle =
      Math.sin(nx * 12 + ny * 8) * 0.025 +
      Math.sin(ny * 15 + nz * 10) * 0.02 +
      Math.sin(nz * 18 + nx * 6) * 0.015 +
      Math.sin((nx + ny) * 20) * 0.012;

    const r = dist + wrinkle;
    pos.setX(i, nx * r * 1.15);
    pos.setY(i, ny * r * 0.85 + (y < -0.2 ? 0 : 0));
    pos.setZ(i, nz * r * 1.0);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  // Scale
  geo.scale(0.48, 0.42, 0.46);
  return geo;
}

/** Create lung geometry — two lobes, anatomical shape */
function createLungGeometry(side: 'left' | 'right'): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 28, 28);
  const pos = geo.getAttribute('position');
  const s = side === 'left' ? -1 : 1;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Taper top (apex)
    if (y > 0.3) {
      const taper = 1 - (y - 0.3) * 0.5;
      x *= taper;
      z *= taper;
    }

    // Flatten bottom (base)
    if (y < -0.6) {
      y = -0.6 - (y + 0.6) * 0.4;
    }

    // Mediastinal indent (flat inner surface)
    if (s * x < -0.2) {
      x = x * 0.7 - s * 0.08;
    }

    // Left lung cardiac notch
    if (side === 'left' && x > 0.1 && y < 0.1 && y > -0.4) {
      const notch = Math.exp(-((y + 0.15) * (y + 0.15)) / 0.08) * 0.25;
      x -= notch;
    }

    // Slight surface irregularity for organic feel
    const dist = Math.sqrt(x * x + y * y + z * z);
    if (dist > 0) {
      const bump = Math.sin(x * 15 + y * 12) * 0.015 + Math.sin(z * 18) * 0.01;
      const nx = x / dist, ny = y / dist, nz = z / dist;
      x += nx * bump;
      y += ny * bump;
      z += nz * bump;
    }

    pos.setX(i, x);
    pos.setY(i, y);
    pos.setZ(i, z);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.scale(0.22, 0.35, 0.2);
  return geo;
}

/** Create stomach geometry — J-shaped tube using LatheGeometry */
function createStomachGeometry(): THREE.BufferGeometry {
  const profile: [number, number][] = [
    [0.00, 0.50],   // esophagus opening
    [0.08, 0.45],
    [0.15, 0.38],
    [0.25, 0.28],   // fundus (top bulge)
    [0.30, 0.15],
    [0.32, 0.00],   // body
    [0.30, -0.15],
    [0.25, -0.28],
    [0.18, -0.38],  // antrum
    [0.10, -0.44],
    [0.05, -0.48],
    [0.00, -0.50],  // pylorus
  ];

  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(pts, 24);

  // Add J-curve deformation
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Curve the bottom part to the right (J shape)
    let newX = x;
    let newZ = z;
    if (y < 0) {
      const bend = Math.pow(Math.abs(y) / 0.5, 1.5) * 0.2;
      newX += bend;
      newZ += bend * 0.3;
    }

    // Slight asymmetric bulge for greater curvature
    if (x > 0 && y > -0.2 && y < 0.2) {
      const bulge = 0.06 * Math.cos(y * Math.PI / 0.5);
      newX += bulge;
    }

    pos.setX(i, newX);
    pos.setZ(i, newZ);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.scale(0.7, 0.7, 0.7);
  return geo;
}

/** Create eye geometry — iris/pupil detail via UV-displaced sphere */
function createEyeGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 24, 24);
  // Slight elongation front-to-back
  geo.scale(1.0, 1.0, 1.08);
  return geo;
}

/** Create ear geometry — flattened disc with slight curve */
function createEarGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 20, 20);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Flatten into a disc shape
    pos.setZ(i, z * 0.35);
    // Curl the outer rim backward
    const dist = Math.sqrt(x * x + y * y);
    if (dist > 0.5) {
      const curl = (dist - 0.5) * 0.4;
      pos.setZ(i, z * 0.35 - curl);
    }
    // Create a concha (inner bowl)
    if (dist < 0.4 && z > 0) {
      const depth = (0.4 - dist) * 0.3;
      pos.setZ(i, pos.getZ(i) - depth);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.scale(0.14, 0.19, 0.12);
  return geo;
}

/* ------------------------------------------------------------------ */
/*  GLB Model Loader — loads organ GLB from /models/organs/ if exists  */
/* ------------------------------------------------------------------ */
function useOrganGLB(organId: string): THREE.BufferGeometry | null {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const path = `/models/organs/${organId}.glb`;
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        // Find first mesh in the model
        let foundGeo: THREE.BufferGeometry | null = null;
        gltf.scene.traverse((child) => {
          if (!foundGeo && (child as THREE.Mesh).isMesh) {
            foundGeo = (child as THREE.Mesh).geometry.clone();
          }
        });
        if (foundGeo) {
          (foundGeo as THREE.BufferGeometry).computeVertexNormals();
          setGeometry(foundGeo);
        }
      },
      undefined,
      () => { /* GLB not found — fall back to procedural */ },
    );
  }, [organId]);

  return geometry;
}

/* ------------------------------------------------------------------ */
/*  Organ material configs — realistic organic look per organ type     */
/* ------------------------------------------------------------------ */
interface OrganMaterialConfig {
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenRoughness: number;
  sheenColor: string;
  emissive: string;
  emissiveIntensity: number;
}

const ORGAN_MATERIALS: Record<string, OrganMaterialConfig> = {
  heart: {
    color: '#b22030',
    roughness: 0.55,
    metalness: 0.03,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    sheen: 0.8,
    sheenRoughness: 0.4,
    sheenColor: '#ff4444',
    emissive: '#330808',
    emissiveIntensity: 0.15,
  },
  brain: {
    color: '#e8b4b8',
    roughness: 0.7,
    metalness: 0.01,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    sheen: 0.5,
    sheenRoughness: 0.6,
    sheenColor: '#ffcccc',
    emissive: '#1a0505',
    emissiveIntensity: 0.08,
  },
  lungs: {
    color: '#d4827a',
    roughness: 0.6,
    metalness: 0.02,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    sheen: 0.6,
    sheenRoughness: 0.5,
    sheenColor: '#ffaaaa',
    emissive: '#150505',
    emissiveIntensity: 0.1,
  },
  stomach: {
    color: '#d4a373',
    roughness: 0.65,
    metalness: 0.02,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
    sheen: 0.7,
    sheenRoughness: 0.4,
    sheenColor: '#ffcc88',
    emissive: '#0f0805',
    emissiveIntensity: 0.1,
  },
  eyes: {
    color: '#e8e8f0',
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
    sheen: 0.0,
    sheenRoughness: 0.5,
    sheenColor: '#ffffff',
    emissive: '#111122',
    emissiveIntensity: 0.05,
  },
  ears: {
    color: '#dda88a',
    roughness: 0.6,
    metalness: 0.01,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
    sheen: 0.4,
    sheenRoughness: 0.5,
    sheenColor: '#ffccaa',
    emissive: '#0a0504',
    emissiveIntensity: 0.05,
  },
  hands: {
    color: '#c9a08a',
    roughness: 0.6,
    metalness: 0.01,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    sheen: 0.3,
    sheenRoughness: 0.5,
    sheenColor: '#ddbb99',
    emissive: '#080504',
    emissiveIntensity: 0.05,
  },
  legs: {
    color: '#b0a0a0',
    roughness: 0.6,
    metalness: 0.01,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
    sheen: 0.3,
    sheenRoughness: 0.5,
    sheenColor: '#ccbbbb',
    emissive: '#060505',
    emissiveIntensity: 0.05,
  },
};

/* ================================================================== */
/*  BODY SHELL                                                         */
/*  Smooth organic body using LatheGeometry for torso+head,            */
/*  TubeGeometry for arms, CapsuleGeometry for legs.                   */
/*  Skin-like material with sheen (subsurface scattering simulation).  */
/* ================================================================== */

/** LatheGeometry profile: human body silhouette from groin to crown. */
const BODY_PROFILE: [number, number][] = [
  // [radius, y] — revolved around Y axis
  // ── Groin / Lower body base ──
  [0.00, -0.35],
  [0.10, -0.28],
  [0.20, -0.15],
  // ── Pelvis / Hips ──
  [0.36, 0.00],
  [0.40, 0.12],
  [0.42, 0.22],
  // ── Lower Waist ──
  [0.38, 0.38],
  [0.35, 0.50],
  // ── Waist (narrowest) ──
  [0.33, 0.65],
  [0.34, 0.75],
  // ── Ribcage ──
  [0.40, 0.95],
  [0.46, 1.15],
  // ── Chest (widest torso) ──
  [0.50, 1.35],
  [0.48, 1.50],
  // ── Shoulders transition ──
  [0.44, 1.60],
  [0.34, 1.68],
  // ── Neck ──
  [0.18, 1.76],
  [0.14, 1.85],
  [0.13, 1.92],
  [0.14, 1.98],
  // ── Head ──
  [0.26, 2.04],
  [0.38, 2.12],
  [0.44, 2.22],
  [0.46, 2.34],
  [0.45, 2.44],
  [0.42, 2.52],
  [0.36, 2.58],
  [0.26, 2.64],
  [0.14, 2.68],
  [0.00, 2.72],
];

/** Arm curve helper — starts inside torso for seamless transition */
function makeArmCurve(side: 1 | -1): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.42, 1.62, 0.04),  // inside shoulder
    new THREE.Vector3(side * 0.56, 1.52, 0.05),
    new THREE.Vector3(side * 0.66, 1.35, 0.06),
    new THREE.Vector3(side * 0.73, 1.10, 0.07),
    new THREE.Vector3(side * 0.78, 0.82, 0.05),
    new THREE.Vector3(side * 0.80, 0.52, 0.02),
    new THREE.Vector3(side * 0.80, 0.22, 0.00),
    new THREE.Vector3(side * 0.78, 0.08, -0.02),
  ], false, 'centripetal');
}

/** Leg curve helper — natural slight-bend from hip to ankle */
function makeLegCurve(side: 1 | -1): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.22, -0.18, 0.00),   // hip joint (inside body)
    new THREE.Vector3(side * 0.23, -0.42, 0.02),   // upper thigh
    new THREE.Vector3(side * 0.23, -0.72, 0.03),   // mid thigh
    new THREE.Vector3(side * 0.23, -1.05, 0.02),   // above knee
    new THREE.Vector3(side * 0.23, -1.22, 0.00),   // knee
    new THREE.Vector3(side * 0.23, -1.45, -0.02),  // below knee
    new THREE.Vector3(side * 0.23, -1.72, -0.01),  // mid calf
    new THREE.Vector3(side * 0.23, -1.95, 0.00),   // lower calf
    new THREE.Vector3(side * 0.23, -2.08, 0.02),   // ankle
  ], false, 'centripetal');
}

const BodyShell = ({ viewMode, bodyColor, bodyOpacity }: {
  viewMode: ViewMode; bodyColor: string; bodyOpacity: number;
}) => {
  const matsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const targetColor = useMemo(() => new THREE.Color(bodyColor), [bodyColor]);
  const sheenTarget = useMemo(() => {
    const c = new THREE.Color(bodyColor);
    c.lerp(new THREE.Color('#ffccaa'), 0.5);
    return c;
  }, [bodyColor]);

  // Pre-compute geometries once
  const torsoGeo = useMemo(() => {
    const pts = BODY_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  const leftArmCurve = useMemo(() => makeArmCurve(-1), []);
  const rightArmCurve = useMemo(() => makeArmCurve(1), []);
  const leftLegCurve = useMemo(() => makeLegCurve(-1), []);
  const rightLegCurve = useMemo(() => makeLegCurve(1), []);

  // Animate opacity / color / transmission each frame
  useFrame(() => {
    const targetOp =
      viewMode === 'xray' ? bodyOpacity * 0.20 :
      viewMode === 'isolate' ? bodyOpacity * 0.12 :
      bodyOpacity;
    const targetTrans =
      viewMode === 'xray' ? 0.45 :
      viewMode === 'isolate' ? 0.55 :
      0.0;
    const depthW = viewMode === 'surface';

    matsRef.current.forEach((mat) => {
      mat.opacity += (targetOp - mat.opacity) * 0.07;
      mat.color.lerp(targetColor, 0.05);
      mat.transmission += (targetTrans - mat.transmission) * 0.05;
      mat.depthWrite = depthW;
      if (mat.sheenColor) mat.sheenColor.lerp(sheenTarget, 0.03);
    });
  });

  const regMat = (mat: THREE.MeshPhysicalMaterial | null) => {
    if (mat && !matsRef.current.includes(mat)) matsRef.current.push(mat);
  };

  const sheenCol = useMemo(
    () => new THREE.Color(bodyColor).lerp(new THREE.Color('#ffccaa'), 0.5),
    [bodyColor],
  );

  const skinProps = {
    color: bodyColor,
    transparent: true as const,
    opacity: bodyOpacity,
    roughness: 0.50,
    metalness: 0.02,
    clearcoat: 0.15,
    clearcoatRoughness: 0.6,
    sheen: 0.6,
    sheenRoughness: 0.45,
    sheenColor: sheenCol,
    transmission: 0.0,
    thickness: 1.5,
    ior: 1.38,
    envMapIntensity: 0.5,
    side: THREE.FrontSide as THREE.Side,
    depthWrite: true as const,
  };

  return (
    <group>
      {/* ── Torso + Head (LatheGeometry — single smooth revolution) ── */}
      <mesh
        geometry={torsoGeo}
        scale={[1.12, 1, 0.82]}   /* wider than deep — elliptical */
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Left arm (TubeGeometry — smooth natural curve) ── */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[leftArmCurve, 28, 0.11, 16, false]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Right arm ── */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[rightArmCurve, 28, 0.11, 16, false]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Left shoulder cap (bridges torso→arm) ── */}
      <mesh position={[-0.46, 1.56, 0.04]} scale={[1.0, 0.9, 0.8]} castShadow>
        <sphereGeometry args={[0.14, 18, 18]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Right shoulder cap ── */}
      <mesh position={[0.46, 1.56, 0.04]} scale={[1.0, 0.9, 0.8]} castShadow>
        <sphereGeometry args={[0.14, 18, 18]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Left hand ── */}
      <mesh position={[-0.76, -0.02, -0.02]} castShadow scale={[1.0, 1.3, 0.65]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Right hand ── */}
      <mesh position={[0.76, -0.02, -0.02]} castShadow scale={[1.0, 1.3, 0.65]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Left hip bridge ── */}
      <mesh position={[-0.22, -0.25, 0]} scale={[1.0, 1.2, 0.85]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Right hip bridge ── */}
      <mesh position={[0.22, -0.25, 0]} scale={[1.0, 1.2, 0.85]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Left leg (TubeGeometry — smooth natural curve) ── */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[leftLegCurve, 28, 0.14, 16, false]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Left foot ── */}
      <mesh position={[-0.23, -2.13, 0.06]} rotation={[1.15, 0, 0]} scale={[1, 1, 1.4]}>
        <capsuleGeometry args={[0.09, 0.16, 8, 12]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Right leg (TubeGeometry) ── */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[rightLegCurve, 28, 0.14, 16, false]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>

      {/* ── Right foot ── */}
      <mesh position={[0.23, -2.13, 0.06]} rotation={[1.15, 0, 0]} scale={[1, 1, 1.4]}>
        <capsuleGeometry args={[0.09, 0.16, 8, 12]} />
        <meshPhysicalMaterial ref={regMat as never} {...skinProps} />
      </mesh>
    </group>
  );
};

/* ================================================================== */
/*  ORGAN OVERLAY (anatomy GLB)                                        */
/* ================================================================== */
const OrganOverlay = ({ viewMode }: { viewMode: ViewMode }) => {
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/human-anatomy.glb',
      (gltf) => {
        const root = gltf.scene.clone(true);
        root.scale.setScalar(2.4);
        root.position.set(0, 0.9, 0.0);
        const mats: THREE.MeshStandardMaterial[] = [];
        root.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = false;
          const mat = new THREE.MeshStandardMaterial({
            color: '#d45c6e',
            roughness: 0.45,
            metalness: 0.05,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          mesh.material = mat;
          mats.push(mat);
        });
        materialsRef.current = mats;
        setScene(root);
      },
      undefined,
      () => setScene(null),
    );
  }, []);

  useFrame(() => {
    const target =
      viewMode === 'xray' ? 0.85 :
      viewMode === 'isolate' ? 0.70 : 0.0;
    materialsRef.current.forEach((mat) => {
      mat.opacity += (target - mat.opacity) * 0.08;
    });
  });

  if (!scene) return null;
  return <primitive object={scene} />;
};

/* ================================================================== */
/*  INTERACTIVE ORGAN MESH — Realistic anatomical version              */
/* ================================================================== */
const OrganMesh = ({
  organ, selectedOrgan, hoveredOrgan, viewMode, onHover, onSelect,
}: {
  organ: OrganInfo;
  selectedOrgan: OrganInfo | null;
  hoveredOrgan: string | null;
  viewMode: ViewMode;
  onHover: (id: string | null) => void;
  onSelect: (o: OrganInfo) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const matRef   = useRef<THREE.MeshPhysicalMaterial>(null);
  const glowRef  = useRef<THREE.MeshBasicMaterial>(null);
  const isActive = selectedOrgan?.id === organ.id || hoveredOrgan === organ.id;
  const [px, py, pz] = organ.position;
  const [sx, sy, sz] = organ.scale;

  // Try to load GLB model; fall back to procedural geometry
  const glbGeometry = useOrganGLB(organ.id);

  // Create procedural geometry based on organ type
  const proceduralGeometry = useMemo(() => {
    switch (organ.id) {
      case 'heart':   return createHeartGeometry();
      case 'brain':   return createBrainGeometry();
      case 'stomach': return createStomachGeometry();
      case 'eyes':    return createEyeGeometry();
      case 'ears':    return createEarGeometry();
      default:        return new THREE.SphereGeometry(0.3, 24, 24);
    }
  }, [organ.id]);

  // Lungs are special — two separate meshes
  const leftLung = useMemo(() => organ.id === 'lungs' ? createLungGeometry('left') : null, [organ.id]);
  const rightLung = useMemo(() => organ.id === 'lungs' ? createLungGeometry('right') : null, [organ.id]);

  // Bronchi tube connecting the lungs
  const bronchiGeo = useMemo(() => {
    if (organ.id !== 'lungs') return null;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 0.30, 0.0),
      new THREE.Vector3(0.0, 0.38, 0.02),
      new THREE.Vector3(0.18, 0.30, 0.0),
    ]);
    return new THREE.TubeGeometry(curve, 12, 0.025, 8, false);
  }, [organ.id]);

  // Trachea
  const tracheaGeo = useMemo(() => {
    if (organ.id !== 'lungs') return null;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.38, 0.02),
      new THREE.Vector3(0.0, 0.55, 0.01),
      new THREE.Vector3(0.0, 0.68, 0.0),
    ]);
    return new THREE.TubeGeometry(curve, 8, 0.03, 8, false);
  }, [organ.id]);

  const geometry = glbGeometry || proceduralGeometry;
  const matConfig = ORGAN_MATERIALS[organ.id] || ORGAN_MATERIALS.heart;

  // Additional materials refs for lungs
  const lungMatsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const regLungMat = (mat: THREE.MeshPhysicalMaterial | null) => {
    if (mat && !lungMatsRef.current.includes(mat)) lungMatsRef.current.push(mat);
  };

  useFrame(({ clock }) => {
    const mat = matRef.current;
    const glow = glowRef.current;
    const grp = groupRef.current;
    if (!mat || !grp) return;
    const t = clock.getElapsedTime();

    // Color lerp to realistic organ color
    const targetColor = new THREE.Color(isActive ? organ.hoverColor : matConfig.color);
    mat.color.lerp(targetColor, 0.10);
    mat.emissive.lerp(new THREE.Color(isActive ? organ.hoverColor : matConfig.emissive), 0.08);
    mat.emissiveIntensity = isActive ? 0.5 : matConfig.emissiveIntensity;

    // Update lung materials too
    lungMatsRef.current.forEach(lm => {
      lm.color.lerp(targetColor, 0.10);
      lm.emissive.lerp(new THREE.Color(isActive ? organ.hoverColor : matConfig.emissive), 0.08);
      lm.emissiveIntensity = isActive ? 0.5 : matConfig.emissiveIntensity;
      // Same opacity as main
      const baseOp =
        viewMode === 'xray' ? (isActive ? 1.0 : 0.88) :
        viewMode === 'isolate' ? (selectedOrgan ? (selectedOrgan.id === organ.id ? 1.0 : 0.05) : 0.92) :
        (isActive ? 0.92 : 0.65);
      lm.opacity += (baseOp - lm.opacity) * 0.10;
    });

    // Opacity per view mode — higher base for realism
    const baseOpacity =
      viewMode === 'xray'
        ? (isActive ? 1.0 : 0.88)
        : viewMode === 'isolate'
          ? (selectedOrgan ? (selectedOrgan.id === organ.id ? 1.0 : 0.05) : 0.92)
          : (isActive ? 0.92 : 0.65);
    mat.opacity += (baseOpacity - mat.opacity) * 0.10;

    // Glow halo
    if (glow) {
      const targetGlow = isActive ? 0.45 : 0.0;
      glow.opacity += (targetGlow - glow.opacity) * 0.12;
    }

    // Physiological animations — more subtle and realistic
    let breathScale = 1.0;
    let pulseScale = 1.0;
    if (organ.id === 'lungs') {
      breathScale = 1 + Math.sin(t * 2.2) * 0.04;
    }
    if (organ.id === 'heart') {
      // Realistic heartbeat: quick contraction + slow relaxation
      const beat = Math.sin(t * 7.5);
      const fastBeat = beat > 0 ? Math.pow(beat, 0.5) : -Math.pow(-beat, 2);
      pulseScale = 1 + fastBeat * 0.045;
    }
    if (organ.id === 'stomach') {
      // Slow churning
      pulseScale = 1 + Math.sin(t * 1.5) * 0.02;
    }

    const hover = isActive ? 1.06 : 1.0;
    const sc = breathScale * pulseScale * hover;
    grp.scale.lerp(new THREE.Vector3(sc, sc, sc), 0.12);
  });

  useEffect(() => () => { document.body.style.cursor = 'default'; }, []);

  const organMatProps = {
    color: matConfig.color,
    transparent: true as const,
    opacity: 0.65,
    roughness: matConfig.roughness,
    metalness: matConfig.metalness,
    clearcoat: matConfig.clearcoat,
    clearcoatRoughness: matConfig.clearcoatRoughness,
    sheen: matConfig.sheen,
    sheenRoughness: matConfig.sheenRoughness,
    sheenColor: new THREE.Color(matConfig.sheenColor),
    emissive: new THREE.Color(matConfig.emissive),
    emissiveIntensity: matConfig.emissiveIntensity,
    envMapIntensity: 0.6,
    side: THREE.FrontSide as THREE.Side,
  };

  // Lungs bronchi material
  const bronchiMatProps = {
    ...organMatProps,
    color: '#c4956a',
    sheenColor: new THREE.Color('#ddaa77'),
    clearcoat: 0.2,
  };

  return (
    <group ref={groupRef} position={[px, py, pz]}>
      {/* Main organ mesh or lung pair */}
      {organ.id === 'lungs' ? (
        <>
          {/* Left lung */}
          <mesh castShadow scale={[sx, sy, sz]} position={[-0.18, 0, 0]}>
            <primitive object={leftLung!} attach="geometry" />
            <meshPhysicalMaterial ref={regLungMat as never} {...organMatProps} />
          </mesh>
          {/* Right lung — slightly bigger */}
          <mesh castShadow scale={[sx * 1.1, sy * 1.05, sz]} position={[0.18, 0, 0]}>
            <primitive object={rightLung!} attach="geometry" />
            <meshPhysicalMaterial ref={regLungMat as never} {...organMatProps} />
          </mesh>
          {/* Bronchi */}
          {bronchiGeo && (
            <mesh castShadow scale={[sx, sy, sz]}>
              <primitive object={bronchiGeo} attach="geometry" />
              <meshPhysicalMaterial ref={regLungMat as never} {...bronchiMatProps} />
            </mesh>
          )}
          {/* Trachea */}
          {tracheaGeo && (
            <mesh castShadow scale={[sx, sy, sz]}>
              <primitive object={tracheaGeo} attach="geometry" />
              <meshPhysicalMaterial ref={regLungMat as never} {...bronchiMatProps} />
            </mesh>
          )}
        </>
      ) : (
        <mesh
          castShadow
          scale={[sx, sy, sz]}
          rotation={organ.id === 'heart' ? [0.1, 0, -0.2] : undefined}
        >
          <primitive object={geometry} attach="geometry" />
          <meshPhysicalMaterial ref={matRef as never} {...organMatProps} />
        </mesh>
      )}

      {/* Glow halo */}
      <mesh scale={[sx * 1.4, sy * 1.4, sz * 0.4]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial
          ref={glowRef}
          color={organ.hoverColor}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Invisible hitbox */}
      <mesh
        scale={[sx * 1.5, sy * 1.5, sz * 1.5]}
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(organ.id); document.body.style.cursor = 'pointer'; }}
        onPointerLeave={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(null); document.body.style.cursor = 'default'; }}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(organ); }}
      >
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Annotation pins (appear when organ is selected) */}
      {selectedOrgan?.id === organ.id && organ.annotations.map((ann) => (
        <Html
          key={ann.id}
          position={ann.offset}
          center
          distanceFactor={5}
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex flex-col items-center gap-0.5 anno-pin">
            <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50 ring-2 ring-white/30 animate-pulse" />
            <div className="px-2 py-0.5 rounded-md bg-card/90 backdrop-blur-sm border border-primary/30 shadow-lg whitespace-nowrap">
              <span className="text-[10px] font-bold text-foreground">{ann.label.he}</span>
              {ann.label.en && <span className="text-[9px] text-muted-foreground ms-1 italic">{ann.label.en}</span>}
            </div>
          </div>
        </Html>
      ))}
    </group>
  );
};

/* ================================================================== */
/*  RENDERER SETUP                                                     */
/*  ACESFilmicToneMapping for cinematic color rendering.               */
/* ================================================================== */
const SetupRenderer = () => {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);
  return null;
};

/* ================================================================== */
/*  MAIN SCENE                                                         */
/* ================================================================== */
const HumanScene = ({
  onSelectOrgan, selectedOrgan, hoveredOrgan, setHoveredOrgan, viewMode, focusZone,
  canvasBg, canvasFog, bodyColor, bodyOpacity, layers,
}: HumanBodyModelProps & {
  hoveredOrgan: string | null;
  setHoveredOrgan: (id: string | null) => void;
  canvasBg: string;
  canvasFog: string;
  bodyColor: string;
  bodyOpacity: number;
  layers: BodyLayers;
}) => {
  const controlsRef = useRef<THREE.EventDispatcher | null>(null);
  const { camera } = useThree();

  useFrame(() => {
    const preset   = FOCUS_PRESETS[focusZone ?? 'full'];
    const controls = controlsRef.current as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (!controls) return;
    camera.position.lerp(preset.target.clone().add(preset.offset), 0.06);
    controls.target.lerp(preset.target, 0.08);
    controls.update();
  });

  return (
    <>
      <SetupRenderer />
      <color attach="background" args={[canvasBg]} />
      <fog   attach="fog"        args={[canvasFog, 7, 16]} />

      {/* ============ STUDIO LIGHTING ============ */}
      {/* Key light — warm, from upper right */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={4}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
      />
      {/* Fill light — cool, from left */}
      <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#b8d4f0" />
      {/* Rim light — from behind for edge definition */}
      <pointLight position={[0, 2, -4]} intensity={0.8} color="#aaccff" distance={10} />
      {/* Top light — natural downlight */}
      <pointLight position={[0, 5, 1]} intensity={0.4} color="#ffffff" distance={8} />
      {/* Under fill — soften bottom shadows */}
      <pointLight position={[0, -2, 2]} intensity={0.15} color="#ffffff" distance={6} />
      {/* Hemisphere ambient — sky/ground gradient */}
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.22]} />
      {/* Base ambient */}
      <ambientLight intensity={0.3} />

      {/* Ground contact shadows */}
      <ContactShadows
        position={[0, -2.25, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
        color="#000020"
      />

      {/* HDRI environment for realistic reflections */}
      <Environment preset="city" />

      {/* ============ BODY + ORGANS ============ */}
      <group position={[0, 0, 0]}>
        {layers.skin && (
          <BodyShell
            viewMode={viewMode ?? 'surface'}
            bodyColor={bodyColor}
            bodyOpacity={bodyOpacity}
          />
        )}
        {layers.skin && <OrganOverlay viewMode={viewMode ?? 'surface'} />}

        {/* Skeleton wireframe overlay */}
        {layers.skeleton && (
          <group>
            <mesh position={[0, 1.1, 0]}>
              <capsuleGeometry args={[0.25, 1.4, 4, 12]} />
              <meshBasicMaterial color="#d4c9a8" wireframe opacity={0.55} transparent />
            </mesh>
            <mesh position={[0, 2.3, 0]}>
              <sphereGeometry args={[0.38, 10, 8]} />
              <meshBasicMaterial color="#d4c9a8" wireframe opacity={0.55} transparent />
            </mesh>
            {/* spine */}
            <mesh position={[0, 1.1, -0.08]}>
              <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
              <meshBasicMaterial color="#e0d6b8" wireframe opacity={0.6} transparent />
            </mesh>
            {/* pelvis */}
            <mesh position={[0, 0.15, 0]}>
              <torusGeometry args={[0.28, 0.06, 6, 12, Math.PI]} />
              <meshBasicMaterial color="#d4c9a8" wireframe opacity={0.5} transparent />
            </mesh>
          </group>
        )}

        {layers.organs && organs.map((organ) => (
          <OrganMesh
            key={organ.id}
            organ={organ}
            selectedOrgan={selectedOrgan}
            hoveredOrgan={hoveredOrgan}
            viewMode={viewMode ?? 'surface'}
            onHover={setHoveredOrgan}
            onSelect={onSelectOrgan}
          />
        ))}
      </group>

      {/* ============ POST-PROCESSING ============ */}
      <EffectComposer>
        {/* Bloom — subtle glow on emissive organ highlights */}
        <Bloom
          luminanceThreshold={0.7}
          luminanceSmoothing={0.4}
          intensity={0.3}
          radius={0.7}
        />
        {/* Vignette — subtle edge darkening for cinematic depth */}
        <Vignette offset={0.25} darkness={0.35} />
      </EffectComposer>

      <OrbitControls
        ref={controlsRef as never}
        enablePan={false}
        minDistance={2.0}
        maxDistance={10}
        minPolarAngle={0.3}
        maxPolarAngle={2.6}
        target={[0, 0.5, 0]}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
};

/* ================================================================== */
/*  CANVAS WRAPPER (EXPORTED)                                          */
/* ================================================================== */
const HumanBodyModel = ({
  onSelectOrgan, selectedOrgan, viewMode = 'surface', focusZone = 'full',
  layers = { skin: true, organs: true, skeleton: false },
}: HumanBodyModelProps) => {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const { theme } = useThemeContext();

  return (
    <div className="flex items-center justify-center w-full h-full relative select-none">
      <Canvas
        className="w-full h-full"
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 0.6, 7.8], fov: 45, near: 0.1, far: 60 }}
        onPointerMissed={() => setHoveredOrgan(null)}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <HumanScene
          onSelectOrgan={onSelectOrgan}
          selectedOrgan={selectedOrgan}
          viewMode={viewMode}
          focusZone={focusZone}
          hoveredOrgan={hoveredOrgan}
          setHoveredOrgan={setHoveredOrgan}
          canvasBg={theme.colors.canvasBg}
          canvasFog={theme.colors.canvasFog}
          bodyColor={theme.colors.bodyColor}
          bodyOpacity={theme.colors.bodyOpacity}
          layers={layers}
        />
      </Canvas>
    </div>
  );
};

export default HumanBodyModel;
