import { useEffect, useState } from 'react';

export default function ConfidenceBar({
  value = 0,
  label = '',
  showPercent = true,
  height = 'h-3',
  className = '',
  animated = true,
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animated) {
      // Delay to trigger CSS transition
      const t = setTimeout(() => setWidth(Math.min(100, Math.max(0, value))), 100);
      return () => clearTimeout(t);
    } else {
      setWidth(Math.min(100, Math.max(0, value)));
    }
  }, [value, animated]);

  const getColor = (v) => {
    if (v >= 85) return { bar: 'bg-green-500', glow: 'shadow-[0_0_12px_rgba(34,197,94,0.4)]' };
    if (v >= 65) return { bar: 'bg-yellow-500', glow: 'shadow-[0_0_12px_rgba(234,179,8,0.4)]' };
    return { bar: 'bg-red-500', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]' };
  };

  const color = getColor(value);

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">{label}</span>}
          {showPercent && (
            <span className="text-sm font-mono font-bold" style={{ color: value >= 85 ? '#22c55e' : value >= 65 ? '#eab308' : '#ef4444' }}>
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${height} bg-surface-700 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color.bar} ${color.glow} rounded-full confidence-fill`}
          style={{ width: `${width}%`, transition: animated ? 'width 1s ease-out' : 'none' }}
        />
      </div>
    </div>
  );
}
