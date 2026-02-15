/**
 * Format a number to fixed decimal places
 */
export function toFixed(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toFixed(decimals);
}

/**
 * Format a percentage value
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—%';
  return `${Math.round(value)}%`;
}

/**
 * Format a date string to readable format
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date with time
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format mm value with unit
 */
export function formatMm(value) {
  if (value == null || isNaN(value)) return '—';
  return `${toFixed(value, 1)}mm`;
}

/**
 * Get a relative time label (e.g. "2 days ago")
 */
export function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a delta indicator (↑ / ↓ / —)
 */
export function deltaIndicator(current, previous) {
  if (current == null || previous == null) return { symbol: '—', color: '#7986a0' };
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return { symbol: '—', color: '#7986a0', diff: 0 };
  if (diff > 0) return { symbol: '↑', color: '#22c55e', diff: `+${toFixed(diff)}` };
  return { symbol: '↓', color: '#ef4444', diff: toFixed(diff) };
}
