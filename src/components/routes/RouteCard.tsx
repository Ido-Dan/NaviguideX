import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Route } from '../../types';

interface RouteCardProps {
  route: Route;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function RouteCard({ route, isActive, onSelect, onDelete }: RouteCardProps) {
  const formattedDistance =
    route.totalDistanceKm < 1
      ? `${(route.totalDistanceKm * 1000).toFixed(0)} m`
      : `${route.totalDistanceKm.toFixed(1)} km`;

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      style={[styles.card, isActive && styles.cardActive]}
    >
      {/* Active indicator bar */}
      {isActive && <View style={styles.activeIndicator} />}

      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {route.name}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formattedDistance}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{route.waypointCount} waypoints</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{route.importDate}</Text>
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={(e) => {
            onDelete();
          }}
          style={styles.deleteButton}
          accessibilityLabel="Delete route"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteIcon}>X</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#7A7267',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#7A7267',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(229,57,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '700',
  },
});
