import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/colors';
import { WeatherType, WEATHER_ORDER, WEATHER_PRESETS } from '../../types/weather';
import GlassPanel from './GlassPanel';

interface WeatherSwitcherProps {
  weather: WeatherType;
  onSelect: (weather: WeatherType) => void;
}

function SwitcherButton({
  type,
  active,
  onSelect,
}: {
  type: WeatherType;
  active: boolean;
  onSelect: (weather: WeatherType) => void;
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const preset = WEATHER_PRESETS[type];

  const animate = (toValue: number) => {
    Animated.spring(pressScale, {
      toValue,
      useNativeDriver: true,
      damping: 14,
      stiffness: 220,
    }).start();
  };

  return (
    <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pressScale }] }]}>
      <Pressable
        onPressIn={() => animate(0.92)}
        onPressOut={() => animate(1)}
        onPress={() => onSelect(type)}
        style={[styles.button, active && styles.buttonActive]}
      >
        <Text style={styles.icon}>{preset.icon}</Text>
        <Text style={[styles.label, active && styles.labelActive]}>{preset.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function WeatherSwitcher({ weather, onSelect }: WeatherSwitcherProps) {
  return (
    <GlassPanel style={styles.panel}>
      <View style={styles.row}>
        {WEATHER_ORDER.map((type) => (
          <SwitcherButton key={type} type={type} active={weather === type} onSelect={onSelect} />
        ))}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 18,
    backgroundColor: theme.pillInactive,
  },
  buttonActive: {
    backgroundColor: theme.pillActive,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  labelActive: {
    color: theme.accentActive,
  },
});
