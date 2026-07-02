import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Renders visible error text instead of a blank screen. Without this,
 * a crash in the 3D scene tree (or anywhere below) can leave the phone
 * showing nothing at all, with no clue what went wrong.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Something crashed</Text>
            <Text style={styles.message}>{this.state.error.message}</Text>
            <Text style={styles.stack}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0505',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingBottom: 40,
  },
  title: {
    color: '#ff8a8a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 16,
  },
  stack: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
