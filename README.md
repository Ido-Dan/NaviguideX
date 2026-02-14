# NaviguideX

Offroad 4x4 navigation app for Israel with offline map support and GPX route tracking.

## What It Does

- Displays Israel Hiking Map tiles with offline region downloads (MBTiles)
- Imports and renders GPX routes with waypoints on the map
- Real-time GPS tracking with compass heading
- North-up and heading-up map orientation modes
- Route management via bottom sheet interface

## Tech Stack

- **Framework**: React Native 0.84 (iOS only)
- **Language**: TypeScript
- **Map**: MapLibre GL Native (`@maplibre/maplibre-react-native`)
- **Navigation**: React Navigation (native stack)
- **UI**: `@gorhom/bottom-sheet`, Reanimated 3, Gesture Handler
- **Storage**: SQLite via `react-native-nitro-sqlite`
- **Location/Sensors**: Expo Location, Expo Sensors, Expo Keep Awake
- **File Handling**: `@react-native-documents/picker`, Expo File System
- **State**: React Context + useReducer

## Prerequisites

- Node.js >= 22.11.0
- Xcode (latest stable)
- CocoaPods (`gem install cocoapods` or via Bundler)

## Setup

```sh
git clone <repo-url> && cd naviguidex
npm install
cd ios && pod install && cd ..
```

## Running

```sh
npx react-native run-ios
```

Or open `ios/NaviguideX.xcworkspace` in Xcode and build from there.

## Project Structure

```
src/
  App.tsx                  # Entry point, providers, navigation stack
  screens/                 # MapScreen, SettingsScreen, SplashScreen
  components/
    map/                   # MapView, RouteOverlay, GPSMarker, WaypointMarkers, CompassOverlay
    routes/                # RouteBottomSheet, RouteCard, EmptyRouteState
    settings/              # MapDownloadSection, RegionCard
    ui/                    # CenterOnMeButton, ActiveRouteBar, OverlayButton
  services/                # gpxParser, locationService, compassService, tileService, fileImportService
  storage/                 # database, routeStorage, settingsStorage
  context/                 # AppProvider, NavigationProvider
  types/                   # Shared TypeScript interfaces
  constants/               # Region definitions, map config
  utils/                   # Geo calculations, formatters
docs/                      # architecture.md, design-spec.md
figma-export/              # Figma design mockups (web preview)
```

See `docs/architecture.md` for full technical details.

## Credits

Based on the original Naviguide offroad navigation software. Map tiles from [Israel Hiking Map](https://israelhiking.osm.org.il/) (OpenStreetMap contributors).
