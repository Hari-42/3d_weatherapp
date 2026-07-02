import { Feather } from '@expo/vector-icons';
import { Canvas } from '@react-three/fiber/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import City from '../components/City';
import Clouds from '../components/Clouds';
import Lights from '../components/Lights';
import Rain from '../components/Rain';
import WeatherSystem from '../components/WeatherSystem';
import AddCityOverlay from '../components/ui/AddCityOverlay';
import CityCard from '../components/ui/CityCard';
import PageDots from '../components/ui/PageDots';
import { useAnimatedPreset } from '../hooks/useAnimatedPreset';
import { useCitiesWeather } from '../hooks/useCitiesWeather';
import { useCityList } from '../hooks/useCityList';
import { theme } from '../theme/colors';
import { WeatherType, WEATHER_PRESETS } from '../types/weather';
import { CITY_SCALE } from '../utils/cityLayout';

// How far down the whole diorama sits, to keep it clear of the card overlay.
const DIORAMA_Y = -2.8;

function SceneContent({ weatherType }: { weatherType: WeatherType }) {
  const animated = useAnimatedPreset(WEATHER_PRESETS[weatherType]);

  return (
    <>
      <WeatherSystem animated={animated} />
      <Lights animated={animated} />
      {/* City + its clouds/rain move down together so they stay aligned. */}
      <group position={[0, DIORAMA_Y, 0]}>
        <City animated={animated} />
        {/* Rain and clouds share the city's scale so they stay proportional
            to the miniature instead of towering over it. */}
        <group scale={CITY_SCALE}>
          <Clouds animated={animated} />
          <Rain animated={animated} />
        </group>
      </group>
    </>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { cities, addCity, removeCity } = useCityList();
  const { weatherByCity, error } = useCitiesWeather(cities);

  const [cityIndex, setCityIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Keep the active index valid as cities are added/removed.
  useEffect(() => {
    if (cityIndex > cities.length - 1) {
      const clamped = Math.max(0, cities.length - 1);
      setCityIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * width, animated: false });
    }
  }, [cities.length, cityIndex, width]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCityIndex(Math.max(0, Math.min(cities.length - 1, index)));
  };

  const activeCity = cities[cityIndex];
  // Until live data arrives (or with no cities), fall back to a neutral sunny scene.
  const activeWeather = activeCity ? weatherByCity[activeCity.id]?.weather ?? 'sunny' : 'sunny';

  return (
    <View style={styles.container}>
      <Canvas
        shadows
        camera={{ position: [7, 6, 9], fov: 45 }}
        style={StyleSheet.absoluteFillObject}
      >
        <SceneContent weatherType={activeWeather} />
      </Canvas>

      {cities.length > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={StyleSheet.absoluteFill}
        >
          {cities.map((city) => (
            <View key={city.id} style={[styles.page, { width }]}>
              <CityCard city={city} weather={weatherByCity[city.id]} error={error} onRemove={removeCity} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.empty} pointerEvents="none">
          <Text style={styles.emptyText}>No cities yet.</Text>
          <Text style={styles.emptySub}>Tap + to add one.</Text>
        </View>
      )}

      <Pressable style={styles.addButton} onPress={() => setAdding(true)} hitSlop={10}>
        <Feather name="plus" size={22} color={theme.textPrimary} />
      </Pressable>

      {cities.length > 1 ? <PageDots count={cities.length} activeIndex={cityIndex} /> : null}

      {adding ? (
        <AddCityOverlay onAdd={addCity} onClose={() => setAdding(false)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  page: {
    paddingTop: 100,
    paddingHorizontal: 16,
  },
  addButton: {
    position: 'absolute',
    top: 54,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  emptySub: {
    color: theme.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
});
