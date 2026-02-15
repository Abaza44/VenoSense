/**
 * VeinoTronic AI Recommendation Engine v2.0
 *
 * Multi-factor scoring model for IV needle gauge selection.
 * Evaluates vein geometry, patient demographics, and stability metrics.
 *
 * This is PURE JavaScript — no React, no side effects, fully testable.
 */

import { NEEDLE_SPECS, GAUGE_ORDER } from '../../utils/constants';

// ─── MAIN ENTRY POINT ──────────────────────────────────────

/**
 * @param {Object} input
 * @param {number} input.veinDepth       - mm (0.5–15)
 * @param {number} input.veinDiameter    - mm (0.3–8)
 * @param {string} input.ageGroup        - "pediatric" | "adult" | "geriatric"
 * @param {number} input.stabilityIndex  - 0–100
 * @param {string} [input.patientHistory] - "none"|"diabetes"|"chemotherapy"|"obesity"|"dehydration"
 * @returns {Object}
 */
export function generateRecommendation(input) {
  const {
    veinDepth,
    veinDiameter,
    ageGroup = 'adult',
    stabilityIndex = 75,
    patientHistory = 'none',
  } = input;

  // ── Validate ──
  const errors = validateInputs(input);
  if (errors.length > 0) {
    return { error: true, messages: errors };
  }

  const depth = Number(veinDepth);
  const diameter = Number(veinDiameter);
  const stability = Number(stabilityIndex);

  // ── Step 1: Base gauge from vein diameter ──
  let gauge = selectBaseGauge(diameter);

  // ── Step 2: Adjust for age ──
  gauge = adjustForAge(gauge, ageGroup);

  // ── Step 3: Adjust for patient history ──
  gauge = adjustForHistory(gauge, patientHistory);

  // ── Step 4: Needle length from depth ──
  const needleLength = selectNeedleLength(depth);

  // ── Step 5: Success probability ──
  const successProbability = calculateSuccessProbability({
    diameter, depth, stability, ageGroup, patientHistory, gauge,
  });

  // ── Step 6: Risk assessment ──
  const risks = assessRisks({
    diameter, depth, stability, ageGroup, patientHistory, gauge,
  });

  // ── Step 7: Reasoning chain ──
  const reasoning = buildReasoning({
    diameter, depth, stability, ageGroup, patientHistory, gauge, needleLength, successProbability,
  });

  return {
    error: false,
    recommendation: {
      gauge,
      gaugeDetails: NEEDLE_SPECS[gauge],
      needleLength,
      successProbability: Math.round(successProbability),
      confidenceLevel: getConfidenceLevel(successProbability),
      risks,
      reasoning,
      alternativeGauges: getAlternatives(gauge),
      timestamp: new Date().toISOString(),
      inputSnapshot: { veinDepth: depth, veinDiameter: diameter, ageGroup, stabilityIndex: stability, patientHistory },
    },
  };
}

// ─── INTERNAL FUNCTIONS ─────────────────────────────────────

function validateInputs({ veinDepth, veinDiameter, stabilityIndex }) {
  const errors = [];
  const d = Number(veinDepth);
  const dia = Number(veinDiameter);
  const s = Number(stabilityIndex);

  if (veinDepth == null || veinDepth === '' || isNaN(d) || d < 0.5 || d > 15) {
    errors.push('Vein depth must be between 0.5mm and 15mm');
  }
  if (veinDiameter == null || veinDiameter === '' || isNaN(dia) || dia < 0.3 || dia > 8) {
    errors.push('Vein diameter must be between 0.3mm and 8mm');
  }
  if (stabilityIndex != null && stabilityIndex !== '' && (isNaN(s) || s < 0 || s > 100)) {
    errors.push('Stability index must be between 0 and 100');
  }
  return errors;
}

function selectBaseGauge(diameter) {
  if (diameter >= 5.0) return '16G';
  if (diameter >= 3.5) return '18G';
  if (diameter >= 2.5) return '20G';
  if (diameter >= 1.5) return '22G';
  return '24G';
}

function adjustForAge(gauge, ageGroup) {
  const idx = GAUGE_ORDER.indexOf(gauge);
  if ((ageGroup === 'pediatric' || ageGroup === 'geriatric') && idx < GAUGE_ORDER.length - 1) {
    return GAUGE_ORDER[idx + 1];
  }
  return gauge;
}

function adjustForHistory(gauge, history) {
  const idx = GAUGE_ORDER.indexOf(gauge);
  if ((history === 'chemotherapy' || history === 'dehydration') && idx < GAUGE_ORDER.length - 1) {
    return GAUGE_ORDER[idx + 1];
  }
  return gauge;
}

function selectNeedleLength(depth) {
  if (depth <= 2.0) return { mm: 19, inches: '0.75 inch', label: 'Short' };
  if (depth <= 4.0) return { mm: 25, inches: '1.00 inch', label: 'Standard' };
  if (depth <= 6.0) return { mm: 32, inches: '1.25 inch', label: 'Long' };
  return { mm: 38, inches: '1.50 inch', label: 'Extended' };
}

function calculateSuccessProbability({ diameter, depth, stability, ageGroup, patientHistory, gauge }) {
  let score = 85;

  // Vein-to-needle diameter ratio
  const needleOD = NEEDLE_SPECS[gauge].outerDiameterMm;
  const ratio = diameter / needleOD;
  if (ratio >= 3.0) score += 8;
  else if (ratio >= 2.0) score += 4;
  else if (ratio >= 1.5) score += 0;
  else score -= 10;

  // Depth penalty
  if (depth <= 2.0) score += 5;
  else if (depth <= 4.0) score += 0;
  else if (depth <= 6.0) score -= 5;
  else score -= 12;

  // Stability factor
  score += (stability - 50) * 0.15;

  // Age penalties
  if (ageGroup === 'pediatric') score -= 8;
  if (ageGroup === 'geriatric') score -= 6;

  // History penalties
  const historyPenalties = {
    chemotherapy: -12, diabetes: -5, dehydration: -10, obesity: -7, none: 0,
  };
  score += historyPenalties[patientHistory] || 0;

  return Math.max(35, Math.min(99, score));
}

function getConfidenceLevel(probability) {
  if (probability >= 85) return { level: 'HIGH', color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)' };
  if (probability >= 65) return { level: 'MODERATE', color: '#eab308', bgColor: 'rgba(234,179,8,0.15)' };
  return { level: 'LOW', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' };
}

function assessRisks({ diameter, depth, stability, ageGroup, patientHistory, gauge }) {
  const risks = [];
  const needleOD = NEEDLE_SPECS[gauge].outerDiameterMm;

  if (diameter / needleOD < 1.8) {
    risks.push({ severity: 'warning', message: 'Tight vein-to-needle ratio. Stabilize vein before insertion.' });
  }
  if (depth > 5) {
    risks.push({ severity: 'warning', message: 'Deep vein access required. Use ultrasound guidance if available.' });
  }
  if (stability < 40) {
    risks.push({ severity: 'critical', message: 'Low vein stability. High risk of rolling. Anchor vein firmly.' });
  }
  if (patientHistory === 'chemotherapy') {
    risks.push({ severity: 'warning', message: 'Chemo-compromised veins. Consider warm compress for visibility.' });
  }
  if (patientHistory === 'dehydration') {
    risks.push({ severity: 'info', message: 'Dehydrated patient. Vein may appear smaller than normal.' });
  }
  if (patientHistory === 'diabetes') {
    risks.push({ severity: 'info', message: 'Diabetic patient. Check for peripheral neuropathy before insertion.' });
  }
  if (ageGroup === 'geriatric') {
    risks.push({ severity: 'info', message: 'Geriatric patient. Apply gentle traction — fragile vein walls.' });
  }
  if (ageGroup === 'pediatric') {
    risks.push({ severity: 'info', message: 'Pediatric patient. Use distraction techniques. Secure IV firmly.' });
  }

  if (risks.length === 0) {
    risks.push({ severity: 'success', message: 'No significant risk factors. Standard insertion procedure recommended.' });
  }

  return risks;
}

function getAlternatives(primaryGauge) {
  const idx = GAUGE_ORDER.indexOf(primaryGauge);
  const alternatives = [];

  if (idx > 0) {
    const g = GAUGE_ORDER[idx - 1];
    alternatives.push({ gauge: g, reason: 'Larger — use if higher flow rate needed', ...NEEDLE_SPECS[g] });
  }
  if (idx < GAUGE_ORDER.length - 1) {
    const g = GAUGE_ORDER[idx + 1];
    alternatives.push({ gauge: g, reason: 'Smaller — use if vein is more fragile than expected', ...NEEDLE_SPECS[g] });
  }

  return alternatives;
}

function buildReasoning({ diameter, depth, stability, ageGroup, patientHistory, gauge, needleLength, successProbability }) {
  const steps = [];
  steps.push(`Vein diameter of ${diameter}mm → baseline gauge: ${selectBaseGauge(diameter)}.`);
  if (ageGroup !== 'adult') {
    steps.push(`Patient is ${ageGroup} → shifted to more conservative gauge.`);
  }
  if (patientHistory !== 'none') {
    steps.push(`History: ${patientHistory} → further gauge adjustment applied.`);
  }
  steps.push(`Depth ${depth}mm → ${needleLength.label.toLowerCase()} needle (${needleLength.inches}).`);
  steps.push(`Stability ${stability}/100 ${stability >= 70 ? 'supports' : 'reduces'} first-attempt confidence.`);
  steps.push(`Final: ${gauge}, ${needleLength.inches}. Success probability: ${Math.round(successProbability)}%.`);
  return steps;
}
