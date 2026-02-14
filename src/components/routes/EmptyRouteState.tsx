import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyRouteStateProps {
  onImportGPX: () => void;
}

export function EmptyRouteState({ onImportGPX }: EmptyRouteStateProps) {
  return (
    <View style={styles.container}>
      {/* Illustration circle with compass icon */}
      <View style={styles.illustration}>
        <View style={styles.compassIcon}>
          {/* Simplified compass needle */}
          <View style={styles.needleNorth} />
          <View style={styles.needleSouth} />
          <View style={styles.compassCenter} />
        </View>
      </View>

      <Text style={styles.title}>No routes yet</Text>
      <Text style={styles.subtitle}>Import a GPX file to start navigating</Text>

      <TouchableOpacity
        onPress={onImportGPX}
        style={styles.importButton}
        activeOpacity={0.7}
      >
        <Text style={styles.importButtonText}>Import GPX</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  illustration: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(129,199,132,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  compassIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleNorth: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4CAF50',
  },
  needleSouth: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#81C784',
  },
  compassCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A7267',
    marginBottom: 24,
    textAlign: 'center',
  },
  importButton: {
    backgroundColor: '#F57C00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
