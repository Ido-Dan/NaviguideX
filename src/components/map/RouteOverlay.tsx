import React from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';
import type { TrackPoint } from '../../types';

const ROUTE_COLOR = '#F57C00';
const ROUTE_WIDTH = 4;

interface RouteOverlayProps {
  trackPoints: TrackPoint[];
  onPress?: () => void;
}

function RouteOverlay({ trackPoints, onPress }: RouteOverlayProps) {
  if (trackPoints.length < 2) {
    return null;
  }

  const coordinates = trackPoints.map((pt) => [pt.lon, pt.lat]);

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };

  return (
    <MapLibreGL.ShapeSource id="routeSource" shape={routeGeoJSON} onPress={onPress}>
      <MapLibreGL.LineLayer
        id="routeLine"
        style={{
          lineColor: ROUTE_COLOR,
          lineWidth: ROUTE_WIDTH,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </MapLibreGL.ShapeSource>
  );
}

export default RouteOverlay;
