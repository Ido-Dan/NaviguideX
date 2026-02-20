import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface GPSMarkerProps {
  heading: number;
  orientationMode: 'north-up' | 'heading-up';
}

export const GPSMarker = React.memo(function GPSMarker({
  heading,
  orientationMode,
}: GPSMarkerProps) {
  const rotation = useSharedValue(heading);
  const pulse = useSharedValue(1);

  useEffect(() => {
    const targetRotation = orientationMode === 'north-up' ? heading : 0;
    rotation.value = withSpring(targetRotation, {
      damping: 10,
      stiffness: 60,
    });
  }, [heading, orientationMode, rotation]);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
    );
  }, [pulse]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.arrowWrapper, arrowStyle]}>
        <View style={styles.arrow} />
      </Animated.View>
      <View style={styles.centerDot} />
    </View>
  );
});

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
