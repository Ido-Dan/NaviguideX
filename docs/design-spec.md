# NaviguideX — Design Specification (MVP)

> A modern mobile offroad 4x4 navigation app for iOS, built to carry forward the legacy of the original "Naviguide" software.

---

## 1. App Overview

NaviguideX helps offroad 4x4 drivers navigate pre-planned routes on topographic maps of Israel — fully offline, in areas with no cell signal. Users import GPX route files before a trip, download map regions over WiFi, and then navigate in the field using only GPS.

**Core principle: The map IS the app.** Every pixel of screen real estate is precious. The topographic map should dominate the experience with minimal UI chrome.

---

## 2. App Flow

```
App Launch
    ↓
Map Screen (full screen, GPS active)
    ├── Bottom sheet: Route List (default open on launch)
    │       ├── [Select a route] → Route loads on map, sheet collapses
    │       ├── [Import GPX] → iOS file picker → route added to list
    │       └── [Swipe down / tap map] → Sheet collapses, free exploration mode
    ├── Compass overlay (top-right) → Tap to toggle north-up / heading-up
    ├── Center-on-me button (bottom-right)
    └── Settings (gear icon, top-left) → Settings screen
```

**Key insight**: There is no separate "home screen." The map is always visible. The route list lives in a draggable bottom sheet overlay on top of the map. This means:
- On launch, the user immediately sees the map with their GPS position
- The bottom sheet with routes is open by default
- Selecting a route loads it on the map and collapses the sheet
- Pulling the sheet down or tapping the map dismisses it → free exploration mode
- The sheet can be pulled back up at any time to switch routes

---

## 3. Screens & Components

### 3.1 Map Screen (Main & Only Screen)

This is the app's single primary screen. Everything else is an overlay on top of it.

**Map layer:**
- Full-screen, edge-to-edge topographic map (Israel Hiking Map — contour lines, trails, elevation shading)
- Extends behind the status bar and any overlays
- Supports pinch-to-zoom and drag-to-pan
- Two orientation modes:
  - **North-up** (default): Map stays fixed, north always at top
  - **Heading-up**: Map rotates so the user's direction of travel is always "up"

**GPS position indicator:**
- Large, clearly visible marker at user's current position
- Shows heading direction (arrow/chevron shape pointing in direction of movement)
- Should be visible at a glance while driving — high contrast against the topo map
- Subtle pulsing or glow effect to distinguish from static map elements
- Blue color recommended (universal "you are here" convention)

**Route overlay (when a route is loaded):**
- Route drawn as a bold line on the map
- Color: bright orange or red — must contrast strongly against the green/brown topo map
- Line width: ~4px, slightly wider than trail markings on the topo map
- Waypoints along the route shown as numbered markers/pins
- Route should be visible at all zoom levels

**Compass overlay (top-right):**
- Small compass rose/indicator
- In north-up mode: shows a static compass with N at top
- In heading-up mode: the compass rotates to always show where north is relative to the screen
- Tap to toggle between north-up and heading-up modes
- Semi-transparent background so it doesn't fully obscure the map
- Visual feedback on mode change (brief animation or label flash: "North Up" / "Heading Up")

**Center-on-me button (bottom-right):**
- Floating action button with a crosshair/target icon
- Tapping re-centers the map on the user's current GPS position
- Semi-transparent when the map is already centered; becomes fully opaque when the user has panned away
- Position it above the bottom sheet's collapsed handle

**Settings button (top-left):**
- Small gear icon, semi-transparent
- Opens the Settings screen as a modal/push navigation

**Active route info (bottom, above collapsed sheet):**
- When a route is loaded and the bottom sheet is collapsed, show a minimal info bar:
  - Route name
  - Small "X" to unload the route
- Thin, semi-transparent strip — should not obstruct the map significantly

---

### 3.2 Route List Bottom Sheet

A draggable bottom sheet overlay on the map screen.

**States:**
1. **Expanded (default on launch)**: Takes up ~60-70% of screen height. Shows full route list.
2. **Half-expanded**: Shows ~3 route cards, user can scroll within.
3. **Collapsed**: Only a small handle/pill visible at the bottom. The map is fully visible.

**Content when expanded:**

**Header area:**
- "Your Routes" title
- Import button: "Import GPX" with a file/plus icon — opens iOS document picker filtered for `.gpx` files

**Route list:**
- Scrollable list of imported routes
- Each route card shows:
  - Route name (parsed from GPX file name or internal metadata)
  - Total distance (e.g., "23.4 km")
  - Waypoint count (e.g., "12 waypoints")
  - Date imported (e.g., "Feb 12, 2026")
- Tap a route → loads on map, sheet collapses to show the route
- Swipe left on a route → reveals "Delete" action (red)

**Empty state (no routes imported yet):**
- Friendly illustration (compass, jeep, or trail)
- Text: "No routes yet"
- Subtext: "Import a GPX file to start navigating"
- Prominent "Import GPX" button

**Interaction details:**
- Drag handle (pill shape) at the top of the sheet for pull up/down
- Tapping the map area above the sheet collapses it
- When a route is selected (highlighted), the route card shows a subtle "active" indicator (left border accent or checkmark)

---

### 3.3 Settings Screen

Opened from the gear icon on the map screen. Can be a modal sheet or full-screen push.

**Sections:**

**1. Map Downloads**
- Header: "Offline Maps"
- Subtext: "Download map regions to use offline during trips"
- Region list (below or overlaid on the mini-map):
  - **North** (Golan, Galilee, Carmel) — size estimate, status
  - **Center** (Sharon, Judean Hills, Tel Aviv area) — size estimate, status
  - **South / Negev** (Negev desert, Arava, Eilat) — size estimate, status
- Each region shows:
  - Name
  - Estimated download size (e.g., "~800 MB")
  - Status badge: "Not Downloaded" / "Downloading 45%" / "Downloaded"
  - Action: "Download" button or "Delete" option for downloaded regions
- Progress bar shown during active download
- Note: "Download over WiFi recommended"

**2. Units**
- Toggle: Metric (km) / Imperial (miles)

**3. Map Source**
- Currently: "Israel Hiking Map" (the only option for MVP)
- Designed as a selector/picker for future extensibility (more map sources later)

**4. About**
- App version
- "Based on Naviguide by [Name]" — tribute to the original
- "Map data: Israel Hiking Map (israelhiking.osm.org.il)" — attribution
- Link to open source licenses

---

## 4. Design Guidelines

### 4.1 Color Palette

Derived from the original NaviGuide logo — a green compass with bold green "Navi" and warm orange "Guide". The green+orange pairing is the brand's DNA and should carry through the entire app.

**Brand reference**: See `/assets/naviguide-logo.png` for the original logo.

#### Brand Colors (from original logo)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **NaviGuide Green (dark)** | Deep forest green | `#2B6E2F` | Primary brand color — headers, compass frame, active states, selected route indicator |
| **NaviGuide Green (mid)** | Vibrant green | `#4CAF50` | Compass fill, GPS position indicator, download complete status |
| **NaviGuide Green (light)** | Light green | `#81C784` | Subtle backgrounds, secondary highlights, compass glow |
| **NaviGuide Orange** | Warm bold orange | `#F57C00` | Route line on map, CTAs ("Import GPX"), accent buttons, active navigation elements |
| **NaviGuide Orange (light)** | Soft orange | `#FFB74D` | Hover/pressed states, secondary orange accents, waypoint markers |

#### UI Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Background** | Warm off-white | `#F5F3EF` | Bottom sheet, settings screen background |
| **Surface** | White | `#FFFFFF` | Route cards, input fields |
| **Text primary** | Dark charcoal | `#2C2C2C` | Route names, headers, body text |
| **Text secondary** | Warm gray | `#7A7267` | Metadata, timestamps, descriptions |
| **Danger/delete** | Red | `#E53935` | Delete actions, error states |
| **Overlay background** | Black @ 40% | `rgba(0,0,0,0.4)` | Map overlay buttons (compass, center-on-me) |

#### Map-Specific Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Route line** | NaviGuide Orange | `#F57C00` | Bold route overlay on map — pops against green/brown topo |
| **GPS indicator** | NaviGuide Green (mid) | `#4CAF50` | Position marker — ties to brand instead of generic blue. Uses the green from the original compass. |
| **GPS indicator glow** | NaviGuide Green (light) @ 30% | `rgba(129,199,132,0.3)` | Subtle pulsing glow around GPS position |
| **Waypoint markers** | NaviGuide Orange (light) | `#FFB74D` | Numbered pins along route, with dark text for number |
| **Compass rose** | NaviGuide Green gradient | `#2B6E2F` → `#4CAF50` | Compass overlay — mirrors the glassy green from original logo |
| **Compass north arrow** | NaviGuide Orange | `#F57C00` | North-pointing arrow on compass — orange stands out against green |

#### Color Rationale
- **Green GPS indicator instead of blue**: The original NaviGuide used a green compass as its core identity. Using green for "you are here" ties the GPS marker to the brand and feels distinctive. The green also contrasts well against the topo map (which has softer greens in terrain shading, not the bold green we're using).
- **Orange route line**: Orange is the second brand color and contrasts strongly against both the green terrain and the green GPS marker, creating a clear visual hierarchy: green = you, orange = your path.
- **Green + orange compass**: The compass overlay directly echoes the original logo — green body with an orange north indicator.

**Note**: The topographic map itself is colorful (greens, browns, blues for water, orange/red for elevation). All overlay elements must have sufficient contrast against this busy background. Use shadows, subtle borders, or semi-transparent dark backgrounds behind overlay elements.

### 4.2 Typography

- **Primary font**: System font (SF Pro on iOS) — optimized for readability
- **Route name**: 16-17pt, semibold
- **Metadata**: 13-14pt, regular, secondary color
- **Navigation overlays**: Must be readable at arm's length while driving — use bold weights and larger sizes for any in-navigation text
- **Hebrew support**: The app should support Hebrew text (route names may be in Hebrew). Ensure RTL layout compatibility for text elements.

### 4.3 Iconography

Keep icons simple and universally recognizable:
- **Compass**: Compass rose (N/S/E/W or simplified arrow)
- **GPS/center**: Crosshair or target circle
- **Import**: Document with "+" or download arrow
- **Settings**: Gear
- **Delete**: Trash can (on swipe)
- **Waypoint markers**: Numbered circles or teardrop pins
- **Route loaded indicator**: Small colored dot or checkmark

### 4.4 Overlay Design Principles

All floating UI elements on the map should follow these rules:
1. **Semi-transparent backgrounds** — don't fully block the map
2. **Rounded corners** — modern, friendly feel
3. **Subtle shadow** — lift elements off the map visually
4. **Minimum size 44x44pt** — iOS touch target minimum, especially important for use while driving
5. **Consistent positioning** — don't move elements between states; users build muscle memory

### 4.5 Motion & Transitions

- **Bottom sheet**: Smooth spring animation when expanding/collapsing
- **Map orientation toggle**: Smooth rotation animation when switching between north-up and heading-up
- **Route loading**: Route line draws/animates onto the map (optional, nice touch)
- **GPS indicator**: Smooth position interpolation (don't jump between GPS fixes)

---

## 5. State Diagram

```
[App Launch]
    │
    ▼
[Map Screen + Route Sheet Expanded]
    │
    ├── User taps route → [Map Screen + Route Loaded + Sheet Collapsed]
    │                           │
    │                           ├── User taps "X" on route bar → [Map Screen + No Route + Sheet Collapsed]
    │                           ├── User pulls up sheet → [Map Screen + Route Loaded + Sheet Expanded] (can switch route)
    │                           └── User taps compass → toggles orientation mode
    │
    ├── User swipes sheet down → [Map Screen + No Route + Sheet Collapsed] (free exploration)
    │                           │
    │                           └── User pulls up sheet → [Map Screen + Route Sheet Expanded]
    │
    ├── User taps import → [iOS File Picker] → route added to list
    │
    └── User taps gear → [Settings Screen]
                           │
                           ├── Map Downloads → download/manage regions
                           ├── Units toggle
                           └── Back → [Map Screen]
```

---

## 6. Key Considerations for Designer

1. **Driving context**: Users interact with this app while driving offroad. All touch targets must be large. Information must be glanceable. No fine motor skills required.

2. **Sunlight readability**: Offroad trips are outdoors in bright sun. Ensure good contrast ratios. Consider how the topo map looks in bright sunlight.

3. **One-hand operation**: Users may hold the phone in one hand while driving with the other. Place critical controls (center-on-me, compass) within thumb reach.

4. **Dirty/gloved hands**: Offroaders may have dirty or gloved hands. Large touch targets, no precise gestures.

5. **The map is everything**: Every design decision should maximize map visibility. When in doubt, make the UI element smaller or more transparent.

6. **Emotional design**: This app carries sentimental value as a revival of the user's father's software. The design should feel warm, trustworthy, and crafted with care — not cold and corporate. Think "field companion" not "tech product."

---

## 7. Assets Needed from Designer

- [ ] Figma screens for all states described above
- [ ] App icon (1024x1024, with smaller sizes)
- [ ] Splash/launch screen
- [ ] Compass rose design (north-up and heading-up variants)
- [ ] GPS position indicator design (with heading arrow)
- [ ] Waypoint marker design (numbered)
- [ ] Empty state illustration (for no routes)
- [ ] Region map illustration for settings (North/Center/South Israel)
- [ ] Icon set: gear, import, delete, center-on-me, route active indicator
