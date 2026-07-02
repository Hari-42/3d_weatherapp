import { Canvas } from '@react-three/fiber/native';
import React, { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import City from '../components/City';
import Clouds from '../components/Clouds';
import Lights from '../components/Lights';
import WeatherSystem from '../components/WeatherSystem';
import TopBar from '../components/ui/TopBar';
import WeatherSwitcher from '../components/ui/WeatherSwitcher';
import { useWeather } from '../context/WeatherContext';
import { useAnimatedPreset } from '../hooks/useAnimatedPreset';
import { theme } from '../theme/colors';

function SceneContent({ dragRotation }: { dragRotation: React.MutableRefObject<number> }) {
  const { preset } = useWeather();
  const animated = useAnimatedPreset(preset);

  return (
    <>
      <WeatherSystem animated={animated} />
      <Lights animated={animated} />
      <City animated={animated} dragRotation={dragRotation} />
      <Clouds animated={animated} />
    </>
  );
}

export default function HomeScreen() {
  const { weather, setWeather, preset } = useWeather();
  const dragRotation = useRef(0);
  const dragStart = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2,
      onPanResponderGrant: () => {
        dragStart.current = dragRotation.current;
      },
      onPanResponderMove: (_, gestureState) => {
        dragRotation.current = dragStart.current + gestureState.dx * 0.01;
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        <Canvas shadows camera={{ position: [12, 10, 15], fov: 50 }} style={styles.canvas}>
          <SceneContent dragRotation={dragRotation} />
        </Canvas>
      </View>

      <View style={styles.overlay} pointerEvents="box-none">
        <TopBar preset={preset} />
        <View style={styles.spacer} />
        <WeatherSwitcher weather={weather} onSelect={setWeather} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  canvas: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
});
