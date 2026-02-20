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
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {route.name}
          </Text>

          {/* Row 1: distance + waypoints */}
          <View style={styles.metaRow}>
            {/* Triangle / distance icon */}
            <View style={styles.metaItem}>
              <View style={styles.triangleIcon} />
              <Text style={styles.metaText}>{formattedDistance}</Text>
            </View>

            {/* Pin / waypoints icon */}
            <View style={styles.metaItem}>
              <View style={styles.waypointIcon}>
                <View style={styles.waypointHead} />
                <View style={styles.waypointPoint} />
              </View>
              <Text style={styles.metaText}>{route.waypointCount} waypoints</Text>
            </View>
          </View>

          {/* Row 2: date */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={styles.calendarIcon}>
                <View style={styles.calendarTop} />
                <View style={styles.calendarBody} />
              </View>
              <Text style={styles.metaText}>{route.importDate}</Text>
            </View>
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={() => onDelete()}
          style={styles.deleteButton}
          accessibilityLabel="Delete route"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {/* Trash icon */}
          <View style={styles.trashIcon}>
            <View style={styles.trashLid} />
            <View style={styles.trashBody}>
              <View style={styles.trashLine} />
              <View style={styles.trashLine} />
            </View>
          </View>
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
    backgroundColor: 'rgba(245,124,0,0.06)',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#7A7267',
  },
  // Triangle icon for distance
  triangleIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#7A7267',
  },
  // Waypoint pin icon
  waypointIcon: {
    width: 10,
    height: 14,
    alignItems: 'center',
  },
  waypointHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7A7267',
  },
  waypointPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7A7267',
    marginTop: -1,
  },
  // Calendar icon
  calendarIcon: {
    width: 12,
    height: 13,
  },
  calendarTop: {
    width: 12,
    height: 3,
    backgroundColor: '#7A7267',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calendarBody: {
    width: 12,
    height: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#7A7267',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  // Delete button
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(229,57,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Trash icon
  trashIcon: {
    width: 14,
    height: 16,
    alignItems: 'center',
  },
  trashLid: {
    width: 14,
    height: 2,
    backgroundColor: '#E53935',
    borderRadius: 1,
  },
  trashBody: {
    width: 10,
    height: 12,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#E53935',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 2,
  },
  trashLine: {
    width: 1.5,
    height: 6,
    backgroundColor: '#E53935',
    borderRadius: 1,
  },
});
