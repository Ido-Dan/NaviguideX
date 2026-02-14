import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';

const naviguideLogo = require('../assets/naviguide_no_background.png');

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
        <Image
          source={naviguideLogo}
          style={styles.logo}
          resizeMode="contain"
        />
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
  logo: {
    width: 180,
    height: 140,
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
