import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Route } from '../../types';

interface RoutesPillProps {
  activeRoute: Route | null;
  onOpenSheet: () => void;
  onClearRoute: () => void;
}

export function RoutesPill({ activeRoute, onOpenSheet, onClearRoute }: RoutesPillProps) {
  const insets = useSafeAreaInsets();

  if (activeRoute) {
    return (
      <View style={[styles.container, { bottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.pillActive}
          onPress={onOpenSheet}
          activeOpacity={0.8}
          accessibilityLabel={`Active route: ${activeRoute.name}. Tap to open routes.`}
        >
          {/* Hamburger icon */}
          <View style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>

          {/* Location pin icon */}
          <View style={styles.pinIcon}>
            <View style={styles.pinHead} />
            <View style={styles.pinPoint} />
          </View>

          {/* Trail name */}
          <Text style={styles.trailName} numberOfLines={1}>
            {activeRoute.name}
          </Text>

          {/* Vertical divider */}
          <View style={styles.divider} />

          {/* Close button */}
          <TouchableOpacity
            onPress={onClearRoute}
            style={styles.closeButton}
            accessibilityLabel="Clear active route"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.closeX}>
              <View style={[styles.closeLine, { transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.closeLine, { transform: [{ rotate: '-45deg' }] }]} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { bottom: 16 + insets.bottom }]}>
      <TouchableOpacity
        style={styles.pill}
        onPress={onOpenSheet}
        activeOpacity={0.8}
        accessibilityLabel="Open routes"
      >
        {/* Hamburger icon */}
        <View style={styles.hamburger}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </View>

        <Text style={styles.label}>Routes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  pillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    gap: 10,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  hamburger: {
    width: 16,
    height: 14,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 16,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pinIcon: {
    width: 12,
    height: 16,
    alignItems: 'center',
  },
  pinHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -2,
  },
  trailName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
});
