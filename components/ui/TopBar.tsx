import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme, CITY_NAME } from '../../theme/colors';
import { WeatherPreset } from '../../types/weather';
import GlassPanel from './GlassPanel';

interface TopBarProps {
  preset: WeatherPreset;
}

export default function TopBar({ preset }: TopBarProps) {
  return (
    <GlassPanel style={styles.panel}>
      <View style={styles.row}>
        <View>
          <Text style={styles.city}>{CITY_NAME}</Text>
          <Text style={styles.weatherLabel}>
            {preset.icon} {preset.label}
          </Text>
        </View>
        <Text style={styles.temperature}>{Math.round(preset.temperature)}°</Text>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  city: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  weatherLabel: {
    color: theme.textSecondary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  temperature: {
    color: theme.textPrimary,
    fontSize: 40,
    fontWeight: '200',
  },
});
