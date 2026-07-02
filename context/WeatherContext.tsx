import React, { createContext, useContext, useMemo, useState } from 'react';
import { WeatherPreset, WeatherType, WEATHER_PRESETS } from '../types/weather';

interface WeatherContextValue {
  weather: WeatherType;
  setWeather: (weather: WeatherType) => void;
  preset: WeatherPreset;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherType>('sunny');

  const value = useMemo<WeatherContextValue>(
    () => ({ weather, setWeather, preset: WEATHER_PRESETS[weather] }),
    [weather]
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within a WeatherProvider');
  return ctx;
}
