import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { Route } from '../../types';
import { RouteCard } from './RouteCard';
import { EmptyRouteState } from './EmptyRouteState';

interface RouteBottomSheetProps {
  routes: Route[];
  activeRoute: Route | null;
  onRouteSelect: (route: Route) => void;
  onRouteDelete: (routeId: string) => void;
  onImportGPX: () => void;
  onClose?: () => void;
  sheetRef?: React.RefObject<BottomSheet | null>;
  onChange?: (index: number) => void;
}

export function RouteBottomSheet({
  routes,
  activeRoute,
  onRouteSelect,
  onRouteDelete,
  onImportGPX,
  onClose,
  sheetRef,
  onChange,
}: RouteBottomSheetProps) {
  const internalRef = useRef<BottomSheet>(null);
  const bottomSheetRef = sheetRef ?? internalRef;
  const snapPoints = useMemo(() => ['58%'], []);

  const handleRouteSelect = useCallback(
    (route: Route) => {
      onRouteSelect(route);
      bottomSheetRef.current?.close();
    },
    [onRouteSelect, bottomSheetRef],
  );

  const handleChange = useCallback(
    (index: number) => {
      onChange?.(index);
      if (index === -1) {
        onClose?.();
      }
    },
    [onChange, onClose],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      onChange={handleChange}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Routes</Text>
          <TouchableOpacity
            onPress={onImportGPX}
            style={styles.importButton}
            activeOpacity={0.7}
          >
            {/* Upload icon */}
            <View style={styles.uploadIcon}>
              <View style={styles.uploadArrow} />
              <View style={styles.uploadBase} />
            </View>
            <Text style={styles.importButtonText}>Import GPX</Text>
          </TouchableOpacity>
        </View>

        {/* Route list or empty state */}
        {routes.length === 0 ? (
          <EmptyRouteState onImportGPX={onImportGPX} />
        ) : (
          routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isActive={activeRoute?.id === route.id}
              onSelect={() => handleRouteSelect(route)}
              onDelete={() => onRouteDelete(route.id)}
            />
          ))
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#F5F3EF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    backgroundColor: 'rgba(122,114,103,0.3)',
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  importButton: {
    backgroundColor: '#F57C00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadIcon: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  uploadArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  uploadBase: {
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    marginTop: 2,
  },
});
