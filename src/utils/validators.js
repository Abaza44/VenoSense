import { INPUT_RANGES } from './constants';

/**
 * Validate recommendation engine inputs.
 * Returns an array of error messages (empty = valid).
 */
export function validateRecommendationInputs({ veinDepth, veinDiameter, stabilityIndex, ageGroup }) {
  const errors = [];

  if (veinDepth == null || veinDepth === '') {
    errors.push('Vein depth is required');
  } else {
    const d = Number(veinDepth);
    if (isNaN(d) || d < INPUT_RANGES.veinDepth.min || d > INPUT_RANGES.veinDepth.max) {
      errors.push(`Vein depth must be between ${INPUT_RANGES.veinDepth.min}–${INPUT_RANGES.veinDepth.max}mm`);
    }
  }

  if (veinDiameter == null || veinDiameter === '') {
    errors.push('Vein diameter is required');
  } else {
    const d = Number(veinDiameter);
    if (isNaN(d) || d < INPUT_RANGES.veinDiameter.min || d > INPUT_RANGES.veinDiameter.max) {
      errors.push(`Vein diameter must be between ${INPUT_RANGES.veinDiameter.min}–${INPUT_RANGES.veinDiameter.max}mm`);
    }
  }

  if (stabilityIndex != null && stabilityIndex !== '') {
    const s = Number(stabilityIndex);
    if (isNaN(s) || s < 0 || s > 100) {
      errors.push('Stability index must be between 0–100');
    }
  }

  if (!ageGroup) {
    errors.push('Age group is required');
  }

  return errors;
}

/**
 * Validate a Patient ID format (PT-XXX)
 */
export function validatePatientId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^PT-\d{3,}$/i.test(id.trim());
}

/**
 * Sanitize numeric input — returns a number or null
 */
export function sanitizeNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}
