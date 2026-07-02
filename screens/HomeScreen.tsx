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
import WeatherSystem from '../components/WeatherSystem';
import CityCard from '../components/ui/CityCard';
import PageDots from '../components/ui/PageDots';
import { useAnimatedPreset } from '../hooks/useAnimatedPreset';
import { theme } from '../theme/colors';
import { CITIES } from '../types/city';
import { WEATHER_PRESETS } from '../types/weather';

function SceneContent({ cityIndex }: { cityIndex: number }) {
  const preset = WEATHER_PRESETS[CITIES[cityIndex].weather];
  const animated = useAnimatedPreset(preset);

  return (
    <>
      <WeatherSystem animated={animated} />
      <Lights animated={animated} />
      <City animated={animated} />
      <Clouds animated={animated} />
    </>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [cityIndex, setCityIndex] = useState(0);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCityIndex(Math.max(0, Math.min(CITIES.length - 1, index)));
  };

  return (
    <View style={styles.container}>
      <Canvas
        shadows
        camera={{ position: [7, 6, 9], fov: 45 }}
        style={StyleSheet.absoluteFillObject}
      >
        <SceneContent cityIndex={cityIndex} />
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
            <CityCard city={city} />
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
