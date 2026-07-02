import { useRef } from 'react';
import * as THREE from 'three';
import { WeatherPreset } from '../types/weather';
import { useSafeFrame } from './useSafeFrame';

export interface AnimatedPreset {
  skyTop: THREE.Color;
  skyBottom: THREE.Color;
  fogColor: THREE.Color;
  fogDensity: { value: number };
  ambientIntensity: { value: number };
  ambientColor: THREE.Color;
  sunIntensity: { value: number };
  sunColor: THREE.Color;
  cloudOpacity: { value: number };
  cloudColor: THREE.Color;
  cloudCoverage: { value: number };
  rain: { value: number };
  windowsGlow: { value: number };
  moonlight: { value: number };
}

function build(preset: WeatherPreset): AnimatedPreset {
  return {
    skyTop: new THREE.Color(preset.sky[0]),
    skyBottom: new THREE.Color(preset.sky[1]),
    fogColor: new THREE.Color(preset.fogColor),
    fogDensity: { value: preset.fogDensity },
    ambientIntensity: { value: preset.ambientIntensity },
    ambientColor: new THREE.Color(preset.ambientColor),
    sunIntensity: { value: preset.sunIntensity },
    sunColor: new THREE.Color(preset.sunColor),
    cloudOpacity: { value: preset.cloudOpacity },
    cloudColor: new THREE.Color(preset.cloudColor),
    cloudCoverage: { value: preset.cloudCoverage },
    rain: { value: preset.rain ? 1 : 0 },
    windowsGlow: { value: preset.windowsGlow ? 1 : 0 },
    moonlight: { value: preset.moonlight ? 1 : 0 },
  };
}

const tmp = new THREE.Color();

/**
 * Keeps a single mutable "animated" copy of the active weather preset and
 * eases every value toward the target each frame, so switching weather modes
 * cross-fades colors/intensities instead of popping instantly.
 */
export function useAnimatedPreset(preset: WeatherPreset, speed = 2.2) {
  const current = useRef<AnimatedPreset>(build(preset));
  const target = useRef<WeatherPreset>(preset);
  target.current = preset;

  useSafeFrame((_, delta) => {
    const t = 1 - Math.exp(-speed * delta);
    const c = current.current;
    const p = target.current;

    c.skyTop.lerp(tmp.set(p.sky[0]), t);
    c.skyBottom.lerp(tmp.set(p.sky[1]), t);
    c.fogColor.lerp(tmp.set(p.fogColor), t);
    c.ambientColor.lerp(tmp.set(p.ambientColor), t);
    c.sunColor.lerp(tmp.set(p.sunColor), t);
    c.cloudColor.lerp(tmp.set(p.cloudColor), t);

    c.fogDensity.value = THREE.MathUtils.lerp(c.fogDensity.value, p.fogDensity, t);
    c.ambientIntensity.value = THREE.MathUtils.lerp(c.ambientIntensity.value, p.ambientIntensity, t);
    c.sunIntensity.value = THREE.MathUtils.lerp(c.sunIntensity.value, p.sunIntensity, t);
    c.cloudOpacity.value = THREE.MathUtils.lerp(c.cloudOpacity.value, p.cloudOpacity, t);
    c.cloudCoverage.value = THREE.MathUtils.lerp(c.cloudCoverage.value, p.cloudCoverage, t);
    c.rain.value = THREE.MathUtils.lerp(c.rain.value, p.rain ? 1 : 0, t);
    c.windowsGlow.value = THREE.MathUtils.lerp(c.windowsGlow.value, p.windowsGlow ? 1 : 0, t);
    c.moonlight.value = THREE.MathUtils.lerp(c.moonlight.value, p.moonlight ? 1 : 0, t);
  }, 'AnimatedPreset');

  return current;
}
