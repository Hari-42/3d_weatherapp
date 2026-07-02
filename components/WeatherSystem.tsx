import { useThree } from '@react-three/fiber/native';
import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { AnimatedPreset } from '../hooks/useAnimatedPreset';
import { useSafeFrame } from '../hooks/useSafeFrame';
import Rain from './Rain';

interface WeatherSystemProps {
  animated: React.MutableRefObject<AnimatedPreset>;
}

const skyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const skyFragmentShader = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition).y * 0.5 + 0.5;
    gl_FragColor = vec4(mix(bottomColor, topColor, clamp(h, 0.0, 1.0)), 1.0);
  }
`;

/** Sky dome + fog + rain — the "weather" layer that sits over the static city geometry. */
export default function WeatherSystem({ animated }: WeatherSystemProps) {
  const { scene } = useThree();

  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color('#8ed2ff') },
      bottomColor: { value: new THREE.Color('#eaf7ff') },
    }),
    []
  );

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#bfe6ff', 0);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useSafeFrame(() => {
    const a = animated.current;
    uniforms.topColor.value.copy(a.skyTop);
    uniforms.bottomColor.value.copy(a.skyBottom);
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(a.fogColor);
      scene.fog.density = a.fogDensity.value;
    }
  }, 'WeatherSystem');

  return (
    <>
      <mesh>
        <sphereGeometry args={[45, 16, 12]} />
        <shaderMaterial
          side={THREE.BackSide}
          uniforms={uniforms}
          vertexShader={skyVertexShader}
          fragmentShader={skyFragmentShader}
        />
      </mesh>
      <Rain animated={animated} />
    </>
  );
}
