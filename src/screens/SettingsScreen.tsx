import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';

const naviguideLogo = require('../assets/naviguide_no_background.png');
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MapRegion } from '../types';
import { useApp } from '../context/AppProvider';
import {
  getRegionsWithStatus,
  downloadRegion,
  deleteRegion,
} from '../services/tileService';
import { MapDownloadSection } from '../components/settings/MapDownloadSection';

type SettingsScreenNavProps = NativeStackScreenProps<
  { Map: undefined; Settings: undefined },
  'Settings'
>;

/**
 * Connected SettingsScreen — pulls settings from AppProvider,
 * wires region downloads to tileService.
 */
export function ConnectedSettingsScreen({
  navigation: screenNav,
}: SettingsScreenNavProps) {
  const { settings, updateSettings } = useApp();
  const [regions, setRegions] = useState<MapRegion[]>([]);

  // Load region status on mount
  useEffect(() => {
    try {
      setRegions(getRegionsWithStatus());
    } catch {
      // Database may not have map_regions yet on first load
    }
  }, []);

  const handleClose = useCallback(() => {
    screenNav.goBack();
  }, [screenNav]);

  const handleChangeUnits = useCallback(
    (units: 'metric' | 'imperial') => {
      updateSettings({ units });
    },
    [updateSettings],
  );

  const handleDownloadRegion = useCallback(
    async (regionId: string) => {
      // Update UI to show downloading state
      setRegions((prev) =>
        prev.map((r) =>
          r.id === regionId
            ? { ...r, status: 'downloading' as const, downloadProgress: 0 }
            : r,
        ),
      );

      try {
        await downloadRegion(regionId, (_id, progress) => {
          setRegions((prev) =>
            prev.map((r) =>
              r.id === regionId ? { ...r, downloadProgress: progress } : r,
            ),
          );
        });
        // Refresh status from database after download completes
        setRegions(getRegionsWithStatus());
      } catch (error: any) {
        Alert.alert(
          'Download Error',
          error.message || 'Failed to download region',
        );
        setRegions(getRegionsWithStatus());
      }
    },
    [],
  );

  const handleDeleteRegion = useCallback(async (regionId: string) => {
    try {
      await deleteRegion(regionId);
      setRegions(getRegionsWithStatus());
    } catch (error: any) {
      Alert.alert(
        'Delete Error',
        error.message || 'Failed to delete region',
      );
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.backButton}
          accessibilityLabel="Back to map"
        >
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Map Downloads */}
        <MapDownloadSection
          regions={regions}
          onDownloadRegion={handleDownloadRegion}
          onDeleteRegion={handleDeleteRegion}
        />

        {/* Units */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          <View style={styles.unitsRow}>
            <TouchableOpacity
              onPress={() => handleChangeUnits('metric')}
              style={[
                styles.unitButton,
                settings.units === 'metric' && styles.unitButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  settings.units === 'metric' && styles.unitButtonTextActive,
                ]}
              >
                Metric (km)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleChangeUnits('imperial')}
              style={[
                styles.unitButton,
                settings.units === 'imperial' && styles.unitButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  settings.units === 'imperial' && styles.unitButtonTextActive,
                ]}
              >
                Imperial (miles)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map Source</Text>
          <View style={styles.mapSourceBox}>
            <Text style={styles.mapSourceName}>Israel Hiking Map</Text>
            <Text style={styles.mapSourceDesc}>
              High-quality topographic maps of Israel
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.logoContainer}>
            <Image
              source={naviguideLogo}
              style={styles.aboutLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.aboutText}>
            <Text style={styles.aboutLabel}>Version: </Text>
            1.0.0 (MVP)
          </Text>
          <Text style={styles.aboutItalic}>
            Based on the original Naviguide software
          </Text>
          <Text style={styles.aboutText}>
            Carrying forward a legacy of offroad navigation
          </Text>

          <View style={styles.divider} />

          <Text style={styles.attributionText}>
            Map data:{' '}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL('https://israelhiking.osm.org.il')
              }
            >
              Israel Hiking Map
            </Text>
          </Text>
          <TouchableOpacity>
            <Text style={[styles.attributionText, styles.link]}>
              Open Source Licenses
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2B6E2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#2B6E2F',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  unitsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F5F3EF',
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A7267',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
  mapSourceBox: {
    backgroundColor: '#F5F3EF',
    padding: 16,
    borderRadius: 10,
  },
  mapSourceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  mapSourceDesc: {
    fontSize: 12,
    color: '#7A7267',
    marginTop: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutLogo: {
    width: 160,
    height: 64,
  },
  aboutText: {
    fontSize: 14,
    color: '#7A7267',
    textAlign: 'center',
    marginBottom: 4,
  },
  aboutLabel: {
    fontWeight: '600',
    color: '#2C2C2C',
  },
  aboutItalic: {
    fontSize: 14,
    color: '#7A7267',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  attributionText: {
    fontSize: 12,
    color: '#7A7267',
    textAlign: 'center',
    marginBottom: 4,
  },
  link: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});
