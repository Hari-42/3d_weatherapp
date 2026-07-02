import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { CITY_SCALE, generateCityLayout, PLATFORM_RADIUS } from '../utils/cityLayout';
import Buildings from './Buildings';
import Roads from './Roads';
import StreetLights from './StreetLights';
import Trees from './Trees';
import Water from './Water';

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
      <Water animated={animated} />
      <group ref={groupRef}>
        <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS * 1.05, 0.5, 8]} />
          <meshStandardMaterial attach="material-0" color="#8a7a63" flatShading roughness={0.95} />
          <meshStandardMaterial attach="material-1" color="#6fae5a" flatShading roughness={0.9} />
          <meshStandardMaterial attach="material-2" color="#5a4c3c" flatShading roughness={0.95} />
        </mesh>
        <Roads />
        <Buildings buildings={layout.buildings} animated={animated} />
        <Trees trees={layout.trees} />
        <StreetLights streetLights={layout.streetLights} animated={animated} />
      </group>
    </group>
  );
}
