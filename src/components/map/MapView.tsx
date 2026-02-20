import React, { useRef, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapLibreGL, { type CameraRef } from '@maplibre/maplibre-react-native';
import type { MapRegion } from '../../types';
import { getTilesDir } from '../../services/tileService';

const ISRAEL_CENTER: [number, number] = [34.8, 31.5]; // [lon, lat]
const DEFAULT_ZOOM = 9;
const MIN_ZOOM = 7;
const MAX_ZOOM = 16;
const TILE_SIZE = 256;

const ONLINE_TILE_URL =
  'https://israelhiking.osm.org.il/Tiles/{z}/{x}/{y}.png';

// Minimal MapLibre style that loads without network access.
// Without this, the default style URL is unreachable when offline,
// the style never loads, and all raster sources are silently dropped.
const OFFLINE_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f8f4f0' },
    },
  ],
};

interface MapViewProps {
  bearing?: number;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  offlineRegions?: MapRegion[];
  networkAvailable?: boolean;
  children?: React.ReactNode;
  onRegionDidChange?: (feature: GeoJSON.Feature) => void;
  cameraRef?: React.RefObject<CameraRef | null>;
}

function MapView({
  bearing = 0,
  centerCoordinate,
  zoomLevel = DEFAULT_ZOOM,
  offlineRegions,
  networkAvailable = true,
  children,
  onRegionDidChange,
  cameraRef: externalCameraRef,
}: MapViewProps) {
  const mapRef = useRef(null);
  const internalCameraRef = useRef<CameraRef>(null);
  const cameraRef = externalCameraRef ?? internalCameraRef;

  const downloadedRegions = useMemo(
    () => offlineRegions?.filter((r) => r.status === 'downloaded' && r.localFilePath) ?? [],
    [offlineRegions],
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
      mapStyle={OFFLINE_STYLE}
      logoEnabled={false}
      attributionEnabled={false}
      onRegionDidChange={handleRegionDidChange}
    >
      <MapLibreGL.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: ISRAEL_CENTER,
          zoomLevel: DEFAULT_ZOOM,
        }}
        {...(centerCoordinate ? { centerCoordinate } : {})}
        heading={bearing}
        minZoomLevel={MIN_ZOOM}
        maxZoomLevel={MAX_ZOOM}
        animationDuration={300}
      />

      {/* Online tiles as fallback for areas not downloaded */}
      {networkAvailable && (
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

      {/* Overlay downloaded region tiles on top (they take priority when available) */}
      {downloadedRegions.map((region) => (
        <MapLibreGL.RasterSource
          key={region.id}
          id={`offline-${region.id}`}
          tileUrlTemplates={[
            `${getTilesDir()}${region.id}/{z}/{x}/{y}.png`,
          ]}
          tileSize={TILE_SIZE}
          minZoomLevel={MIN_ZOOM}
          maxZoomLevel={MAX_ZOOM}
        >
          <MapLibreGL.RasterLayer
            id={`offlineLayer-${region.id}`}
            sourceID={`offline-${region.id}`}
          />
        </MapLibreGL.RasterSource>
      ))}

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
