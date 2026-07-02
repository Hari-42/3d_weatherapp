import React, { useRef } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';

interface LightsProps {
  animated: React.MutableRefObject<AnimatedPreset>;
}

const SUN_POS = new THREE.Vector3(6, 9, 4);
const MOON_POS = new THREE.Vector3(-5, 8, -3);
const lerpedPos = new THREE.Vector3();

export default function Lights({ animated }: LightsProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.HemisphereLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  useSafeFrame(() => {
    const a = animated.current;

    if (ambientRef.current) {
      ambientRef.current.color.copy(a.ambientColor);
      ambientRef.current.intensity = a.ambientIntensity.value;
    }

    if (sunRef.current) {
      sunRef.current.color.copy(a.sunColor);
      sunRef.current.intensity = a.sunIntensity.value;
      lerpedPos.copy(SUN_POS).lerp(MOON_POS, a.moonlight.value);
      sunRef.current.position.copy(lerpedPos);
    }

    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(0.45, 0.15, a.moonlight.value);
    }

    // Cool back light separates the city from the sky and lifts the dark sides.
    if (rimRef.current) {
      rimRef.current.intensity = THREE.MathUtils.lerp(0.4, 0.18, a.moonlight.value);
    }
  }, 'Lights');

  return (
    <>
      <ambientLight ref={ambientRef} />
      <hemisphereLight ref={fillRef} args={['#bcd3ff', '#2b2f3a', 0.45]} />
      <directionalLight ref={rimRef} position={[-7, 6, -6]} color="#aecbff" intensity={0.4} />
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-bias={-0.0025}
      />
    </>
  );
}
