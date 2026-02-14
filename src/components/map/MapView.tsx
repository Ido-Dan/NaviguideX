import React, { useRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import type { MapRegion } from '../../types';

const ISRAEL_CENTER: [number, number] = [34.8, 31.5]; // [lon, lat]
const DEFAULT_ZOOM = 9;
const MIN_ZOOM = 7;
const MAX_ZOOM = 16;
const TILE_SIZE = 512;

const ONLINE_TILE_URL =
  'https://israelhiking.osm.org.il/Tiles/{z}/{x}/{y}.png';

interface MapViewProps {
  bearing?: number;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  offlineRegions?: MapRegion[];
  children?: React.ReactNode;
  onRegionDidChange?: (feature: GeoJSON.Feature) => void;
}

function MapView({
  bearing = 0,
  centerCoordinate = ISRAEL_CENTER,
  zoomLevel = DEFAULT_ZOOM,
  offlineRegions,
  children,
  onRegionDidChange,
}: MapViewProps) {
  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  const activeOfflineRegion = offlineRegions?.find(
    (r) => r.status === 'downloaded' && r.localFilePath,
  );

  const handleRegionDidChange = useCallback(
    (feature: GeoJSON.Feature) => {
      onRegionDidChange?.(feature);
    },
    [onRegionDidChange],
  );

  return (
    <MapLibreGL.MapView
      ref={mapRef}
      style={styles.map}
      logoEnabled={false}
      attributionEnabled={false}
      onRegionDidChange={handleRegionDidChange}
    >
      <MapLibreGL.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate,
          zoomLevel,
        }}
        heading={bearing}
        minZoomLevel={MIN_ZOOM}
        maxZoomLevel={MAX_ZOOM}
        animationDuration={300}
      />

      {activeOfflineRegion?.localFilePath ? (
        <MapLibreGL.RasterSource
          id="israelHikingOffline"
          tileUrlTemplates={[
            `mbtiles:///${activeOfflineRegion.localFilePath}`,
          ]}
          tileSize={TILE_SIZE}
          minZoomLevel={MIN_ZOOM}
          maxZoomLevel={MAX_ZOOM}
        >
          <MapLibreGL.RasterLayer
            id="hikingTilesOffline"
            sourceID="israelHikingOffline"
          />
        </MapLibreGL.RasterSource>
      ) : (
        <MapLibreGL.RasterSource
          id="israelHikingOnline"
          tileUrlTemplates={[ONLINE_TILE_URL]}
          tileSize={TILE_SIZE}
          minZoomLevel={MIN_ZOOM}
          maxZoomLevel={MAX_ZOOM}
        >
          <MapLibreGL.RasterLayer
            id="hikingTilesOnline"
            sourceID="israelHikingOnline"
          />
        </MapLibreGL.RasterSource>
      )}

      {children}
    </MapLibreGL.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapView;
