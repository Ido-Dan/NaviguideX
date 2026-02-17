import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import * as FileSystem from 'expo-file-system/legacy';
import { parseGpx } from './gpxParser';
import { Route } from '../types';

/**
 * Open the document picker for .gpx files and parse the selected file.
 * Returns the parsed Route, or null if the user cancelled.
 */
export async function importGpxFile(): Promise<Route | null> {
  let result;
  try {
    [result] = await pick({
      type: ['public.xml', 'public.data'],
    });
  } catch (err: unknown) {
    // User cancelled the picker
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw err;
  }

  if (!result || !result.uri) {
    return null;
  }

  const fileUri = result.uri;
  const fileName = result.name || 'unknown.gpx';

  const gpxContent = await FileSystem.readAsStringAsync(
    decodeURIComponent(fileUri),
    { encoding: FileSystem.EncodingType.UTF8 },
  );

  return parseGpx(gpxContent, fileName);
}
