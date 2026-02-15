/**
 * ═══════════════════════════════════════════════════════════════
 * DELIVERABLE 3 — ENHANCED RECOMMENDATION ENGINE v2
 * ═══════════════════════════════════════════════════════════════
 *
 * Builds on top of the existing RecommendationEngine.js.
 * Adds:
 *   - Direct integration with the vein dataset
 *   - Per-segment analysis (not just hotspot)
 *   - Multi-vein comparison ("which vein should I use?")
 *   - Puncture site ranking
 *   - Procedure guidance text
 *   - Insertion angle recommendation
 *
 * Still 100% client-side, still rule-based, still deterministic.
 */

import { generateRecommendation } from './RecommendationEngine';
import { VEIN_DATASET, getHotspotData, getAllVeinIds } from '../../data/veinDataset';
import { NEEDLE_SPECS } from '../../utils/constants';

// ─── ANALYZE A SPECIFIC VEIN FROM THE DATASET ──────────────

/**
 * Given a vein ID and patient context, produce a full analysis
 * including the best segment, gauge, probability, and guidance.
 *
 * @param {string} veinId - Key from VEIN_DATASET
 * @param {Object} patientContext - { ageGroup, patientHistory }
 * @returns {Object} Full vein analysis
 */
export function analyzeVein(veinId, patientContext = {}) {
  const vein = VEIN_DATASET[veinId];
  if (!vein) return { error: true, message: `Unknown vein: ${veinId}` };

  const { ageGroup = 'adult', patientHistory = 'none' } = patientContext;

  // Get hotspot segment data
  const seg = vein.segments[vein.hotspot.segmentIndex];

  // Run the core recommendation engine
  const rec = generateRecommendation({
    veinDepth: seg.depth,
    veinDiameter: seg.diameter,
    ageGroup,
    stabilityIndex: seg.stability,
    patientHistory,
  });

  if (rec.error) return rec;

  // Add vein-specific enhancements
  const insertionAngle = calculateInsertionAngle(seg.depth, seg.diameter);
  const procedureSteps = generateProcedureGuidance(vein, rec.recommendation, patientContext);
  const segmentAnalysis = analyzeAllSegments(vein, ageGroup, patientHistory);

  return {
    error: false,
    vein: {
      id: vein.id,
      name: vein.name,
      anatomicalRegion: vein.anatomicalRegion,
      clinicalNotes: vein.clinicalNotes,
      accessDifficulty: vein.summary.accessDifficulty,
    },
    hotspot: {
      ...getHotspotData(veinId),
      insertionAngle,
    },
    recommendation: rec.recommendation,
    procedureSteps,
    segmentAnalysis,
  };
}

// ─── COMPARE ALL VEINS — "WHICH VEIN SHOULD I USE?" ────────

/**
 * Rank all visible veins by suitability, given a patient context.
 * Returns a sorted array: best vein first.
 *
 * @param {string[]} veinIds - Which veins to compare
 * @param {Object} patientContext - { ageGroup, patientHistory }
 * @returns {Object[]} Ranked vein analyses
 */
export function compareVeins(veinIds = null, patientContext = {}) {
  const ids = veinIds || getAllVeinIds();

  const analyses = ids.map(id => {
    const result = analyzeVein(id, patientContext);
    if (result.error) return null;

    // Composite score: weighted combination of factors
    const score = computeCompositeScore(result);
    return { ...result, compositeScore: score };
  }).filter(Boolean);

  // Sort by composite score (highest = best)
  analyses.sort((a, b) => b.compositeScore - a.compositeScore);

  // Add rank labels
  return analyses.map((a, i) => ({
    ...a,
    rank: i + 1,
    rankLabel: i === 0 ? 'RECOMMENDED' : i === 1 ? 'ALTERNATIVE' : 'BACKUP',
    isBestChoice: i === 0,
  }));
}

// ─── INSERTION ANGLE CALCULATOR ─────────────────────────────

function calculateInsertionAngle(depth, diameter) {
  // Shallow veins: lower angle (10–15°) — less tissue to traverse
  // Deep veins: steeper angle (25–35°) — need to reach deeper
  // Narrower veins: slightly shallower to avoid through-and-through

  let angle;
  if (depth <= 1.5) angle = 10;
  else if (depth <= 2.5) angle = 15;
  else if (depth <= 4.0) angle = 20;
  else if (depth <= 6.0) angle = 25;
  else angle = 30;

  // Narrow vein adjustment: reduce by 5°
  if (diameter < 2.0) angle = Math.max(10, angle - 5);

  return {
    degrees: angle,
    label: angle <= 15 ? 'Shallow' : angle <= 25 ? 'Standard' : 'Steep',
    guidance: `Insert at ${angle}° angle${angle <= 15 ? ' — keep nearly flat for this superficial vein' : angle >= 25 ? ' — steeper approach needed for depth' : ''}`,
  };
}

// ─── PROCEDURE GUIDANCE GENERATOR ───────────────────────────

function generateProcedureGuidance(vein, recommendation, patientContext) {
  const steps = [];
  const { ageGroup = 'adult', patientHistory = 'none' } = patientContext;

  // Step 1: Preparation
  steps.push({
    step: 1,
    title: 'Prepare',
    instruction: `Apply tourniquet 10–15cm proximal to the ${vein.anatomicalRegion}. Select ${recommendation.gauge} ${recommendation.gaugeDetails.colorName.toLowerCase()} catheter.`,
    duration: '30s',
  });

  // Step 2: Patient-specific pre-treatment
  if (patientHistory === 'dehydration') {
    steps.push({
      step: 2,
      title: 'Pre-treat',
      instruction: 'Apply warm compress for 2–3 minutes to promote vasodilation. Dehydrated veins respond well to warmth.',
      duration: '2–3 min',
    });
  } else if (patientHistory === 'chemotherapy') {
    steps.push({
      step: 2,
      title: 'Pre-treat',
      instruction: 'Apply warm compress gently. Inspect for signs of phlebitis or scarring. Avoid previously treated sites.',
      duration: '2 min',
    });
  } else if (ageGroup === 'pediatric') {
    steps.push({
      step: 2,
      title: 'Comfort',
      instruction: 'Apply topical anesthetic cream if time permits. Use age-appropriate distraction technique.',
      duration: '1–2 min',
    });
  }

  // Step 3: Site identification
  const seg = vein.segments[vein.hotspot.segmentIndex];
  steps.push({
    step: steps.length + 1,
    title: 'Identify site',
    instruction: `Target the ${vein.name} at the marked hotspot. Vein is ${seg.depth}mm deep with ${seg.diameter}mm diameter.`,
    duration: '15s',
  });

  // Step 4: Anchor
  if (vein.summary.avgStability < 75) {
    steps.push({
      step: steps.length + 1,
      title: 'Anchor vein',
      instruction: `This vein has moderate stability (${Math.round(vein.summary.avgStability)}/100). Apply firm distal traction with your non-dominant thumb to prevent rolling.`,
      duration: '5s',
    });
  }

  // Step 5: Insert
  const angle = calculateInsertionAngle(seg.depth, seg.diameter);
  steps.push({
    step: steps.length + 1,
    title: 'Insert',
    instruction: `${angle.guidance}. Advance until flashback is observed, then reduce angle and advance catheter ${recommendation.needleLength.inches} into the vein.`,
    duration: '5–10s',
  });

  // Step 6: Secure
  steps.push({
    step: steps.length + 1,
    title: 'Secure',
    instruction: 'Remove tourniquet. Flush with saline. Apply transparent dressing and secure catheter.',
    duration: '30s',
  });

  return steps;
}

// ─── SEGMENT-LEVEL ANALYSIS ─────────────────────────────────

function analyzeAllSegments(vein, ageGroup, patientHistory) {
  return vein.segments.map((seg, idx) => {
    const rec = generateRecommendation({
      veinDepth: seg.depth,
      veinDiameter: seg.diameter,
      ageGroup,
      stabilityIndex: seg.stability,
      patientHistory,
    });

    const isHotspot = idx === vein.hotspot.segmentIndex;

    return {
      segmentIndex: idx,
      x: seg.x,
      y: seg.y,
      depth: seg.depth,
      diameter: seg.diameter,
      stability: seg.stability,
      confidence: seg.confidence,
      gauge: rec.error ? null : rec.recommendation.gauge,
      successProbability: rec.error ? null : rec.recommendation.successProbability,
      isHotspot,
      quality: seg.stability >= 80 ? 'good' : seg.stability >= 60 ? 'fair' : 'poor',
    };
  });
}

// ─── COMPOSITE SCORING ──────────────────────────────────────

function computeCompositeScore(analysis) {
  const r = analysis.recommendation;
  const h = analysis.hotspot;

  // Weighted score: success probability is king, but factor in accessibility
  const successWeight = 0.40;
  const stabilityWeight = 0.20;
  const depthWeight = 0.15;   // Shallower = better (inverted)
  const diameterWeight = 0.15;  // Bigger = better
  const punctureWeight = 0.10;

  const depthScore = Math.max(0, 100 - (h.depth / 6) * 100);  // 0mm=100, 6mm=0
  const diameterScore = Math.min(100, (h.diameter / 5) * 100);  // 5mm=100

  return Math.round(
    r.successProbability * successWeight +
    h.stability * stabilityWeight +
    depthScore * depthWeight +
    diameterScore * diameterWeight +
    h.punctureScore * punctureWeight
  );
}

// ─── QUICK RECOMMEND FROM HOTSPOT CLICK ─────────────────────

/**
 * Convenience function: call this when user taps a vein hotspot in the AR overlay.
 * Returns everything needed for the UI tooltip + recommendation card.
 *
 * @param {Object} hotspotData - Output of getHotspotData()
 * @param {Object} patientContext - { ageGroup, patientHistory }
 */
export function quickRecommendFromHotspot(hotspotData, patientContext = {}) {
  const { ageGroup = 'adult', patientHistory = 'none' } = patientContext;

  const rec = generateRecommendation({
    veinDepth: hotspotData.depth,
    veinDiameter: hotspotData.diameter,
    ageGroup,
    stabilityIndex: hotspotData.stability,
    patientHistory,
  });

  const angle = calculateInsertionAngle(hotspotData.depth, hotspotData.diameter);

  return {
    veinName: hotspotData.name,
    veinColor: hotspotData.color,
    measurement: {
      depth: hotspotData.depth,
      diameter: hotspotData.diameter,
      stability: hotspotData.stability,
      confidence: hotspotData.confidence,
    },
    recommendation: rec.error ? null : {
      gauge: rec.recommendation.gauge,
      gaugeColor: rec.recommendation.gaugeDetails.color,
      gaugeColorName: rec.recommendation.gaugeDetails.colorName,
      needleLength: rec.recommendation.needleLength.inches,
      successProbability: rec.recommendation.successProbability,
      confidenceLevel: rec.recommendation.confidenceLevel.level,
      insertionAngle: angle.degrees,
      topRisk: rec.recommendation.risks[0]?.message || 'No significant risks',
    },
    punctureScore: hotspotData.punctureScore,
  };
}
