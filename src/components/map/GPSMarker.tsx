import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface GPSMarkerProps {
  heading: number;
  orientationMode: 'north-up' | 'heading-up';
}

export const GPSMarker = React.memo(function GPSMarker({
  heading,
  orientationMode,
}: GPSMarkerProps) {
  const rotation = useRef(new Animated.Value(heading)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetRotation = orientationMode === 'north-up' ? heading : 0;
    Animated.spring(rotation, {
      toValue: targetRotation,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [heading, orientationMode, rotation]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const rotateInterpolation = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.glow, { transform: [{ scale: pulse }] }]} />
      <Animated.View style={[styles.arrowWrapper, { transform: [{ rotate: rotateInterpolation }] }]}>
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
