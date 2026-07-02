export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'night';

/** Feather icon name representing each weather condition (see @expo/vector-icons). */
export type WeatherIconName = 'sun' | 'cloud' | 'cloud-rain' | 'moon';

export interface WeatherPreset {
  label: string;
  icon: WeatherIconName;
  temperature: number;
  sky: [string, string];
  fogColor: string;
  fogDensity: number;
  ambientIntensity: number;
  ambientColor: string;
  sunIntensity: number;
  sunColor: string;
  cloudOpacity: number;
  cloudColor: string;
  cloudCoverage: number;
  rain: boolean;
  windowsGlow: boolean;
  moonlight: boolean;
}


export const WEATHER_PRESETS: Record<WeatherType, WeatherPreset> = {
  sunny: {
    label: 'Sunny',
    icon: 'sun',
    temperature: 24,
    sky: ['#8ed2ff', '#eaf7ff'],
    fogColor: '#bfe6ff',
    fogDensity: 0,
    ambientIntensity: 0.65,
    ambientColor: '#fff3d6',
    sunIntensity: 1.85,
    sunColor: '#fff1c9',
    cloudOpacity: 0.35,
    cloudColor: '#ffffff',
    cloudCoverage: 0.15,
    rain: false,
    windowsGlow: false,
    moonlight: false,
  },
  cloudy: {
    label: 'Cloudy',
    icon: 'cloud',
    temperature: 16,
    sky: ['#9aa7b0', '#d7dee2'],
    fogColor: '#c7cdd1',
    fogDensity: 0.015,
    ambientIntensity: 0.6,
    ambientColor: '#dfe4e8',
    sunIntensity: 0.55,
    sunColor: '#e7ecef',
    cloudOpacity: 0.85,
    cloudColor: '#c3cad0',
    cloudCoverage: 0.75,
    rain: false,
    windowsGlow: false,
    moonlight: false,
  },
  rainy: {
    label: 'Rain',
    icon: 'cloud-rain',
    temperature: 12,
    sky: ['#414a52', '#6b7680'],
    fogColor: '#4d5661',
    fogDensity: 0.045,
    ambientIntensity: 0.4,
    ambientColor: '#aab4bd',
    sunIntensity: 0.25,
    sunColor: '#9fb0bd',
    cloudOpacity: 0.95,
    cloudColor: '#454f57',
    cloudCoverage: 0.95,
    rain: true,
    windowsGlow: false,
    moonlight: false,
  },
  night: {
    label: 'Night',
    icon: 'moon',
    temperature: 9,
    sky: ['#050914', '#151d33'],
    fogColor: '#0a0f1e',
    fogDensity: 0.02,
    ambientIntensity: 0.18,
    ambientColor: '#3a4a7a',
    sunIntensity: 0.4,
    sunColor: '#aebeff',
    cloudOpacity: 0.5,
    cloudColor: '#232c47',
    cloudCoverage: 0.3,
    rain: false,
    windowsGlow: true,
    moonlight: true,
  },
};
