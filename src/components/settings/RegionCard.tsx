import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { MapRegion } from '../../types';

interface RegionCardProps {
  region: MapRegion;
  onDownload: () => void;
  onDelete: () => void;
  onCancel?: () => void;
}

export function RegionCard({ region, onDownload, onDelete, onCancel }: RegionCardProps) {
  const sizeLabel = region.fileSizeBytes >= 1_000_000_000
    ? `~${(region.fileSizeBytes / 1_000_000_000).toFixed(1)} GB`
    : `~${Math.round(region.fileSizeBytes / 1_000_000)} MB`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.info}>
          <Text style={styles.name}>{region.name}</Text>
        </View>
        <View style={styles.sizeRow}>
          <Text style={styles.sizeText}>{sizeLabel}</Text>
          {region.status === 'downloaded' && (
            <View style={styles.checkBadge}>
              <Text style={styles.checkMark}>&#10003;</Text>
            </View>
          )}
        </View>
      </View>

      {/* Download button */}
      {region.status === 'not_downloaded' && (
        <TouchableOpacity
          onPress={onDownload}
          style={styles.downloadButton}
          activeOpacity={0.7}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      )}

      {/* Queued state */}
      {region.status === 'queued' && (
        <View style={styles.progressContainer}>
          <Text style={styles.queuedLabel}>Queued...</Text>
          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Downloading progress */}
      {region.status === 'downloading' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Downloading...</Text>
            <Text style={styles.progressLabel}>{region.downloadProgress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${region.downloadProgress}%` },
              ]}
            />
          </View>
          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Paused state */}
      {region.status === 'paused' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.pausedLabel}>Paused</Text>
            <Text style={styles.progressLabel}>{region.downloadProgress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFillPaused,
                { width: `${region.downloadProgress}%` },
              ]}
            />
          </View>
          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Delete button */}
      {region.status === 'downloaded' && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F3EF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeText: {
    fontSize: 12,
    color: '#7A7267',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  downloadButton: {
    marginTop: 8,
    backgroundColor: '#F57C00',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: 'rgba(229,57,53,0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: 'rgba(229,57,53,0.1)',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#7A7267',
  },
  queuedLabel: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
    marginBottom: 4,
  },
  pausedLabel: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressFillPaused: {
    height: '100%',
    backgroundColor: '#F57C00',
    borderRadius: 4,
  },
});
