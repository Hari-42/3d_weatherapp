import { Feather } from '@expo/vector-icons';
import { Canvas } from '@react-three/fiber/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import * as THREE from 'three';
import City from '../components/City';
import Clouds from '../components/Clouds';
import Lights from '../components/Lights';
import Rain from '../components/Rain';
import WeatherSystem from '../components/WeatherSystem';
import AddCityOverlay from '../components/ui/AddCityOverlay';
import CityCard from '../components/ui/CityCard';
import ForecastList from '../components/ui/ForecastList';
import PageDots from '../components/ui/PageDots';
import { useAnimatedPreset } from '../hooks/useAnimatedPreset';
import { useCitiesWeather } from '../hooks/useCitiesWeather';
import { useCityGeometry } from '../hooks/useCityGeometry';
import { useCityList } from '../hooks/useCityList';
import { useSafeFrame } from '../hooks/useSafeFrame';
import { OsmGeometry } from '../services/osm';
import { prefetchCities } from '../services/osmCache';
import { theme } from '../theme/colors';
import { WeatherType, WEATHER_PRESETS } from '../types/weather';
import { CITY_SCALE } from '../utils/cityLayout';
import { getCityProfile, GroundKind } from '../utils/cityProfile';

// How far down the whole diorama sits, to keep it clear of the card overlay.
const DIORAMA_Y = -3.4;

type NumberRef = React.MutableRefObject<number>;

/** Group whose yaw/pitch is driven by drag refs, for the interactive mode. */
function DioramaRig({
  dragYaw,
  dragTilt,
  interactive,
  children,
}: {
  dragYaw: NumberRef;
  dragTilt: NumberRef;
  interactive: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useSafeFrame((_, delta) => {
    // Outside interactive mode, ease the drag back to the default view so
    // exiting always returns to the original position.
    if (!interactive) {
      const t = 1 - Math.exp(-6 * delta);
      dragYaw.current = THREE.MathUtils.lerp(dragYaw.current, 0, t);
      dragTilt.current = THREE.MathUtils.lerp(dragTilt.current, 0, t);
    }
    if (ref.current) {
      ref.current.rotation.y = dragYaw.current;
      ref.current.rotation.x = dragTilt.current;
    }
  }, 'DioramaRig');
  return (
    <group ref={ref} position={[0, DIORAMA_Y, 0]}>
      {children}
    </group>
  );
}

function SceneContent({
  weatherType,
  ground,
  geometry,
  dragYaw,
  dragTilt,
  interactive,
}: {
  weatherType: WeatherType;
  ground: GroundKind;
  geometry: OsmGeometry | null;
  dragYaw: NumberRef;
  dragTilt: NumberRef;
  interactive: boolean;
}) {
  const animated = useAnimatedPreset(WEATHER_PRESETS[weatherType]);

  return (
    <>
      <WeatherSystem animated={animated} />
      <Lights animated={animated} />
      <DioramaRig dragYaw={dragYaw} dragTilt={dragTilt} interactive={interactive}>
        {/* Auto-rotation pauses in interactive mode so the drag fully controls it. */}
        <City animated={animated} ground={ground} geometry={geometry} paused={interactive} />
        <group scale={CITY_SCALE}>
          <Clouds animated={animated} />
          <Rain animated={animated} />
        </group>
      </DioramaRig>
    </>
  );
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const { cities, addCity, removeCity } = useCityList();
  const { weatherByCity, error } = useCitiesWeather(cities);

  const [cityIndex, setCityIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Drag-to-rotate state for interactive mode (refs → read inside useFrame).
  const dragYaw = useRef(0);
  const dragTilt = useRef(0);
  const dragStart = useRef({ yaw: 0, tilt: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { yaw: dragYaw.current, tilt: dragTilt.current };
      },
      onPanResponderMove: (_, g) => {
        dragYaw.current = dragStart.current.yaw + g.dx * 0.01;
        dragTilt.current = Math.max(-0.35, Math.min(0.85, dragStart.current.tilt + g.dy * 0.006));
      },
    })
  ).current;

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

  const exitInteractive = () => {
    // Normalise yaw to (-π, π] so the diorama eases back the short way, not
    // unwinding several full turns.
    const twoPi = Math.PI * 2;
    let y = dragYaw.current % twoPi;
    if (y > Math.PI) y -= twoPi;
    if (y < -Math.PI) y += twoPi;
    dragYaw.current = y;
    setInteractive(false);
  };

  const activeCity = cities[cityIndex];
  const activeWeather = activeCity ? weatherByCity[activeCity.id]?.weather ?? 'sunny' : 'sunny';
  const profile = getCityProfile(activeCity?.name);
  const { geometry, status } = useCityGeometry(activeCity);

  return (
    <View style={styles.container}>
      <Canvas
        shadows
        camera={{ position: [7, 6, 9], fov: 45 }}
        gl={{ toneMappingExposure: 1.15 }}
        style={StyleSheet.absoluteFillObject}
      >
        <SceneContent
          weatherType={activeWeather}
          ground={profile.ground}
          geometry={geometry}
          dragYaw={dragYaw}
          dragTilt={dragTilt}
          interactive={interactive}
        />
      </Canvas>

      {cities.length > 0 ? (
        <Animated.ScrollView
          ref={scrollRef as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          pointerEvents={interactive ? 'none' : 'auto'}
          style={[StyleSheet.absoluteFill, interactive && styles.hidden]}
        >
          {cities.map((city) => {
            const weather = weatherByCity[city.id];
            return (
              <ScrollView
                key={city.id}
                style={{ width }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pageContent}
                nestedScrollEnabled
              >
                <CityCard city={city} weather={weather} error={error} onRemove={removeCity} />
                {/* Gap so the 3D island stays visible above the fold. */}
                <View style={{ height: height * 0.46 }} />
                {weather?.daily?.length ? <ForecastList daily={weather.daily} /> : null}
                <View style={{ height: 32 }} />
              </ScrollView>
            );
          })}
        </Animated.ScrollView>
      ) : (
        <View style={styles.empty} pointerEvents="none">
          <Text style={styles.emptyText}>No cities yet.</Text>
          <Text style={styles.emptySub}>Tap + to add one.</Text>
        </View>
      )}

      <Text style={styles.brand} pointerEvents="none">
        MeteoScope
      </Text>

      {interactive ? (
        <>
          {/* Full-screen drag surface for rotating the diorama. */}
          <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
          <Pressable style={styles.iconButton} onPress={exitInteractive} hitSlop={10}>
            <Feather name="x" size={22} color={theme.textPrimary} />
          </Pressable>
          <Text style={styles.hint} pointerEvents="none">
            Drag to rotate & tilt
          </Text>
        </>
      ) : (
        <>
          <Pressable style={styles.addButton} onPress={() => setAdding(true)} hitSlop={10}>
            <Feather name="plus" size={22} color={theme.textPrimary} />
          </Pressable>
          <Pressable
            style={styles.rotateButton}
            onPress={() => setInteractive(true)}
            hitSlop={10}
          >
            <Feather name="rotate-cw" size={20} color={theme.textPrimary} />
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
        </>
      )}

      {adding ? <AddCityOverlay onAdd={addCity} onClose={() => setAdding(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  hidden: {
    opacity: 0,
  },
  pageContent: {
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
  rotateButton: {
    position: 'absolute',
    top: 54,
    right: 72,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  iconButton: {
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
  hint: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: 13,
  },
  brand: {
    position: 'absolute',
    top: 56,
    left: 22,
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  mapLoading: {
    position: 'absolute',
    top: 92,
    left: 22,
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
