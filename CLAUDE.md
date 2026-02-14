# NaviguideX - Project Guidelines

## What This Is
An offroad 4x4 navigation app for iOS, built with React Native + TypeScript. Revival of the original "Naviguide" software.

## Architecture
- **Read before coding**: `docs/architecture.md` (tech stack, data models, project structure, implementation phases)
- **Design reference**: `docs/design-spec.md` (screens, colors, typography, interaction patterns)
- **Figma export**: `figma-export/` (web-based UI mockups to translate into React Native)

## Rules for All Agents

### Stay Simple
- Do NOT over-engineer. Write the minimum code needed for the task.
- No unnecessary abstractions, helpers, or utilities for one-time operations.
- No extra error handling for scenarios that can't happen.
- If something takes more than 3 attempts, stop and ask the lead.

### Security
- Avoid using depracated packages as much as possible
- When packages have known bugs or vulnerabilities, search for newer updated versions

### No Loops
- If a command fails, diagnose the error before retrying.
- Never retry the same failing command more than twice.
- If blocked (permissions, missing tools, dependency errors), message the lead immediately instead of trying workarounds.

### Follow the Architecture
- Use the project structure from `docs/architecture.md` section 4. Do not invent new directories or patterns.
- Use the tech stack as specified. Do not substitute libraries.
- Use the data models from `docs/architecture.md` section 3 exactly.
- Use the color palette from `docs/design-spec.md` section 4.1. Do not make up colors.

### Follow the UI
- The Figma export in `figma-export/src/app/components/` is the source of truth for visual design.
- Translate to React Native `StyleSheet` — do not use Tailwind/NativeWind.
- Match the layout, spacing, and colors from the Figma export closely.

### File Ownership
- Only edit files within your assigned task scope.
- Do not modify files owned by another teammate.
- If you need a type or interface from another module, import from `src/types/index.ts`.

### Communication
- If unclear on requirements, ask the lead. Do not guess.
- When done with your task, mark it completed and message the lead with a summary of what you built.

## Tech Stack (Do Not Change)
- React Native 0.83 (iOS only)
- TypeScript
- @maplibre/maplibre-react-native
- @gorhom/bottom-sheet
- react-native-nitro-sqlite (replaces deprecated react-native-quick-sqlite)
- @react-native-documents/picker (replaces deprecated react-native-document-picker)
- expo-location, expo-sensors, expo-file-system, expo-keep-awake
- react-native-reanimated v3, react-native-gesture-handler
- React Context + useReducer (no Redux)

## Key Paths
- `src/screens/` — MapScreen, SettingsScreen
- `src/components/` — map/, routes/, settings/, ui/
- `src/services/` — gpxParser, locationService, compassService, tileService, fileImportService
- `src/storage/` — database, routeStorage, settingsStorage
- `src/context/` — AppProvider, NavigationProvider
- `src/types/index.ts` — all shared TypeScript interfaces
- `src/constants/` — regions, mapConfig
- `src/utils/` — geo, formatters
