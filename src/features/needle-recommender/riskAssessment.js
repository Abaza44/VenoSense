/**
 * Risk Assessment Utility
 * Provides risk-level classification and display helpers.
 */

import { SEVERITY } from '../../utils/constants';

/**
 * Get display properties for a risk severity level
 */
export function getRiskDisplay(severity) {
  return SEVERITY[severity] || SEVERITY.info;
}

/**
 * Get CSS class for risk severity
 */
export function getRiskClass(severity) {
  const map = {
    critical: 'risk-critical',
    warning: 'risk-warning',
    info: 'risk-info',
    success: 'risk-success',
  };
  return map[severity] || 'risk-info';
}

/**
 * Sort risks by severity (critical first)
 */
export function sortRisksBySeverity(risks) {
  const order = { critical: 0, warning: 1, info: 2, success: 3 };
  return [...risks].sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));
}

/**
 * Get overall risk level from a list of risks
 */
export function getOverallRiskLevel(risks) {
  if (risks.some((r) => r.severity === 'critical')) return 'critical';
  if (risks.some((r) => r.severity === 'warning')) return 'warning';
  return 'low';
}
