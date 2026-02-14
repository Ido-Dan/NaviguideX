import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Route } from '../../types';

interface ActiveRouteBarProps {
  route: Route;
  onClearRoute: () => void;
}

export function ActiveRouteBar({ route, onClearRoute }: ActiveRouteBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Route icon - small triangle */}
        <View style={styles.routeIcon} />
        <Text style={styles.routeName} numberOfLines={1}>
          {route.name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onClearRoute}
        style={styles.closeButton}
        accessibilityLabel="Clear route"
      >
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  routeIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F57C00',
  },
  routeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
