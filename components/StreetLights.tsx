import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { StreetLightSpec } from '../utils/cityLayout';
import { mulberry32 } from '../utils/random';

interface StreetLightsProps {
  streetLights: StreetLightSpec[];
  animated: React.MutableRefObject<AnimatedPreset>;
}

function Lamp({
  spec,
  animated,
  seed,
  withLight,
}: {
  spec: StreetLightSpec;
  animated: React.MutableRefObject<AnimatedPreset>;
  seed: number;
  withLight: boolean;
}) {
  const bulbRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const phase = useMemo(() => mulberry32(seed)() * 100, [seed]);

  useSafeFrame(({ clock }) => {
    const glow = animated.current.moonlight.value;
    if (glow < 0.03) {
      if (bulbRef.current) bulbRef.current.emissiveIntensity = 0;
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }
    const t = clock.elapsedTime;
    const steadyFlicker = 0.85 + Math.sin(t * 6 + phase) * 0.15;
    const dropout = Math.sin(t * 17 + phase) > 0.93 ? 0.4 : 1;
    const flicker = steadyFlicker * dropout;
    if (bulbRef.current) bulbRef.current.emissiveIntensity = glow * flicker * 2.4;
    if (lightRef.current) lightRef.current.intensity = glow * flicker * 0.9;
  }, 'StreetLights');

  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, spec.rotationY, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 1.1, 6]} />
        <meshStandardMaterial color="#3a3f47" flatShading roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.12, 0.08]} rotation={[Math.PI / 2.6, 0, 0]}>
        <coneGeometry args={[0.09, 0.16, 6]} />
        <meshStandardMaterial color="#2c2f36" flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0.08]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial ref={bulbRef} color="#fff3c4" emissive="#ffdb7a" emissiveIntensity={0} />
      </mesh>
      {withLight && (
        <pointLight
          ref={lightRef}
          position={[0, 1.05, 0.08]}
          color="#ffdb7a"
          distance={2.6}
          decay={2}
          intensity={0}
        />
      )}
    </group>
  );
}

export default function StreetLights({ streetLights, animated }: StreetLightsProps) {
  return (
    <group>
      {streetLights.map((spec, i) => (
        <Lamp key={i} spec={spec} animated={animated} seed={i * 97 + 13} withLight={i % 2 === 0} />
      ))}
    </group>
  );
}
