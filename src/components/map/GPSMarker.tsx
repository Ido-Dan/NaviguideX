import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface GPSMarkerProps {
  heading: number;
  orientationMode: 'north-up' | 'heading-up';
}

export function GPSMarker({ heading, orientationMode }: GPSMarkerProps) {
  const rotateAnim = useRef(new Animated.Value(heading)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate heading rotation
    const targetRotation = orientationMode === 'north-up' ? heading : 0;
    Animated.spring(rotateAnim, {
      toValue: targetRotation,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [heading, orientationMode, rotateAnim]);

  useEffect(() => {
    // Pulsing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Pulsing glow */}
      <Animated.View
        style={[styles.glow, { transform: [{ scale: pulseAnim }] }]}
      />

      {/* Heading arrow */}
      <Animated.View
        style={[styles.arrowWrapper, { transform: [{ rotate: rotation }] }]}
      >
        <View style={styles.arrow} />
      </Animated.View>

      {/* Center dot */}
      <View style={styles.centerDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(129,199,132,0.3)',
  },
  arrowWrapper: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2B6E2F',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
