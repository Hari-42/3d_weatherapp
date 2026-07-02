import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { mulberry32, range } from '../utils/random';

interface RainProps {
  animated: React.MutableRefObject<AnimatedPreset>;
}

const COUNT = 260;
const AREA = 9;
const TOP = 9;
const BOTTOM = -0.5;
const FALL_SPEED = 9;

/** A single Points draw call standing in for rain; particles wrap from top to bottom. */
export default function Rain({ animated }: RainProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const random = mulberry32(4242);
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = range(random, -AREA, AREA);
      arr[i * 3 + 1] = range(random, BOTTOM, TOP);
      arr[i * 3 + 2] = range(random, -AREA, AREA);
    }
    return arr;
  }, []);

  useSafeFrame((_, delta) => {
    const a = animated.current;
    if (materialRef.current) {
      materialRef.current.opacity = a.rain.value * 0.75;
    }
    if (!pointsRef.current || a.rain.value < 0.02) return;

    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      let y = attr.getY(i) - FALL_SPEED * delta;
      if (y < BOTTOM) y = TOP;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  }, 'Rain');

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#cfe3ff"
        // sizeAttenuation size is in world space and is NOT affected by the
        // parent group's scale, so it's tuned small to match the miniature.
        size={0.02}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
