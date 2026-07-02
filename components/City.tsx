import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { CITY_SCALE, generateCityLayout, PLATFORM_RADIUS } from '../utils/cityLayout';
import Buildings from './Buildings';
import Roads from './Roads';
import StreetLights from './StreetLights';
import Trees from './Trees';

interface CityProps {
  animated: React.MutableRefObject<AnimatedPreset>;
}

const AUTO_ROTATE_SPEED = 0.05;

export default function City({ animated }: CityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const autoRotation = useRef(0);
  const layout = useMemo(() => generateCityLayout(), []);

  useSafeFrame((_, delta) => {
    autoRotation.current += delta * AUTO_ROTATE_SPEED;
    if (groupRef.current) {
      groupRef.current.rotation.y = autoRotation.current;
    }
  }, 'City');

  return (
    <group scale={CITY_SCALE}>
      <group ref={groupRef}>
        {/* Chunky floating slab: grass top, soil sides, darker underside. */}
        <mesh position={[0, -0.65, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS * 0.98, 1.3, 8]} />
          <meshStandardMaterial attach="material-0" color="#9c8a6f" flatShading roughness={0.95} />
          <meshStandardMaterial attach="material-1" color="#6f9256" flatShading roughness={0.9} />
          <meshStandardMaterial attach="material-2" color="#4a3f31" flatShading roughness={0.95} />
        </mesh>
        {/* Rocky underside tapering to a deep point so the island doesn't end flat. */}
        <mesh position={[0, -3.8, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[PLATFORM_RADIUS * 0.96, 5, 8]} />
          <meshStandardMaterial color="#6f5e49" flatShading roughness={1} />
        </mesh>
        <Roads />
        <Buildings buildings={layout.buildings} animated={animated} />
        <Trees trees={layout.trees} />
        <StreetLights streetLights={layout.streetLights} animated={animated} />
      </group>
    </group>
  );
}
