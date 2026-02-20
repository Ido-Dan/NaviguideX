import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MapRegion } from '../../types';
import { RegionCard } from './RegionCard';

interface MapDownloadSectionProps {
  regions: MapRegion[];
  onDownloadRegion: (regionId: string) => void;
  onDeleteRegion: (regionId: string) => void;
  onCancelDownload?: (regionId: string) => void;
  networkAvailable?: boolean;
}

export function MapDownloadSection({
  regions,
  onDownloadRegion,
  onDeleteRegion,
  onCancelDownload,
  networkAvailable = true,
}: MapDownloadSectionProps) {
  const isDownloading = regions.some(
    r => r.status === 'downloading' || r.status === 'queued' || r.status === 'paused',
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Offline Maps</Text>
      <Text style={styles.subtitle}>
        Download map regions to use offline during trips
      </Text>

      {!networkAvailable && isDownloading && (
        <View style={styles.networkBanner}>
          <Text style={styles.networkBannerText}>
            No network — downloads paused
          </Text>
        </View>
      )}

      {regions.map((region) => (
        <RegionCard
          key={region.id}
          region={region}
          onDownload={() => onDownloadRegion(region.id)}
          onDelete={() => onDeleteRegion(region.id)}
          onCancel={onCancelDownload ? () => onCancelDownload(region.id) : undefined}
        />
      ))}

      <Text style={styles.wifiNote}>Download over WiFi recommended</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A7267',
    marginBottom: 16,
  },
  wifiNote: {
    fontSize: 12,
    color: '#7A7267',
    textAlign: 'center',
    marginTop: 8,
  },
  networkBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  networkBannerText: {
    fontSize: 13,
    color: '#E65100',
    textAlign: 'center',
    fontWeight: '500',
  },
});
