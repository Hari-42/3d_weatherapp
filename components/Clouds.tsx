import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { mulberry32, range } from '../utils/random';

interface CloudsProps {
  animated: React.MutableRefObject<AnimatedPreset>;
}

const CLOUD_COUNT = 9;
const PUFFS_PER_CLOUD = 4;
const TOTAL = CLOUD_COUNT * PUFFS_PER_CLOUD;
const BOUND = 12;

interface Puff {
  clusterIndex: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  scale: number;
}

/** A handful of low-poly blob clusters drifting across the sky, driven by one instanced draw call. */
export default function Clouds({ animated }: CloudsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { puffs, clusterY, clusterZ, clusterSpeed, clusterX } = useMemo(() => {
    const random = mulberry32(1337);
    const clusterX: number[] = [];
    const clusterY: number[] = [];
    const clusterZ: number[] = [];
    const clusterSpeed: number[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      clusterX.push(range(random, -BOUND, BOUND));
      clusterY.push(range(random, 4.5, 6.8));
      clusterZ.push(range(random, -BOUND, BOUND));
      clusterSpeed.push(range(random, 0.15, 0.35));
    }
    const puffs: Puff[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      for (let j = 0; j < PUFFS_PER_CLOUD; j++) {
        puffs.push({
          clusterIndex: i,
          offsetX: range(random, -1.1, 1.1),
          offsetY: range(random, -0.25, 0.35),
          offsetZ: range(random, -0.8, 0.8),
          scale: range(random, 0.55, 1.1),
        });
      }
    }
    return { puffs, clusterX, clusterY, clusterZ, clusterSpeed };
  }, []);

  useSafeFrame((_, delta) => {
    const a = animated.current;
    if (materialRef.current) {
      materialRef.current.color.copy(a.cloudColor);
      materialRef.current.opacity =
        a.cloudOpacity.value * THREE.MathUtils.clamp(a.cloudCoverage.value * 1.4, 0.15, 1);
    }
    if (!meshRef.current) return;

    for (let i = 0; i < CLOUD_COUNT; i++) {
      clusterX[i] += clusterSpeed[i] * delta;
      if (clusterX[i] > BOUND) clusterX[i] = -BOUND;
    }

    for (let p = 0; p < TOTAL; p++) {
      const puff = puffs[p];
      dummy.position.set(
        clusterX[puff.clusterIndex] + puff.offsetX,
        clusterY[puff.clusterIndex] + puff.offsetY,
        clusterZ[puff.clusterIndex] + puff.offsetZ
      );
      dummy.scale.setScalar(puff.scale * (0.65 + a.cloudCoverage.value * 0.6));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(p, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, 'Clouds');

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL]} frustumCulled={false}>
      <icosahedronGeometry args={[0.9, 0]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#ffffff"
        transparent
        depthWrite={false}
        roughness={1}
        flatShading
      />
    </instancedMesh>
  );
}
