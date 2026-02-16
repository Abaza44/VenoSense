# CLAUDE.md - VenoSense AI Assistant Guide

## Project Overview

VenoSense (also referred to as VeinoSense) is a medical technology prototype for AR-guided venipuncture. It provides real-time vein visualization using augmented reality, AI-powered needle recommendations, 3D patient digital twins, and a patient database with injection history tracking. The target domain is IV/venipuncture guidance for healthcare professionals.

## Tech Stack

- **Framework:** React 19 with JSX (no TypeScript in source files)
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **Styling:** TailwindCSS 4 with PostCSS and Autoprefixer
- **3D Graphics:** Three.js 0.182 via @react-three/fiber 9 and @react-three/drei 10
- **Computer Vision:** MediaPipe (Hands, Pose, Selfie Segmentation), OpenCV.js (loaded from CDN in `index.html`)
- **Backend:** Firebase (Firestore, Analytics) with firebase-admin for scripts
- **Icons:** lucide-react
- **Utilities:** clsx, tailwind-merge

## Quick Reference Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build (output to dist/)
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

There are no test commands configured. The project does not have a testing framework.

## Project Structure

```
src/
├── main.jsx                          # React entry point (StrictMode)
├── App.jsx                           # Router setup with 4 routes
├── App.css / index.css               # Global styles (Tailwind directives)
├── components/
│   └── DashboardLayout.jsx           # Sidebar + header layout wrapper
├── features/
│   ├── ar-overlay/                   # AR Vein Scanner feature
│   │   ├── AROverlayPage.jsx         # Main AR page container
│   │   ├── CameraFeed.jsx            # Camera + hand tracking integration
│   │   ├── VeinRenderer.js           # Canvas-based vein visualization
│   │   ├── VeinEnhancer.js           # OpenCV.js CLAHE enhancement
│   │   └── PoseSegmentationLayer.jsx # MediaPipe pose detection
│   ├── digital-twin/                 # Patient Digital Twin feature
│   │   ├── DigitalTwinPage.jsx       # Patient database page
│   │   ├── PatientList.jsx           # Patient selector sidebar
│   │   ├── ThreeDVeinViewer.jsx      # 3D arm/vein visualization
│   │   ├── VeinInjectionMap.jsx      # SVG injection history map
│   │   └── AddPatientModal.jsx       # Patient creation form
│   └── needle-recommender/           # AI Needle Recommender feature
│       ├── RecommenderPage.jsx       # Main recommender container
│       ├── InputForm.jsx             # Patient parameter input form
│       ├── RecommendationEngine.js   # Scoring algorithm (pure logic)
│       └── ResultCard.jsx            # Recommendation results display
├── pages/
│   └── Dashboard.jsx                 # Landing page with feature cards
├── services/
│   ├── HandTracker.js                # MediaPipe hands wrapper (singleton)
│   └── WatchDataService.js           # Simulated BLE watch data service
├── lib/
│   └── firebase.js                   # Firebase initialization and exports
├── utils/
│   └── security.js                   # National ID masking utility
├── data/
│   ├── veinData.js                   # Patient DB helpers + Firestore ops
│   └── generated_patients.json       # 312KB synthetic patient dataset
└── scripts/
    ├── generate_patients.js          # Patient data generation script
    └── firebase_sync.js              # Firestore batch sync utility
```

## Routes

| Path         | Component           | Description                    |
|--------------|---------------------|--------------------------------|
| `/`          | Dashboard           | Home with feature quick links  |
| `/ar`        | AROverlayPage       | AR vein scanner with camera    |
| `/recommend` | RecommenderPage     | AI needle recommendation       |
| `/patients`  | DigitalTwinPage     | Patient database + 3D viewer   |

All routes are wrapped in `DashboardLayout` which provides the sidebar navigation and top header.

## Architecture Patterns

### Feature-Based Organization
Each major feature lives in its own directory under `src/features/` with its page component, sub-components, and business logic co-located. This is the primary organizational pattern.

### Component Conventions
- **Pages** are suffixed with `Page` (e.g., `AROverlayPage.jsx`, `RecommenderPage.jsx`).
- **Layout** components live in `src/components/`.
- **Business logic** is separated into plain JS files (e.g., `RecommendationEngine.js`, `VeinRenderer.js`) rather than mixed into React components.
- Components use **functional components with hooks** exclusively. No class components.

### Services Layer
- `HandTracker.js` - Singleton pattern wrapping MediaPipe Hands, exported as `handTracker` instance.
- `WatchDataService.js` - Simulated BLE data with subscriber pattern (`subscribe()`, `pushData()`). Generates mock vein metrics for Cephalic, Basilic, and Median Cubital veins.

### Data Layer
- `veinData.js` acts as the data access layer, importing static JSON and providing helpers (`getPatientList()`, `getPatientData(id)`, `getInjectionHistory(id)`).
- Firestore integration via `addPatient()` and `subscribeToPatients()` for persistence.
- `generated_patients.json` contains synthetic Egyptian patient profiles with Arabic names, 14-digit national IDs, and detailed vein metrics.

### Canvas Rendering
The AR overlay uses a **three-layer canvas system**: video feed -> enhanced frame (OpenCV CLAHE) -> AR vein overlay. Rendering uses `requestAnimationFrame` loops in `VeinRenderer.js`.

### 3D Rendering
`ThreeDVeinViewer.jsx` uses React Three Fiber with:
- Cylindrical mesh for the arm (skin tone `#e0ac69`)
- `TubeGeometry` with `CatmullRomCurve3` for veins
- `OrbitControls` for interactive rotation/zoom

## Coding Conventions

### JavaScript Style
- **ES Modules** throughout (`"type": "module"` in package.json).
- JSX files use `.jsx` extension; plain logic files use `.js`.
- No TypeScript in source files (type packages are installed as devDependencies but unused).
- Arrow functions preferred for components and handlers.

### Styling
- **TailwindCSS utility classes** for all styling. No CSS modules or styled-components.
- `clsx` and `tailwind-merge` used for conditional/merged class names.
- Color palette follows a medical/professional theme with blue/indigo gradients.
- Responsive sidebar: `w-64` expanded, `w-20` collapsed.

### ESLint Configuration
- ESLint 9 flat config format (`eslint.config.js`).
- Extends: `@eslint/js` recommended, `react-hooks` recommended, `react-refresh`.
- `no-unused-vars` allows uppercase/underscore-prefixed variables (pattern `[A-Z_]`).
- Browser globals enabled, ES2020 ecma version.
- No Prettier configured.

### Naming Conventions
- **Components:** PascalCase (e.g., `DashboardLayout`, `ResultCard`).
- **Services/Utilities:** camelCase files (e.g., `handTracker`, `security`).
- **Constants:** UPPER_SNAKE_CASE (e.g., `PATIENT_DB`, `NEEDLE_SPECS`).
- **Data generators:** snake_case files (e.g., `generate_patients.js`, `firebase_sync.js`).

## Domain-Specific Knowledge

### Needle Gauge System
The recommendation engine uses standard IV needle gauges:
- **16G** (Gray, 1.65mm OD) - Large veins, >= 5.0mm diameter
- **18G** (Green, 1.27mm OD) - >= 3.5mm diameter
- **20G** (Pink, 0.91mm OD) - >= 2.5mm diameter
- **22G** (Blue, 0.72mm OD) - >= 1.5mm diameter
- **24G** (Yellow, 0.56mm OD) - < 1.5mm diameter

Adjustments are made for age (pediatric/geriatric downsizing), medical history (chemo/dehydration), and vein characteristics (rolling, fragility).

### Patient Data Model
Each patient record includes:
- Demographics: name, age, gender, blood type, condition
- National ID (Egyptian 14-digit format, masked in display)
- Medical orders array
- `veinData` object with 5 vein types (Cephalic, Basilic, Median Cubital, Accessory Cephalic, Dorsal Arch)
- Each vein has: segments, hotspots, summary metrics (depth, diameter, visibility)

### Vein Rendering
Veins are rendered as animated paths on a canvas overlay. Key modes:
- **AI Mode:** Veins anchored to MediaPipe hand landmarks in real-time
- **Manual Mode:** Static overlay on video frame
- **Scanning State:** Animated waiting indicator while searching for hand

## External Dependencies (CDN)

- **OpenCV.js 4.5.1** - Loaded in `index.html` via `<script>` tag. Available as `window.cv`.
- **MediaPipe models** - Downloaded at runtime from CDN by the MediaPipe SDK.

## Firebase Configuration

Firebase is initialized in `src/lib/firebase.js`. The config values are hardcoded in the source (this is a known security concern). The app uses:
- **Firestore** - Patient data persistence
- **Analytics** - Usage tracking

Scripts in `src/scripts/` use `firebase-admin` with a `serviceAccountKey.json` file (gitignored) for server-side operations like batch data sync.

## Known Considerations

- **No tests:** No testing framework is configured. When adding tests, Vitest is the natural choice given the Vite build system.
- **No CI/CD:** No automated pipelines exist.
- **No TypeScript:** Despite type packages being installed, all source code is plain JavaScript with JSX.
- **Hardcoded credentials:** Firebase config is committed to source. The `serviceAccountKey.json` is properly gitignored.
- **CDN dependencies:** OpenCV.js is loaded from a CDN `<script>` tag rather than bundled.
- **Simulated data:** The `WatchDataService` provides mock BLE data; there is no real hardware integration yet.
- **Placeholder project name:** `package.json` has `"name": "new-folder"`.

## Working With This Codebase

### Adding a New Feature
1. Create a new directory under `src/features/<feature-name>/`.
2. Add a page component (`<Feature>Page.jsx`) as the route entry point.
3. Add the route in `App.jsx` within the `DashboardLayout` wrapper.
4. Add a navigation item in `DashboardLayout.jsx` in the `navItems` array.
5. Co-locate sub-components and business logic in the feature directory.

### Adding a New Patient Data Field
1. Update the generation script in `src/scripts/generate_patients.js`.
2. Run `node src/scripts/generate_patients.js` to regenerate `generated_patients.json`.
3. Update helpers in `src/data/veinData.js` if the field needs accessor functions.
4. Sync to Firestore using `src/scripts/firebase_sync.js` if needed.

### Modifying the Recommendation Algorithm
The scoring logic is isolated in `src/features/needle-recommender/RecommendationEngine.js`. It is a pure JavaScript module with no React dependencies, making it straightforward to modify and test independently.
