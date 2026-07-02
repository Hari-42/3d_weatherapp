import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';

interface WaterProps {
  animated: React.MutableRefObject<AnimatedPreset>;
}

const SIZE = 30;
const SEGMENTS = 22;
const wetTint = new THREE.Color('#0d3a52');

export default function Water({ animated }: WaterProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const timeRef = useRef(0);

  const geometry = useMemo(() => new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS), []);
  const basePositions = useMemo(
    () => (geometry.attributes.position.array as Float32Array).slice(),
    [geometry]
  );

  useSafeFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      arr[i + 2] = Math.sin(x * 0.4 + t * 0.8) * 0.05 + Math.cos(y * 0.35 + t * 0.6) * 0.05;
    }
    posAttr.needsUpdate = true;

    if (materialRef.current) {
      const a = animated.current;
      materialRef.current.color.copy(a.skyBottom).lerp(wetTint, 0.55);
      materialRef.current.roughness = THREE.MathUtils.lerp(0.35, 0.08, a.rain.value);
      materialRef.current.metalness = THREE.MathUtils.lerp(0.15, 0.55, a.rain.value);
    }
  }, 'Water');

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.55, 0]}
      receiveShadow
    >
      <meshStandardMaterial ref={materialRef} color="#1c5c7a" roughness={0.3} metalness={0.2} flatShading />
    </mesh>
  );
}
