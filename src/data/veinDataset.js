/**
 * ═══════════════════════════════════════════════════════════════
 * DELIVERABLE 1 — COMPLETE VEIN DATASET
 * ═══════════════════════════════════════════════════════════════
 *
 * Comprehensive dummy vein dataset for the VeinoTronic AR overlay.
 * All coordinates are RELATIVE (0–1). Multiply by canvas width/height at render time.
 *
 * Each vein contains:
 *   - Anatomical path with smooth Bezier-friendly control points
 *   - Per-segment measurement data (depth, diameter vary along the vein)
 *   - Branching sub-veins for realism
 *   - Hotspot (best puncture site) with scoring
 *   - Device confidence simulation
 *
 * Based on real forearm venous anatomy:
 *   - Cephalic runs laterally (thumb side)
 *   - Basilic runs medially (pinky side)
 *   - Median Cubital bridges them at the antecubital fossa (elbow crease)
 *   - Accessory Cephalic branches off the cephalic
 *   - Dorsal venous arch feeds into both from the hand/wrist
 */

// ─── MASTER VEIN DATASET ────────────────────────────────────

export const VEIN_DATASET = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CEPHALIC VEIN — Primary lateral vein (thumb-side)
  // Best for: General IV access, most common target
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cephalic: {
    id: 'cephalic',
    name: 'Cephalic Vein',
    anatomicalRegion: 'lateral forearm',
    clinicalNotes: 'Most accessible superficial vein. Preferred for routine IV access.',
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.35)',
    lineWidth: 3.5,

    // Main path: wrist (bottom) → elbow (top)
    // Each point includes per-segment measurement data
    segments: [
      { x: 0.64, y: 0.94, depth: 1.8, diameter: 2.2, stability: 72, confidence: 98.1 },
      { x: 0.63, y: 0.86, depth: 2.0, diameter: 2.5, stability: 76, confidence: 98.5 },
      { x: 0.61, y: 0.76, depth: 2.3, diameter: 2.7, stability: 80, confidence: 99.0 },
      { x: 0.58, y: 0.65, depth: 2.6, diameter: 2.9, stability: 83, confidence: 99.2 },
      { x: 0.55, y: 0.54, depth: 2.8, diameter: 3.1, stability: 85, confidence: 99.4 },  // ← best puncture zone
      { x: 0.52, y: 0.44, depth: 3.0, diameter: 3.3, stability: 87, confidence: 99.1 },
      { x: 0.50, y: 0.34, depth: 3.2, diameter: 3.5, stability: 84, confidence: 98.8 },
      { x: 0.48, y: 0.24, depth: 3.5, diameter: 3.4, stability: 80, confidence: 98.4 },
      { x: 0.46, y: 0.14, depth: 3.8, diameter: 3.2, stability: 76, confidence: 97.9 },
      { x: 0.45, y: 0.06, depth: 4.0, diameter: 3.0, stability: 72, confidence: 97.5 },
    ],

    // Optimal puncture site
    hotspot: {
      x: 0.55,
      y: 0.54,
      segmentIndex: 4,       // Which segment this corresponds to
      punctureScore: 92,      // 0–100, how ideal this site is
      reason: 'Optimal depth-to-diameter ratio with high stability',
    },

    // Branch: small tributary vein splitting off mid-forearm
    branches: [
      {
        id: 'cephalic-branch-1',
        name: 'Lateral Tributary',
        startSegmentIndex: 3,  // Branches off from segment index 3
        segments: [
          { x: 0.58, y: 0.65, depth: 2.6, diameter: 1.2, stability: 60, confidence: 96.0 },
          { x: 0.63, y: 0.60, depth: 2.2, diameter: 1.0, stability: 55, confidence: 95.5 },
          { x: 0.67, y: 0.56, depth: 1.9, diameter: 0.8, stability: 50, confidence: 94.8 },
        ],
        color: '#00e5ff',
        lineWidth: 1.5,
      },
    ],

    // Aggregate stats (shown in UI cards)
    summary: {
      avgDepth: 2.8,
      avgDiameter: 3.1,
      avgStability: 85,
      deviceConfidence: 99.2,
      accessDifficulty: 'Easy',
      recommendedGauge: '20G',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASILIC VEIN — Primary medial vein (pinky-side)
  // Deeper and less stable, but larger diameter proximally
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  basilic: {
    id: 'basilic',
    name: 'Basilic Vein',
    anatomicalRegion: 'medial forearm',
    clinicalNotes: 'Deeper than cephalic. Can roll easily. Anchor firmly before puncture.',
    color: '#00bcd4',
    glowColor: 'rgba(0, 188, 212, 0.35)',
    lineWidth: 3.0,

    segments: [
      { x: 0.36, y: 0.94, depth: 2.5, diameter: 1.8, stability: 58, confidence: 97.2 },
      { x: 0.37, y: 0.86, depth: 2.8, diameter: 2.0, stability: 62, confidence: 97.6 },
      { x: 0.38, y: 0.76, depth: 3.2, diameter: 2.2, stability: 66, confidence: 97.9 },
      { x: 0.39, y: 0.65, depth: 3.5, diameter: 2.4, stability: 70, confidence: 98.2 },
      { x: 0.41, y: 0.55, depth: 3.6, diameter: 2.5, stability: 73, confidence: 98.5 },
      { x: 0.43, y: 0.45, depth: 3.8, diameter: 2.7, stability: 76, confidence: 98.8 },  // ← best puncture zone
      { x: 0.44, y: 0.35, depth: 4.0, diameter: 2.9, stability: 74, confidence: 98.4 },
      { x: 0.46, y: 0.25, depth: 4.2, diameter: 3.1, stability: 70, confidence: 97.9 },
      { x: 0.47, y: 0.15, depth: 4.5, diameter: 3.3, stability: 66, confidence: 97.4 },
      { x: 0.48, y: 0.06, depth: 4.8, diameter: 3.5, stability: 62, confidence: 96.8 },
    ],

    hotspot: {
      x: 0.43,
      y: 0.45,
      segmentIndex: 5,
      punctureScore: 78,
      reason: 'Best stability in the basilic — anchor vein firmly at this site',
    },

    branches: [
      {
        id: 'basilic-branch-1',
        name: 'Medial Tributary',
        startSegmentIndex: 4,
        segments: [
          { x: 0.41, y: 0.55, depth: 3.6, diameter: 1.1, stability: 52, confidence: 95.0 },
          { x: 0.36, y: 0.50, depth: 3.2, diameter: 0.9, stability: 48, confidence: 94.2 },
          { x: 0.32, y: 0.46, depth: 2.8, diameter: 0.7, stability: 44, confidence: 93.5 },
        ],
        color: '#00bcd4',
        lineWidth: 1.5,
      },
    ],

    summary: {
      avgDepth: 3.6,
      avgDiameter: 2.5,
      avgStability: 76,
      deviceConfidence: 98.5,
      accessDifficulty: 'Moderate',
      recommendedGauge: '22G',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEDIAN CUBITAL VEIN — The "golden vein" at the elbow crease
  // Connects cephalic to basilic. Shallow, large, stable.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  medianCubital: {
    id: 'medianCubital',
    name: 'Median Cubital Vein',
    anatomicalRegion: 'antecubital fossa',
    clinicalNotes: 'Preferred venipuncture site. Large, superficial, and well-anchored.',
    color: '#26c6da',
    glowColor: 'rgba(38, 198, 218, 0.4)',
    lineWidth: 4.0,   // Thickest — this is the big one

    segments: [
      { x: 0.54, y: 0.40, depth: 1.8, diameter: 3.6, stability: 86, confidence: 99.0 },
      { x: 0.52, y: 0.37, depth: 2.0, diameter: 3.9, stability: 89, confidence: 99.3 },
      { x: 0.50, y: 0.34, depth: 2.2, diameter: 4.2, stability: 92, confidence: 99.5 },  // ← prime site
      { x: 0.47, y: 0.33, depth: 2.1, diameter: 4.0, stability: 90, confidence: 99.4 },
      { x: 0.45, y: 0.35, depth: 2.0, diameter: 3.7, stability: 87, confidence: 99.1 },
      { x: 0.43, y: 0.38, depth: 2.2, diameter: 3.4, stability: 84, confidence: 98.8 },
    ],

    hotspot: {
      x: 0.50,
      y: 0.34,
      segmentIndex: 2,
      punctureScore: 97,
      reason: 'Highest-scoring site: shallowest depth, largest diameter, peak stability',
    },

    branches: [],  // No significant branches

    summary: {
      avgDepth: 2.2,
      avgDiameter: 4.0,
      avgStability: 89,
      deviceConfidence: 99.5,
      accessDifficulty: 'Easy',
      recommendedGauge: '18G',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACCESSORY CEPHALIC VEIN — Smaller branch off the cephalic
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  accessoryCephalic: {
    id: 'accessoryCephalic',
    name: 'Accessory Cephalic Vein',
    anatomicalRegion: 'dorsolateral forearm',
    clinicalNotes: 'Backup site when cephalic is unavailable. Smaller but accessible.',
    color: '#4dd0e1',
    glowColor: 'rgba(77, 208, 225, 0.3)',
    lineWidth: 2.0,

    segments: [
      { x: 0.68, y: 0.80, depth: 1.5, diameter: 1.6, stability: 68, confidence: 97.0 },
      { x: 0.70, y: 0.70, depth: 1.7, diameter: 1.8, stability: 72, confidence: 97.5 },
      { x: 0.71, y: 0.60, depth: 1.9, diameter: 1.9, stability: 74, confidence: 97.8 },  // ← hotspot
      { x: 0.70, y: 0.50, depth: 2.1, diameter: 1.7, stability: 70, confidence: 97.2 },
      { x: 0.67, y: 0.42, depth: 2.3, diameter: 1.5, stability: 66, confidence: 96.8 },
      // Merges into cephalic around y=0.42
    ],

    hotspot: {
      x: 0.71,
      y: 0.60,
      segmentIndex: 2,
      punctureScore: 72,
      reason: 'Shallowest and most stable point on the accessory cephalic',
    },

    branches: [],

    summary: {
      avgDepth: 1.9,
      avgDiameter: 1.7,
      avgStability: 70,
      deviceConfidence: 97.3,
      accessDifficulty: 'Moderate',
      recommendedGauge: '22G',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DORSAL VENOUS ARCH — Network at the back of the hand/wrist
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  dorsalArch: {
    id: 'dorsalArch',
    name: 'Dorsal Venous Arch',
    anatomicalRegion: 'dorsum of hand / wrist',
    clinicalNotes: 'Last resort for IV. Very superficial but small and fragile. Painful.',
    color: '#80deea',
    glowColor: 'rgba(128, 222, 234, 0.25)',
    lineWidth: 1.8,

    segments: [
      { x: 0.40, y: 0.92, depth: 1.0, diameter: 1.2, stability: 50, confidence: 95.5 },
      { x: 0.45, y: 0.90, depth: 1.1, diameter: 1.4, stability: 54, confidence: 96.0 },
      { x: 0.50, y: 0.88, depth: 1.2, diameter: 1.5, stability: 58, confidence: 96.5 },  // ← hotspot
      { x: 0.55, y: 0.90, depth: 1.1, diameter: 1.3, stability: 55, confidence: 96.2 },
      { x: 0.60, y: 0.92, depth: 1.0, diameter: 1.1, stability: 50, confidence: 95.8 },
    ],

    hotspot: {
      x: 0.50,
      y: 0.88,
      segmentIndex: 2,
      punctureScore: 55,
      reason: 'Best point on dorsal arch, but small — use only if other sites unavailable',
    },

    branches: [],

    summary: {
      avgDepth: 1.1,
      avgDiameter: 1.3,
      avgStability: 53,
      deviceConfidence: 96.0,
      accessDifficulty: 'Difficult',
      recommendedGauge: '24G',
    },
  },
};

// ─── HELPER EXPORTS ──────────────────────────────────────────

/** Get all vein IDs */
export function getAllVeinIds() {
  return Object.keys(VEIN_DATASET);
}

/** Get primary veins only (the 3 main ones shown by default) */
export function getPrimaryVeinIds() {
  return ['cephalic', 'basilic', 'medianCubital'];
}

/** Get all veins sorted by puncture score (best first) */
export function getVeinsByPunctureScore() {
  return Object.values(VEIN_DATASET)
    .sort((a, b) => b.hotspot.punctureScore - a.hotspot.punctureScore);
}

/** Get the hotspot measurement data for a specific vein */
export function getHotspotData(veinId) {
  const vein = VEIN_DATASET[veinId];
  if (!vein) return null;
  const seg = vein.segments[vein.hotspot.segmentIndex];
  return {
    veinId: vein.id,
    name: vein.name,
    x: vein.hotspot.x,
    y: vein.hotspot.y,
    depth: seg.depth,
    diameter: seg.diameter,
    stability: seg.stability,
    confidence: seg.confidence,
    punctureScore: vein.hotspot.punctureScore,
    reason: vein.hotspot.reason,
    color: vein.color,
  };
}

/** Convert a vein's segments into a flat path array for Canvas rendering */
export function getVeinPath(veinId) {
  const vein = VEIN_DATASET[veinId];
  if (!vein) return [];
  return vein.segments.map(s => ({ x: s.x, y: s.y }));
}

/** Get all paths (main + branches) for full rendering */
export function getAllPaths(veinId) {
  const vein = VEIN_DATASET[veinId];
  if (!vein) return [];
  const paths = [{ points: getVeinPath(veinId), lineWidth: vein.lineWidth, color: vein.color }];
  for (const branch of vein.branches) {
    paths.push({
      points: branch.segments.map(s => ({ x: s.x, y: s.y })),
      lineWidth: branch.lineWidth,
      color: branch.color,
    });
  }
  return paths;
}

/**
 * Simulate slight variance in readings (mimics real device noise).
 * Call this to make repeated "scans" feel alive.
 */
export function applyDeviceNoise(veinId, varianceFactor = 0.1) {
  const vein = VEIN_DATASET[veinId];
  if (!vein) return null;

  return vein.segments.map(seg => ({
    ...seg,
    depth: +(seg.depth + (Math.random() - 0.5) * varianceFactor * 2).toFixed(1),
    diameter: +(seg.diameter + (Math.random() - 0.5) * varianceFactor * 1.5).toFixed(1),
    stability: Math.round(Math.max(0, Math.min(100, seg.stability + (Math.random() - 0.5) * varianceFactor * 20))),
    confidence: +(Math.min(100, seg.confidence + (Math.random() - 0.5) * varianceFactor * 4)).toFixed(1),
  }));
}
