import { pick } from '@react-native-documents/picker';
import * as FileSystem from 'expo-file-system';
import { parseGpx } from './gpxParser';
import { Route } from '../types';

/**
 * Open the document picker for .gpx files and parse the selected file.
 * Returns the parsed Route, or null if the user cancelled.
 */
export async function importGpxFile(): Promise<Route | null> {
  const [result] = await pick({
    type: ['public.xml', 'org.topografix.gpx'],
    copyTo: 'cachesDirectory',
  });

  if (!result || !result.fileCopyUri) {
    return null;
  }

  const fileUri = result.fileCopyUri;
  const fileName = result.name || 'unknown.gpx';

  const gpxContent = await FileSystem.readAsStringAsync(
    decodeURIComponent(fileUri),
    { encoding: FileSystem.EncodingType.UTF8 },
  );

  return parseGpx(gpxContent, fileName);
}
