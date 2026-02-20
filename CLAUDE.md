# NaviguideX - Project Guidelines

## What This Is
An offroad 4x4 navigation app for iOS, built with React Native + TypeScript. Revival of the original "Naviguide" software.

## Architecture
- **Read before coding**: `docs/architecture.md` (tech stack, data models, project structure, implementation phases)
- **Design reference**: `docs/design-spec.md` (screens, colors, typography, interaction patterns)
- **Figma export**: `figma-export/` (web-based UI mockups to translate into React Native)

## Superpowers
- Always apply and use superpowers skills when available. If there's even a 1% chance a skill applies, invoke it before acting.
- Use the `Skill` tool to invoke skills. Check for relevant skills before starting any task.
- After completing major implementation steps, use the `code-reviewer` agent to review work.

## Rules for All Agents

### Stay Simple
- Do NOT over-engineer. Write the minimum code needed for the task.
- No unnecessary abstractions, helpers, or utilities for one-time operations.
- No extra error handling for scenarios that can't happen.
- If something takes more than 3 attempts, stop and ask the lead.

### Security
- Avoid using deprecated packages as much as possible
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

### Non-Blocking Leader
- The leader (main conversation) must NEVER block on long-running work.
- ALL planning, implementation, and debugging must be delegated to subagents.
- The leader stays available for user interaction, testing, and coordination at all times.
- Use dedicated agents for: codebase exploration, writing plans, implementing features, debugging issues.

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
- @react-native-community/netinfo
- expo-location, expo-sensors, expo-file-system, expo-keep-awake
- react-native-reanimated v3, react-native-gesture-handler
- React Context + useReducer (no Redux)

## Commands
```bash
# Simulator
npx react-native run-ios --simulator="iPhone 17"

# Physical device (Ido's iPhone, must be connected + signed in Xcode)
npx react-native run-ios --udid 00008140-00025C913C39801C

# Clean rebuild
rm -rf node_modules ios/Pods ios/Podfile.lock ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/NaviguideX-*
npm install && cd ios && pod install --repo-update
```

## Environment
- Xcode 26.2+, iOS 26.2+ (simulator and device)
- Node >= 22.11.0
- Two `patch-package` patches in `patches/` — do not delete

## Key Paths
- `src/screens/` — MapScreen, SettingsScreen
- `src/components/` — map/, routes/, settings/, ui/
- `src/services/` — gpxParser, locationService, compassService, tileService, fileImportService, downloadManager
- `src/storage/` — database, routeStorage, settingsStorage
- `src/context/` — AppProvider, NavigationProvider, DownloadProvider
- `src/types/index.ts` — all shared TypeScript interfaces
- `src/constants/` — regions, mapConfig
- `src/utils/` — geo, formatters

## Gotchas
- `@react-native-documents/picker` throws on user cancel — always catch
- `babel.config.js` must include `react-native-reanimated/plugin` as last plugin
- Database migrations run via version check in `settings` table (`_db_version` key)
- `figma-export/` fails TypeScript check — it's a web export, not part of the RN build
