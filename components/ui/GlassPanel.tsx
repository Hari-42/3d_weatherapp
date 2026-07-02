import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/colors';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

/**
 * A flat translucent panel standing in for a real blur. expo-blur's Android
 * BlurView (RenderScript-based on API <31) can crash with
 * "RSInvalidStateException: no Context active" when it tries to sample
 * content that includes a live GL surface — exactly what sits behind this
 * panel (the react-three-fiber Canvas). A solid tint avoids that risk.
 */
export default function GlassPanel({ children, style }: GlassPanelProps) {
  return <View style={[styles.wrapper, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    backgroundColor: theme.glass,
  },
});
