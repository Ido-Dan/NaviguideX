import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(10)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const attributionOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle animation (delayed)
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(subtitleY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Loading dots (delayed)
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Attribution (delayed)
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(attributionOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-complete after 2.5 seconds
    const timeout = setTimeout(onComplete, 2500);
    return () => clearTimeout(timeout);
  }, [
    logoScale,
    logoOpacity,
    subtitleY,
    subtitleOpacity,
    dotOpacity,
    attributionOpacity,
    onComplete,
  ]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        {/* Compass symbol */}
        <View style={styles.compassRing}>
          <View style={styles.compassNorth} />
          <View style={styles.compassSouth} />
          <View style={styles.compassDot} />
        </View>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View
        style={[
          styles.subtitleContainer,
          {
            transform: [{ translateY: subtitleY }],
            opacity: subtitleOpacity,
          },
        ]}
      >
        <Text style={styles.appName}>NaviguideX</Text>
        <Text style={styles.tagline}>Offroad Navigation for Israel</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsContainer, { opacity: dotOpacity }]}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>

      {/* Attribution */}
      <Animated.Text style={[styles.attribution, { opacity: attributionOpacity }]}>
        Carrying forward a legacy of offroad navigation
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },
  logoContainer: {
    marginBottom: 24,
  },
  compassRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#81C784',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassNorth: {
    position: 'absolute',
    top: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2B6E2F',
  },
  compassSouth: {
    position: 'absolute',
    bottom: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#81C784',
  },
  compassDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F57C00',
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2B6E2F',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 15,
    color: '#5F7F61',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#81C784',
  },
  attribution: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
