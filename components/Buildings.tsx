import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { BUILDING_PALETTE, BuildingSpec } from '../utils/cityLayout';
import { mulberry32 } from '../utils/random';
import { createWindowTextures, tiledClone, WindowTextures } from '../utils/windowTexture';

interface BuildingsProps {
  buildings: BuildingSpec[];
  animated: React.MutableRefObject<AnimatedPreset>;
}

const roofTint = new THREE.Color();

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function Building({
  spec,
  animated,
  textures,
}: {
  spec: BuildingSpec;
  animated: React.MutableRefObject<AnimatedPreset>;
  textures: WindowTextures;
}) {
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const phase = useMemo(() => mulberry32(spec.windowSeed)() * 40, [spec.windowSeed]);
  const baseColor = BUILDING_PALETTE[spec.colorIndex];
  const roofColor = useMemo(
    () => `#${roofTint.set(baseColor).multiplyScalar(0.72).getHexString()}`,
    [baseColor]
  );

  // Tile the window grid: more floors for taller buildings, a couple of columns per face.
  const cols = clamp(Math.round(spec.width / 0.32), 2, 4);
  const rows = clamp(Math.round(spec.height / 0.34), 2, 9);
  const mapTex = useMemo(() => tiledClone(textures.map, cols, rows), [textures, cols, rows]);
  const emissiveTex = useMemo(
    () => tiledClone(textures.emissive, cols, rows),
    [textures, cols, rows]
  );

  useSafeFrame(({ clock }) => {
    if (!bodyMatRef.current) return;
    const glow = animated.current.windowsGlow.value;
    const flicker = 0.85 + Math.sin(clock.elapsedTime * 3 + phase) * 0.15;
    bodyMatRef.current.emissiveIntensity = glow * flicker * 1.4;
  }, 'Buildings');

  return (
    <group position={[spec.x, 0, spec.z]}>
      <mesh position={[0, spec.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[spec.width, spec.height, spec.depth]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color={baseColor}
          map={mapTex}
          emissiveMap={emissiveTex}
          emissive="#ffd479"
          emissiveIntensity={0}
          roughness={0.82}
        />
      </mesh>
      <mesh position={[0, spec.height + 0.06, 0]} castShadow>
        <boxGeometry args={[spec.width * 1.06, 0.12, spec.depth * 1.06]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

export default function Buildings({ buildings, animated }: BuildingsProps) {
  // Shared base textures, cloned per building for their own tiling.
  const textures = useMemo(() => createWindowTextures(), []);

  return (
    <group>
      {buildings.map((spec, i) => (
        <Building key={i} spec={spec} animated={animated} textures={textures} />
      ))}
    </group>
  );
}
