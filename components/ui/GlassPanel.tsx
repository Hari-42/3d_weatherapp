import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/colors';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
}

export default function GlassPanel({ children, style, intensity = 40 }: GlassPanelProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.glass,
  },
});
