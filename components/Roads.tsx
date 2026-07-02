import React from 'react';
import { PLATFORM_RADIUS, ROAD_WIDTH } from '../utils/cityLayout';

const STRIPE_POSITIONS = [-4.8, -3, -1.2, 1.2, 3, 4.8];

export default function Roads() {
  const length = PLATFORM_RADIUS * 2.05;

  return (
    <group position={[0, 0.011, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[length, ROAD_WIDTH]} />
        <meshStandardMaterial color="#3a3d42" roughness={0.95} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[length, ROAD_WIDTH]} />
        <meshStandardMaterial color="#3a3d42" roughness={0.95} flatShading />
      </mesh>

      {STRIPE_POSITIONS.map((pos, i) => (
        <mesh key={`h-${i}`} position={[pos, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.45, 0.06]} />
          <meshStandardMaterial color="#eceeef" />
        </mesh>
      ))}
      {STRIPE_POSITIONS.map((pos, i) => (
        <mesh key={`v-${i}`} position={[0, 0.002, pos]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, 0.45]} />
          <meshStandardMaterial color="#eceeef" />
        </mesh>
      ))}
    </group>
  );
}
