# NaviguideX — Technical Architecture (MVP)

---

## 1. Tech Stack

| Component | Choice | Reason |
|---|---|---|
| **Framework** | React Native (iOS only) | Cross-platform foundation for future Android |
| **Map engine** | `@maplibre/maplibre-react-native` | Open source, native MBTiles support (`mbtiles:///` protocol), RasterSource for custom tiles, built-in OfflineManager |
| **Map tiles** | Israel Hiking Map raster tiles | Open source Israeli topo map with trails. Tile server: `israelhiking.osm.org.il/Tiles/{z}/{x}/{y}.png`, zoom levels 7-16, 512x512 PNG |
| **GPX parsing** | `gpxparser` or lightweight custom parser | Parse GPX XML into track points, waypoints, metadata |
| **Navigation** | React Navigation (stack + bottom sheet) | Standard RN navigation. Bottom sheet via `@gorhom/bottom-sheet` |
| **State management** | React Context + useReducer | Simple enough for MVP scope — no Redux overhead |
| **Local storage** | SQLite via `react-native-quick-sqlite` or `expo-sqlite` | Route data, settings, and map region metadata |
| **File import** | `react-native-document-picker` | iOS document picker for GPX file selection |
| **GPS** | `expo-location` or `@react-native-community/geolocation` | Real-time GPS position with foreground tracking |
| **Compass/heading** | `expo-sensors` (Magnetometer) or `react-native-sensors` | Device heading for compass and heading-up mode |
| **Bottom sheet** | `@gorhom/bottom-sheet` | Performant, gesture-driven bottom sheet component |

---

## 2. Offline Map Strategy

### Approach: Region-Based MBTiles Downloads

**MBTiles** is a SQLite-based format for storing map tiles. MapLibre natively supports loading tiles from local MBTiles files using the `mbtiles:///` URL protocol.

### Regions
Israel is divided into 3 downloadable regions:

| Region | Area | Estimated Size |
|--------|------|----------------|
| **North** | Golan Heights, Galilee, Carmel, Jezreel Valley | ~800MB - 1.2GB |
| **Center** | Sharon, Judean Hills, Jerusalem, coastal plain | ~600MB - 1GB |
| **South / Negev** | Negev desert, Arava valley, Eilat | ~800MB - 1.2GB |

### Tile Pipeline (Pre-work / Build-time)
We need to create MBTiles files per region. Two options:

**Option A: Download from Israel Hiking tile server**
- Script to download tiles for a bounding box at zoom levels 7-16
- Package into MBTiles format per region
- Host the .mbtiles files on a CDN/server for in-app download

**Option B: Convert existing OruxMaps DB**
- We have an OruxMaps SQLite DB with all Israel tiles (schema: `tiles(x, y, z, image)`)
- Write a conversion script to split tiles by region bounding box into MBTiles format
- Host resulting files for download

**Recommendation**: Option A is cleaner (fresh tiles, standard format), but Option B is faster for initial development.

### In-App Flow
1. User opens Settings → Map Downloads
2. Selects a region to download
3. App downloads .mbtiles file from our server
4. File saved to app's Documents directory
5. MapLibre loads tiles via `mbtiles:///path/to/region.mbtiles`
6. Multiple regions can be downloaded — MapLibre composites them

### MapLibre Configuration
```jsx
// When offline tiles are available:
<MapLibreGL.RasterSource
  id="israelHikingOffline"
  tileUrlTemplates={["mbtiles:///" + regionFilePath]}
  tileSize={512}
  minZoomLevel={7}
  maxZoomLevel={16}
>
  <MapLibreGL.RasterLayer id="hikingTiles" sourceID="israelHikingOffline" />
</MapLibreGL.RasterSource>

// Fallback to online:
<MapLibreGL.RasterSource
  id="israelHikingOnline"
  tileUrlTemplates={["https://israelhiking.osm.org.il/Tiles/{z}/{x}/{y}.png"]}
  tileSize={512}
  minZoomLevel={7}
  maxZoomLevel={16}
>
  <MapLibreGL.RasterLayer id="hikingTiles" sourceID="israelHikingOnline" />
</MapLibreGL.RasterSource>
```

---

## 3. Data Model

### Route
```typescript
interface Route {
  id: string;                  // UUID
  name: string;                // From GPX metadata or filename
  fileName: string;            // Original GPX filename
  importDate: string;          // ISO date string
  totalDistanceKm: number;     // Calculated from track points
  waypointCount: number;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  gpxRaw: string;              // Raw GPX XML for re-parsing if needed
  trackPoints: TrackPoint[];
  waypoints: Waypoint[];
}

interface TrackPoint {
  lat: number;
  lon: number;
  ele?: number;                // Elevation in meters
  time?: string;               // ISO timestamp (if present in GPX)
}

interface Waypoint {
  lat: number;
  lon: number;
  ele?: number;
  name?: string;
  description?: string;
}
```

### Map Region
```typescript
interface MapRegion {
  id: string;                          // 'north' | 'center' | 'south'
  name: string;                        // Display name
  boundingBox: BoundingBox;
  zoomRange: { min: number; max: number };
  downloadUrl: string;                 // URL to .mbtiles file on our server
  localFilePath?: string;              // Path on device after download
  fileSizeBytes: number;               // Expected file size
  status: 'not_downloaded' | 'downloading' | 'downloaded';
  downloadProgress: number;            // 0-100
}
```

### Settings
```typescript
interface AppSettings {
  mapSource: 'israel-hiking';          // Extensible for future sources
  units: 'metric' | 'imperial';
  mapOrientation: 'north-up' | 'heading-up';
  lastMapCenter?: { lat: number; lon: number };
  lastMapZoom?: number;
}
```

### Navigation State
```typescript
interface NavigationState {
  activeRoute: Route | null;           // Currently loaded route (null = free exploration)
  userPosition: {
    lat: number;
    lon: number;
    accuracy: number;
    heading: number;                   // Degrees from north
    speed?: number;
  } | null;
  mapOrientation: 'north-up' | 'heading-up';
  isFollowingUser: boolean;            // Auto-center on GPS position
}
```

---

## 4. Project Structure

```
naviguidex/
├── docs/
│   ├── design-spec.md            # Design specification (for designer)
│   └── architecture.md           # This file
├── src/
│   ├── App.tsx                   # App entry point, providers
│   ├── screens/
│   │   ├── MapScreen.tsx         # Main screen: map + overlays + bottom sheet
│   │   └── SettingsScreen.tsx    # Settings modal
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.tsx       # MapLibre map wrapper with tile source config
│   │   │   ├── RouteOverlay.tsx  # GPX route line drawn on map
│   │   │   ├── GPSMarker.tsx     # Current position indicator with heading
│   │   │   ├── WaypointMarkers.tsx  # Numbered waypoint pins
│   │   │   └── CompassOverlay.tsx   # Compass rose with orientation toggle
│   │   ├── routes/
│   │   │   ├── RouteBottomSheet.tsx  # Bottom sheet with route list
│   │   │   ├── RouteCard.tsx         # Individual route list item
│   │   │   └── EmptyRouteState.tsx   # "No routes" illustration
│   │   ├── settings/
│   │   │   ├── MapDownloadSection.tsx  # Region download manager
│   │   │   └── RegionCard.tsx          # Individual region download status
│   │   └── ui/
│   │       ├── CenterOnMeButton.tsx    # FAB to re-center map
│   │       ├── ActiveRouteBar.tsx      # Minimal route info when sheet collapsed
│   │       └── OverlayButton.tsx       # Reusable semi-transparent map button
│   ├── services/
│   │   ├── gpxParser.ts          # GPX XML → Route data
│   │   ├── locationService.ts    # GPS tracking start/stop/subscribe
│   │   ├── compassService.ts     # Heading from magnetometer
│   │   ├── tileService.ts        # Offline tile region management
│   │   └── fileImportService.ts  # Document picker + file reading
│   ├── storage/
│   │   ├── database.ts           # SQLite initialization and migrations
│   │   ├── routeStorage.ts       # CRUD operations for routes
│   │   └── settingsStorage.ts    # Read/write app settings
│   ├── context/
│   │   ├── AppProvider.tsx       # Global app state (settings, routes list)
│   │   └── NavigationProvider.tsx # Active navigation state (GPS, active route)
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces
│   ├── constants/
│   │   ├── regions.ts            # Map region definitions (bounds, URLs)
│   │   └── mapConfig.ts          # Tile server URLs, default zoom, etc.
│   └── utils/
│       ├── geo.ts                # Haversine distance, bearing calculations
│       └── formatters.ts         # Distance formatting (km/mi), dates
├── assets/
│   └── images/                   # App icon, compass rose SVG, etc.
├── ios/
├── scripts/
│   └── generate-mbtiles.ts       # Build script: create region MBTiles from tile server
├── app.json
├── package.json
└── tsconfig.json
```

---

## 5. Key Technical Challenges

### 5.1 Offline Tile Compositing
When multiple regions are downloaded, MapLibre needs to load tiles from multiple MBTiles files. Options:
- **Preferred**: Merge downloaded regions into a single MBTiles file on-device
- **Alternative**: Layer multiple RasterSources (one per region) — may have performance implications
- **Simplest for MVP**: Treat each region's MBTiles independently. If user has downloaded "North" and "Center", show tiles from whichever region covers the current viewport.

### 5.2 GPS Battery Optimization
Continuous GPS tracking drains battery. Strategies:
- Use "foreground only" location permission (no background tracking needed for MVP)
- Set appropriate GPS accuracy (best accuracy for offroad, but with reasonable update interval ~1-2 seconds)
- Keep screen awake during navigation (`react-native-keep-awake`)

### 5.3 Map Rotation (Heading-Up Mode)
MapLibre supports map bearing/rotation natively. The challenge is smooth rotation:
- Subscribe to compass/heading updates
- Apply heading as map bearing with interpolation to avoid jerky rotation
- Low-pass filter on heading values to smooth out magnetometer noise

### 5.4 Large File Downloads
Region MBTiles files are 500MB-1.2GB. Need robust download handling:
- Resume support for interrupted downloads
- Download progress tracking
- WiFi-only enforcement option
- Storage space check before download

### 5.5 GPX Parsing Edge Cases
GPX files can vary in structure:
- Some have tracks (`<trk>`) with segments (`<trkseg>`)
- Some have routes (`<rte>`) with route points (`<rtept>`)
- Some have both plus waypoints (`<wpt>`)
- Need to handle all common GPX variants

---

## 6. Implementation Phases

### Phase 1: Foundation
- Initialize React Native project with TypeScript
- Set up MapLibre with Israel Hiking Map tiles (online mode)
- Basic app structure with MapScreen and SettingsScreen
- Display map centered on Israel

### Phase 2: Route Management
- Implement GPX file import via iOS document picker
- Parse GPX into route data model
- Store routes in SQLite
- Route list in bottom sheet
- Render selected route as a polyline on the map
- Waypoint markers

### Phase 3: GPS & Compass
- Real-time GPS position tracking
- GPS position marker with heading arrow on map
- Compass overlay with north indicator
- North-up / heading-up orientation toggle
- Center-on-me button
- Keep screen awake during active use

### Phase 4: Offline Maps
- Create MBTiles generation pipeline (script)
- Host region MBTiles files
- Region download UI in Settings
- Switch MapLibre to local MBTiles when available
- Graceful fallback to online tiles

### Phase 5: Polish & Ship
- Empty states, error handling, loading states
- App icon and splash screen
- iOS permissions flow (location)
- Performance profiling and optimization
- TestFlight distribution

---

## 7. External Dependencies

| Package | Purpose | Notes |
|---------|---------|-------|
| `@maplibre/maplibre-react-native` | Map rendering | Core map engine |
| `@react-navigation/native` | Screen navigation | Stack navigator for settings modal |
| `@gorhom/bottom-sheet` | Route list bottom sheet | Gesture-driven, performant |
| `react-native-document-picker` | GPX file import | iOS document picker |
| `react-native-quick-sqlite` | Local database | Route and settings storage |
| `react-native-keep-awake` | Prevent screen sleep | During navigation |
| `expo-location` or `react-native-geolocation-service` | GPS | Location tracking |
| `expo-sensors` or `react-native-sensors` | Compass | Magnetometer heading |
| `react-native-fs` or `expo-file-system` | File system access | MBTiles file management |
| `react-native-reanimated` | Animations | Bottom sheet and map transitions |
| `react-native-gesture-handler` | Gestures | Required by bottom sheet and navigation |
