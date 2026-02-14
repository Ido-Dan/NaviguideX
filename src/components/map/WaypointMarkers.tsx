import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import type { Waypoint } from '../../types';

const MARKER_COLOR = '#FFB74D';
const TEXT_COLOR = '#2C2C2C';
const MARKER_SIZE = 28;

interface WaypointMarkersProps {
  waypoints: Waypoint[];
}

function WaypointMarkers({ waypoints }: WaypointMarkersProps) {
  if (waypoints.length === 0) {
    return null;
  }

  return (
    <>
      {waypoints.map((wp, index) => (
        <MapLibreGL.MarkerView
          key={`waypoint-${index}`}
          coordinate={[wp.lon, wp.lat]}
        >
          <View style={styles.marker}>
            <Text style={styles.markerText}>{index + 1}</Text>
          </View>
        </MapLibreGL.MarkerView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: MARKER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: TEXT_COLOR,
  },
  markerText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
});

export default WaypointMarkers;
