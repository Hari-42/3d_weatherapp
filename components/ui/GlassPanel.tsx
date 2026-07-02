import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/colors';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

/**
 * A fully transparent panel with only an outline — the 3D scene shows straight
 * through it. (A real blur via expo-blur is avoided: its Android BlurView can
 * crash sampling the live GL surface behind this panel.)
 */
export default function GlassPanel({ children, style }: GlassPanelProps) {
  return <View style={[styles.wrapper, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.glassBorder,
    backgroundColor: 'transparent',
  },
});
