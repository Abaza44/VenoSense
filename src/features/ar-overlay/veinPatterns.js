/**
 * Predefined vein patterns for the AR overlay.
 * Coordinates are relative (0–1), scaled to canvas size at render time.
 * These approximate real forearm vein anatomy.
 */

export const VEIN_PATTERNS = {
  cephalic: {
    name: 'Cephalic Vein',
    depth: 2.8,
    diameter: 3.1,
    stability: 85,
    color: '#00e5ff',
    // Path points: from wrist (bottom) to elbow (top)
    path: [
      { x: 0.62, y: 0.95 },
      { x: 0.60, y: 0.85 },
      { x: 0.58, y: 0.72 },
      { x: 0.55, y: 0.58 },
      { x: 0.52, y: 0.45 },
      { x: 0.50, y: 0.32 },
      { x: 0.47, y: 0.20 },
      { x: 0.45, y: 0.08 },
    ],
    hotspot: { x: 0.53, y: 0.45 },
  },
  basilic: {
    name: 'Basilic Vein',
    depth: 3.6,
    diameter: 2.5,
    stability: 76,
    color: '#00bcd4',
    path: [
      { x: 0.38, y: 0.95 },
      { x: 0.39, y: 0.85 },
      { x: 0.40, y: 0.72 },
      { x: 0.42, y: 0.58 },
      { x: 0.44, y: 0.45 },
      { x: 0.45, y: 0.32 },
      { x: 0.47, y: 0.20 },
      { x: 0.48, y: 0.08 },
    ],
    hotspot: { x: 0.43, y: 0.50 },
  },
  medianCubital: {
    name: 'Median Cubital Vein',
    depth: 2.2,
    diameter: 4.0,
    stability: 89,
    color: '#26c6da',
    // Connects cephalic to basilic diagonally
    path: [
      { x: 0.55, y: 0.38 },
      { x: 0.52, y: 0.35 },
      { x: 0.49, y: 0.33 },
      { x: 0.46, y: 0.35 },
      { x: 0.44, y: 0.38 },
    ],
    hotspot: { x: 0.49, y: 0.34 },
  },
};

/**
 * Get all vein keys
 */
export function getVeinKeys() {
  return Object.keys(VEIN_PATTERNS);
}

/**
 * Get vein data by key
 */
export function getVein(key) {
  return VEIN_PATTERNS[key] || null;
}
