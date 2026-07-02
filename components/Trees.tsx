import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TreeSpec } from '../utils/cityLayout';

interface TreesProps {
  trees: TreeSpec[];
}

const dummy = new THREE.Object3D();

/** Trunks and foliage are each a single instanced draw call, sized for mobile GPUs. */
export default function Trees({ trees }: TreesProps) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const count = useMemo(() => trees.length, [trees]);

  useLayoutEffect(() => {
    trees.forEach((tree, i) => {
      dummy.position.set(tree.x, 0.18 * tree.scale, tree.z);
      dummy.scale.setScalar(tree.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.x, 0.5 * tree.scale, tree.z);
      dummy.updateMatrix();
      foliageRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (foliageRef.current) foliageRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.36, 5]} />
        <meshStandardMaterial color="#8a5a3c" flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined, undefined, count]} castShadow>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#4f9b5c" flatShading roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
