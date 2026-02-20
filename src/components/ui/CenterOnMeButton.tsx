import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OverlayButton } from './OverlayButton';

interface CenterOnMeButtonProps {
  onPress: () => void;
  isFollowingUser: boolean;
}

export function CenterOnMeButton({ onPress, isFollowingUser }: CenterOnMeButtonProps) {
  return (
    <OverlayButton
      onPress={onPress}
      size={56}
      accessibilityLabel="Center on my position"
      style={[styles.container, isFollowingUser && styles.dimmed]}
    >
      {/* Crosshair icon */}
      <View style={styles.crosshair}>
        <View style={styles.horizontalLine} />
        <View style={styles.verticalLine} />
        <View style={styles.outerCircle} />
        <View style={styles.centerDot} />
      </View>
    </OverlayButton>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    zIndex: 30,
  },
  dimmed: {
    opacity: 0.6,
  },
  crosshair: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalLine: {
    position: 'absolute',
    width: 24,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  verticalLine: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  outerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  centerDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
