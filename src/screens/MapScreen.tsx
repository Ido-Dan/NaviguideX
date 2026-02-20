import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import MapLibreGL, { type CameraRef } from '@maplibre/maplibre-react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Route } from '../types';
import { useApp } from '../context/AppProvider';
import { useNavigation } from '../context/NavigationProvider';
import { importGpxFile } from '../services/fileImportService';
import { getRegionsWithStatus } from '../services/tileService';
import MapView from '../components/map/MapView';
import RouteOverlay from '../components/map/RouteOverlay';
import WaypointMarkers from '../components/map/WaypointMarkers';
import { GPSMarker } from '../components/map/GPSMarker';
import { CompassOverlay } from '../components/map/CompassOverlay';
import { CenterOnMeButton } from '../components/ui/CenterOnMeButton';
import { ActiveRouteBar } from '../components/ui/ActiveRouteBar';
import { OverlayButton } from '../components/ui/OverlayButton';
import { RouteBottomSheet } from '../components/routes/RouteBottomSheet';

type MapScreenNavProps = NativeStackScreenProps<{ Map: undefined; Settings: undefined }, 'Map'>;

/**
 * Connected MapScreen — pulls data from AppProvider and NavigationProvider contexts,
 * wires it to the presentational components.
 */
export function ConnectedMapScreen({ navigation: screenNav }: MapScreenNavProps) {
  const { routes, addRoute, removeRoute } = useApp();
  const {
    activeRoute,
    userPosition,
    mapOrientation,
    isFollowingUser,
    setActiveRoute,
    toggleOrientation,
    setFollowingUser,
    startGpsTracking,
    stopGpsTracking,
  } = useNavigation();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [sheetIndex, setSheetIndex] = useState(2); // Start expanded per design spec

  // Start GPS tracking on mount
  useEffect(() => {
    startGpsTracking().catch(() => {
      // Permission denied or error — GPS won't work, but app still usable
    });
    return () => {
      stopGpsTracking();
    };
  }, [startGpsTracking, stopGpsTracking]);

  // Keep screen awake when a route is active
  useEffect(() => {
    if (activeRoute) {
      activateKeepAwakeAsync('active-route');
    } else {
      deactivateKeepAwake('active-route');
    }
    return () => {
      deactivateKeepAwake('active-route');
    };
  }, [activeRoute]);

  // Get offline regions for MapView
  const offlineRegions = useRef(getRegionsWithStatus()).current;

  // Handlers
  const handleRouteSelect = useCallback(
    (route: Route) => {
      setActiveRoute(route);
      bottomSheetRef.current?.snapToIndex(0);
    },
    [setActiveRoute],
  );

  const handleRouteDelete = useCallback(
    (routeId: string) => {
      if (activeRoute?.id === routeId) {
        setActiveRoute(null);
      }
      removeRoute(routeId);
    },
    [activeRoute, removeRoute, setActiveRoute],
  );

  const handleClearRoute = useCallback(() => {
    setActiveRoute(null);
  }, [setActiveRoute]);

  const handleImportGPX = useCallback(async () => {
    try {
      const route = await importGpxFile();
      if (route) {
        addRoute(route);
      }
    } catch (error: any) {
      Alert.alert('Import Error', error.message || 'Failed to import GPX file');
    }
  }, [addRoute]);

  const handleCenterOnMe = useCallback(() => {
    if (userPosition) {
      cameraRef.current?.setCamera({
        centerCoordinate: [userPosition.lon, userPosition.lat],
        animationDuration: 500,
      });
      setFollowingUser(true);
    }
  }, [userPosition, setFollowingUser]);

  const handleOpenSettings = useCallback(() => {
    screenNav.navigate('Settings');
  }, [screenNav]);

  const handleSheetChange = useCallback(
    (index: number) => {
      setSheetIndex(index);
    },
    [],
  );

  const handleRegionDidChange = useCallback((feature: GeoJSON.Feature) => {
    // Only stop following when the user physically pans/zooms the map
    if (feature.properties?.isUserInteraction) {
      setFollowingUser(false);
    }
  }, [setFollowingUser]);

  // Compute values for map
  const heading = userPosition?.heading ?? 0;
  const mapBearing = mapOrientation === 'heading-up' ? heading : 0;
  const centerCoordinate: [number, number] | undefined =
    isFollowingUser && userPosition
      ? [userPosition.lon, userPosition.lat]
      : undefined;

  // Memoize marker coordinate so it only changes when lat/lon actually change,
  // not on every compass heading update
  const markerCoordinate = useMemo(
    () => userPosition ? [userPosition.lon, userPosition.lat] as [number, number] : undefined,
    [userPosition?.lon, userPosition?.lat],
  );

  return (
    <View style={styles.container}>
      {/* Full-screen MapLibre map */}
      <MapView
        cameraRef={cameraRef}
        bearing={mapBearing}
        centerCoordinate={centerCoordinate}
        offlineRegions={offlineRegions}
        onRegionDidChange={handleRegionDidChange}
      >
        {/* Route line overlay */}
        {activeRoute && activeRoute.trackPoints.length >= 2 && (
          <RouteOverlay trackPoints={activeRoute.trackPoints} />
        )}

        {/* Waypoint markers */}
        {activeRoute && activeRoute.waypoints.length > 0 && (
          <WaypointMarkers waypoints={activeRoute.waypoints} />
        )}

        {/* GPS position marker */}
        {markerCoordinate && (
          <MapLibreGL.MarkerView
            coordinate={markerCoordinate}
          >
            <GPSMarker
              heading={heading}
              orientationMode={mapOrientation}
            />
          </MapLibreGL.MarkerView>
        )}
      </MapView>

      {/* Settings button (top-left) */}
      <OverlayButton
        onPress={handleOpenSettings}
        size={44}
        accessibilityLabel="Settings"
        style={styles.settingsButton}
      >
        <View style={styles.gearIcon}>
          <View style={styles.gearCenter} />
          <View style={[styles.gearTooth, { transform: [{ rotate: '0deg' }] }]} />
          <View style={[styles.gearTooth, { transform: [{ rotate: '60deg' }] }]} />
          <View style={[styles.gearTooth, { transform: [{ rotate: '120deg' }] }]} />
        </View>
      </OverlayButton>

      {/* Compass overlay (top-right) */}
      <CompassOverlay
        mode={mapOrientation}
        heading={heading}
        onToggle={toggleOrientation}
      />

      {/* Center-on-me button (bottom-right) */}
      <CenterOnMeButton
        onPress={handleCenterOnMe}
        isFollowingUser={isFollowingUser}
      />

      {/* Active route bar (shown when route loaded and sheet collapsed) */}
      {activeRoute && sheetIndex === 0 && (
        <ActiveRouteBar
          route={activeRoute}
          onClearRoute={handleClearRoute}
        />
      )}

      {/* Route bottom sheet */}
      <RouteBottomSheet
        routes={routes}
        activeRoute={activeRoute}
        onRouteSelect={handleRouteSelect}
        onRouteDelete={handleRouteDelete}
        onImportGPX={handleImportGPX}
        sheetRef={bottomSheetRef}
        onChange={handleSheetChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8FB893',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 30,
  },
  gearIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gearTooth: {
    position: 'absolute',
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
});
