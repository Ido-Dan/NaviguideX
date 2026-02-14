import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { OverlayButton } from '../ui/OverlayButton';

interface CompassOverlayProps {
  mode: 'north-up' | 'heading-up';
  heading: number;
  onToggle: () => void;
}

export function CompassOverlay({ mode, heading, onToggle }: CompassOverlayProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    // Animate compass rotation
    const targetRotation = mode === 'heading-up' ? -heading : 0;
    Animated.spring(rotateAnim, {
      toValue: targetRotation,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [mode, heading, rotateAnim]);

  useEffect(() => {
    // Show mode label briefly on toggle
    setShowLabel(true);
    Animated.sequence([
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(labelOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowLabel(false));
  }, [mode, labelOpacity]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      <OverlayButton
        onPress={onToggle}
        size={64}
        accessibilityLabel={`Toggle orientation mode (current: ${mode})`}
      >
        {/* Green gradient background */}
        <View style={styles.compassBg} />

        {/* Rotating compass rose */}
        <Animated.View
          style={[
            styles.roseContainer,
            { transform: [{ rotate: rotation }] },
          ]}
        >
          {/* North arrow (orange) */}
          <View style={styles.northArrow} />
          {/* South arrow (white) */}
          <View style={styles.southArrow} />

          {/* Cardinal letters */}
          <Text style={[styles.cardinalLetter, styles.north]}>N</Text>
          <Text style={[styles.cardinalLetter, styles.south, styles.dimLetter]}>S</Text>
          <Text style={[styles.cardinalLetter, styles.west, styles.dimLetter]}>W</Text>
          <Text style={[styles.cardinalLetter, styles.east, styles.dimLetter]}>E</Text>
        </Animated.View>

        {/* Center dot */}
        <View style={styles.centerDot} />
      </OverlayButton>

      {/* Mode label */}
      {showLabel && (
        <Animated.View style={[styles.labelContainer, { opacity: labelOpacity }]}>
          <Text style={styles.labelText}>
            {mode === 'north-up' ? 'North Up' : 'Heading Up'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 30,
    alignItems: 'center',
  },
  compassBg: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2B6E2F',
    opacity: 0.9,
  },
  roseContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  northArrow: {
    position: 'absolute',
    top: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F57C00',
  },
  southArrow: {
    position: 'absolute',
    bottom: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.7)',
  },
  cardinalLetter: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dimLetter: {
    opacity: 0.7,
  },
  north: {
    top: -1,
  },
  south: {
    bottom: -1,
  },
  west: {
    left: 2,
  },
  east: {
    right: 2,
  },
  centerDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  labelContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
