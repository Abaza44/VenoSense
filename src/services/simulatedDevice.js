/**
 * Simulated Device Data Generator
 *
 * Mocks the output of a vein-detection hardware device.
 * Assumption: hardware provides 99% accurate vein data.
 * We add slight randomization to make it feel realistic.
 */

/**
 * Generate a simulated vein scan reading with slight variance
 */
export function generateScanData() {
  const veins = [
    {
      name: 'Cephalic Vein',
      baseDepth: 2.8,
      baseDiameter: 3.1,
      baseStability: 84,
    },
    {
      name: 'Basilic Vein',
      baseDepth: 3.6,
      baseDiameter: 2.5,
      baseStability: 76,
    },
    {
      name: 'Median Cubital Vein',
      baseDepth: 2.2,
      baseDiameter: 4.0,
      baseStability: 89,
    },
  ];

  return veins.map((v) => ({
    name: v.name,
    depth: round(v.baseDepth + variance(0.3), 1),
    diameter: round(v.baseDiameter + variance(0.2), 1),
    stability: clamp(Math.round(v.baseStability + variance(5)), 0, 100),
  }));
}

/**
 * Generate data for a specific named vein
 */
export function generateVeinReading(veinName) {
  const defaults = {
    'Cephalic Vein': { depth: 2.8, diameter: 3.1, stability: 84 },
    'Basilic Vein': { depth: 3.6, diameter: 2.5, stability: 76 },
    'Median Cubital Vein': { depth: 2.2, diameter: 4.0, stability: 89 },
  };

  const base = defaults[veinName] || { depth: 3.0, diameter: 2.8, stability: 75 };

  return {
    name: veinName,
    depth: round(base.depth + variance(0.3), 1),
    diameter: round(base.diameter + variance(0.2), 1),
    stability: clamp(Math.round(base.stability + variance(5)), 0, 100),
    timestamp: new Date().toISOString(),
    deviceConfidence: round(97 + Math.random() * 3, 1), // 97–100% (simulating 99% accuracy)
  };
}

/* ─── Helpers ────────────────────────────────────────────── */
function variance(range) {
  return (Math.random() - 0.5) * 2 * range;
}

function round(val, decimals) {
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
