/* ─── NEEDLE SPECIFICATIONS ──────────────────────────────── */
export const NEEDLE_SPECS = {
  '16G': { gauge: 16, outerDiameterMm: 1.65, typicalUse: 'Rapid fluid/blood transfusion', color: '#9ca3af', colorName: 'Gray', flowRate: 'Very High' },
  '18G': { gauge: 18, outerDiameterMm: 1.27, typicalUse: 'Blood transfusion, CT contrast', color: '#22c55e', colorName: 'Green', flowRate: 'High' },
  '20G': { gauge: 20, outerDiameterMm: 0.91, typicalUse: 'General IV access, most medications', color: '#ec4899', colorName: 'Pink', flowRate: 'Moderate' },
  '22G': { gauge: 22, outerDiameterMm: 0.72, typicalUse: 'Pediatric, fragile veins, routine meds', color: '#3b82f6', colorName: 'Blue', flowRate: 'Low' },
  '24G': { gauge: 24, outerDiameterMm: 0.56, typicalUse: 'Neonatal, very small/fragile veins', color: '#eab308', colorName: 'Yellow', flowRate: 'Very Low' },
};

export const GAUGE_ORDER = ['16G', '18G', '20G', '22G', '24G'];

/* ─── AGE GROUPS ─────────────────────────────────────────── */
export const AGE_GROUPS = [
  { value: 'pediatric', label: 'Pediatric (0–17)', icon: '👶' },
  { value: 'adult', label: 'Adult (18–64)', icon: '🧑' },
  { value: 'geriatric', label: 'Geriatric (65+)', icon: '🧓' },
];

/* ─── PATIENT HISTORY OPTIONS ────────────────────────────── */
export const PATIENT_HISTORY_OPTIONS = [
  { value: 'none', label: 'No significant history' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'chemotherapy', label: 'Chemotherapy' },
  { value: 'obesity', label: 'Obesity' },
  { value: 'dehydration', label: 'Dehydration' },
];

/* ─── CONFIDENCE THRESHOLDS ──────────────────────────────── */
export const CONFIDENCE_LEVELS = {
  HIGH: { min: 85, label: 'HIGH', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
  MODERATE: { min: 65, label: 'MODERATE', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)' },
  LOW: { min: 0, label: 'LOW', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

/* ─── INPUT RANGES ───────────────────────────────────────── */
export const INPUT_RANGES = {
  veinDepth: { min: 0.5, max: 15, step: 0.1, unit: 'mm', label: 'Vein Depth' },
  veinDiameter: { min: 0.3, max: 8, step: 0.1, unit: 'mm', label: 'Vein Diameter' },
  stabilityIndex: { min: 0, max: 100, step: 1, unit: '/100', label: 'Stability Index' },
};

/* ─── SEVERITY LEVELS ────────────────────────────────────── */
export const SEVERITY = {
  critical: { label: 'CRITICAL', color: '#ef4444', icon: '🔴' },
  warning: { label: 'WARNING', color: '#eab308', icon: '🟡' },
  info: { label: 'INFO', color: '#00e5ff', icon: '🔵' },
  success: { label: 'OK', color: '#22c55e', icon: '🟢' },
};

/* ─── VEIN NAMES ─────────────────────────────────────────── */
export const VEIN_NAMES = [
  'Cephalic Vein',
  'Basilic Vein',
  'Median Cubital Vein',
  'Dorsal Venous Network',
  'Accessory Cephalic Vein',
];

/* ─── APP META ───────────────────────────────────────────── */
export const APP_NAME = 'VeinoTronic';
export const APP_VERSION = '2.0';
export const APP_TAGLINE = 'AI-Powered Vein Visualization Platform';
