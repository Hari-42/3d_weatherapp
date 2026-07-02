import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { BUILDING_PALETTE, BuildingSpec } from '../utils/cityLayout';
import { mulberry32 } from '../utils/random';

interface BuildingsProps {
  buildings: BuildingSpec[];
  animated: React.MutableRefObject<AnimatedPreset>;
}

const roofTint = new THREE.Color();

function Building({
  spec,
  animated,
}: {
  spec: BuildingSpec;
  animated: React.MutableRefObject<AnimatedPreset>;
}) {
  const windowMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const phase = useMemo(() => mulberry32(spec.windowSeed)() * 40, [spec.windowSeed]);
  const baseColor = BUILDING_PALETTE[spec.colorIndex];
  const roofColor = useMemo(
    () => `#${roofTint.set(baseColor).multiplyScalar(0.72).getHexString()}`,
    [baseColor]
  );

  useSafeFrame(({ clock }) => {
    if (!windowMatRef.current) return;
    const glow = animated.current.windowsGlow.value;
    const flicker = 0.85 + Math.sin(clock.elapsedTime * 3 + phase) * 0.15;
    windowMatRef.current.emissiveIntensity = glow * flicker * 1.5;
    windowMatRef.current.opacity = 0.28 + glow * 0.7;
  }, 'Buildings');

  return (
    <group position={[spec.x, 0, spec.z]}>
      <mesh position={[0, spec.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[spec.width, spec.height, spec.depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, spec.height + 0.06, 0]} castShadow>
        <boxGeometry args={[spec.width * 1.06, 0.12, spec.depth * 1.06]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, spec.height / 2, spec.depth / 2 + 0.005]}>
        <planeGeometry args={[spec.width * 0.68, spec.height * 0.62]} />
        <meshStandardMaterial
          ref={windowMatRef}
          color="#ffe9a8"
          emissive="#ffd479"
          emissiveIntensity={0}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

export default function Buildings({ buildings, animated }: BuildingsProps) {
  return (
    <group>
      {buildings.map((spec, i) => (
        <Building key={i} spec={spec} animated={animated} />
      ))}
    </group>
  );
}
