import React, { useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { OsmGeometry } from '../services/osm';
import { GroundKind } from '../utils/cityProfile';
import { CITY_SCALE, PLATFORM_RADIUS } from '../utils/cityLayout';
import OsmCity from './OsmCity';

interface CityProps {
  animated: React.MutableRefObject<AnimatedPreset>;
  ground: GroundKind;
  geometry: OsmGeometry | null;
}

const AUTO_ROTATE_SPEED = 0.05;
const HALF = PLATFORM_RADIUS; // half-width of the square platform
const DIAG = HALF * Math.SQRT2; // pyramid base radius so its edges meet the square

// Per-terrain colours: [side soil, top surface, dark underside].
const GROUND_COLORS: Record<GroundKind, [string, string, string]> = {
  grass: ['#9c8a6f', '#6f9256', '#4a3f31'],
  sand: ['#c8b184', '#d8c48f', '#7d6a4a'],
};

export default function City({ animated, ground, geometry }: CityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const autoRotation = useRef(0);
  const [soil, top, under] = GROUND_COLORS[ground];

  useSafeFrame((_, delta) => {
    autoRotation.current += delta * AUTO_ROTATE_SPEED;
    if (groupRef.current) {
      groupRef.current.rotation.y = autoRotation.current;
    }
  }, 'City');

  return (
    <group scale={CITY_SCALE}>
      <group ref={groupRef}>
        {/* Square floating slab: grass top, soil sides, dark bottom. */}
        <mesh position={[0, -0.65, 0]} receiveShadow castShadow>
          <boxGeometry args={[HALF * 2, 1.3, HALF * 2]} />
          <meshStandardMaterial attach="material-0" color={soil} flatShading roughness={0.95} />
          <meshStandardMaterial attach="material-1" color={soil} flatShading roughness={0.95} />
          <meshStandardMaterial attach="material-2" color={top} flatShading roughness={0.9} />
          <meshStandardMaterial attach="material-3" color={under} flatShading roughness={0.95} />
          <meshStandardMaterial attach="material-4" color={soil} flatShading roughness={0.95} />
          <meshStandardMaterial attach="material-5" color={soil} flatShading roughness={0.95} />
        </mesh>
        {/* Square pyramid underside so the island tapers to a point. */}
        <mesh position={[0, -3.05, 0]} rotation={[Math.PI, Math.PI / 4, 0]}>
          <coneGeometry args={[DIAG, 3.5, 4]} />
          <meshStandardMaterial color="#6f5e49" flatShading roughness={1} />
        </mesh>
        {geometry ? <OsmCity geometry={geometry} animated={animated} /> : null}
      </group>
    </group>
  );
}
