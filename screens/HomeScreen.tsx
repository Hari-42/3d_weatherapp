import { Canvas } from '@react-three/fiber/native';
import React, { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import City from '../components/City';
import Clouds from '../components/Clouds';
import Lights from '../components/Lights';
import Rain from '../components/Rain';
import WeatherSystem from '../components/WeatherSystem';
import CityCard from '../components/ui/CityCard';
import PageDots from '../components/ui/PageDots';
import { useAnimatedPreset } from '../hooks/useAnimatedPreset';
import { useCitiesWeather } from '../hooks/useCitiesWeather';
import { theme } from '../theme/colors';
import { CITIES } from '../types/city';
import { WeatherType, WEATHER_PRESETS } from '../types/weather';
import { CITY_SCALE } from '../utils/cityLayout';

function SceneContent({ weatherType }: { weatherType: WeatherType }) {
  const animated = useAnimatedPreset(WEATHER_PRESETS[weatherType]);

  return (
    <>
      <WeatherSystem animated={animated} />
      <Lights animated={animated} />
      <City animated={animated} />
      {/* Rain and clouds share the city's scale so they stay proportional
          to the miniature instead of towering over it. */}
      <group scale={CITY_SCALE}>
        <Clouds animated={animated} />
        <Rain animated={animated} />
      </group>
    </>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [cityIndex, setCityIndex] = useState(0);
  const { weatherByCity, error } = useCitiesWeather();

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCityIndex(Math.max(0, Math.min(CITIES.length - 1, index)));
  };

  // Until live data arrives, fall back to a neutral sunny scene.
  const activeWeather = weatherByCity[CITIES[cityIndex].id]?.weather ?? 'sunny';

  return (
    <View style={styles.container}>
      <Canvas
        shadows
        camera={{ position: [7, 6, 9], fov: 45 }}
        style={StyleSheet.absoluteFillObject}
      >
        <SceneContent weatherType={activeWeather} />
      </Canvas>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={StyleSheet.absoluteFill}
      >
        {CITIES.map((city) => (
          <View key={city.id} style={[styles.page, { width }]}>
            <CityCard city={city} weather={weatherByCity[city.id]} error={error} />
          </View>
        ))}
      </ScrollView>

      <PageDots count={CITIES.length} activeIndex={cityIndex} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  page: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
});
