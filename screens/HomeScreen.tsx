import { Feather } from '@expo/vector-icons';
import { Canvas } from '@react-three/fiber/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { useCityGeometry } from '../hooks/useCityGeometry';
import { useCityList } from '../hooks/useCityList';
import { OsmGeometry } from '../services/osm';
import { prefetchCities } from '../services/osmCache';
import { theme } from '../theme/colors';
import { WeatherType, WEATHER_PRESETS } from '../types/weather';
import { CITY_SCALE } from '../utils/cityLayout';
import { getCityProfile, GroundKind } from '../utils/cityProfile';

// How far down the whole diorama sits, to keep it clear of the card overlay.
const DIORAMA_Y = -3.4;

function SceneContent({
  weatherType,
  ground,
  geometry,
}: {
  weatherType: WeatherType;
  ground: GroundKind;
  geometry: OsmGeometry | null;
}) {
  const animated = useAnimatedPreset(WEATHER_PRESETS[weatherType]);

  return (
    <>
      <WeatherSystem animated={animated} />
      <Lights animated={animated} />
      {/* City + its clouds/rain move down together so they stay aligned. */}
      <group position={[0, DIORAMA_Y, 0]}>
        <City animated={animated} ground={ground} geometry={geometry} />
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
  const scrollX = useRef(new Animated.Value(0)).current;

  // Preload OSM geometry for every city in the background so swiping is instant.
  useEffect(() => {
    void prefetchCities(cities);
  }, [cities]);

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
  // A few known cities get a characteristic terrain (e.g. desert).
  const profile = getCityProfile(activeCity?.name);
  // Real OSM geometry for the active city (null while loading or on failure).
  const { geometry, status } = useCityGeometry(activeCity);

  return (
    <View style={styles.container}>
      <Canvas
        shadows
        camera={{ position: [7, 6, 9], fov: 45 }}
        // Slightly lifted exposure on top of r3f's default ACES tone mapping
        // gives a warmer, punchier image without blowing out highlights.
        gl={{ toneMappingExposure: 1.15 }}
        style={StyleSheet.absoluteFillObject}
      >
        <SceneContent weatherType={activeWeather} ground={profile.ground} geometry={geometry} />
      </Canvas>

      {cities.length > 0 ? (
        <Animated.ScrollView
          ref={scrollRef as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          style={StyleSheet.absoluteFill}
        >
          {cities.map((city) => (
            <View key={city.id} style={[styles.page, { width }]}>
              <CityCard city={city} weather={weatherByCity[city.id]} error={error} onRemove={removeCity} />
            </View>
          ))}
        </Animated.ScrollView>
      ) : (
        <View style={styles.empty} pointerEvents="none">
          <Text style={styles.emptyText}>No cities yet.</Text>
          <Text style={styles.emptySub}>Tap + to add one.</Text>
        </View>
      )}

      <Pressable style={styles.addButton} onPress={() => setAdding(true)} hitSlop={10}>
        <Feather name="plus" size={22} color={theme.textPrimary} />
      </Pressable>

      {status === 'loading' && activeCity ? (
        <View style={styles.mapLoading} pointerEvents="none">
          <Feather name="map-pin" size={12} color={theme.textSecondary} />
          <Text style={styles.mapLoadingText}>Loading map…</Text>
        </View>
      ) : null}

      {cities.length > 1 ? (
        <PageDots count={cities.length} scrollX={scrollX} pageWidth={width} />
      ) : null}

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
  mapLoading: {
    position: 'absolute',
    top: 62,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapLoadingText: {
    color: theme.textSecondary,
    fontSize: 12,
    marginLeft: 5,
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
