import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatDate, formatMm, deltaIndicator } from '../../utils/formatters';

export default function ScanComparison({ scan1, scan2 }) {
  if (!scan1 || !scan2) {
    return (
      <Card padding="p-6" className="text-center">
        <p className="text-gray-400 text-sm">
          Select two scans from the history to compare them side by side.
        </p>
      </Card>
    );
  }

  // Build comparison rows from vein data
  const veins1 = scan1.veins || [];
  const veins2 = scan2.veins || [];

  // Match veins by name
  const allVeinNames = [...new Set([...veins1.map(v => v.name), ...veins2.map(v => v.name)])];

  return (
    <Card padding="p-4">
      <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4">
        Scan Comparison
      </h4>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs font-mono text-gray-500">
        <span>Metric</span>
        <span className="text-center">{formatDate(scan1.date)}</span>
        <span className="text-center">{formatDate(scan2.date)}</span>
      </div>

      {/* Vein rows */}
      {allVeinNames.map((veinName) => {
        const v1 = veins1.find(v => v.name === veinName);
        const v2 = veins2.find(v => v.name === veinName);

        return (
          <div key={veinName} className="mb-4">
            <p className="text-sm font-semibold text-vein-400 mb-2">{veinName}</p>

            <CompRow
              label="Depth"
              val1={v1?.depth}
              val2={v2?.depth}
              unit="mm"
            />
            <CompRow
              label="Diameter"
              val1={v1?.diameter}
              val2={v2?.diameter}
              unit="mm"
            />
            <CompRow
              label="Stability"
              val1={v1?.stability}
              val2={v2?.stability}
              unit="/100"
            />
          </div>
        );
      })}

      {/* Recommendation comparison */}
      {(scan1.recommendation || scan2.recommendation) && (
        <div className="border-t border-surface-600/50 pt-3 mt-3">
          <p className="text-xs font-mono text-gray-500 mb-2 uppercase">Recommendation</p>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-xs text-gray-400">Gauge</span>
            <span className="text-sm font-mono font-bold text-white text-center">
              {scan1.recommendation?.gauge || '—'}
            </span>
            <span className="text-sm font-mono font-bold text-white text-center">
              {scan2.recommendation?.gauge || '—'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <span className="text-xs text-gray-400">Success</span>
            <span className="text-sm font-mono text-center" style={{ color: getSuccessColor(scan1.recommendation?.success) }}>
              {scan1.recommendation?.success ?? '—'}%
            </span>
            <span className="text-sm font-mono text-center" style={{ color: getSuccessColor(scan2.recommendation?.success) }}>
              {scan2.recommendation?.success ?? '—'}%
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

function CompRow({ label, val1, val2, unit }) {
  const delta = val1 != null && val2 != null ? deltaIndicator(val2, val1) : null;

  return (
    <div className="grid grid-cols-3 gap-2 py-1 border-b border-surface-700/50">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-mono text-white text-center">
        {val1 != null ? `${val1}${unit}` : '—'}
      </span>
      <div className="flex items-center justify-center gap-1">
        <span className="text-sm font-mono text-white">
          {val2 != null ? `${val2}${unit}` : '—'}
        </span>
        {delta && delta.symbol !== '—' && (
          <span className="text-xs font-bold" style={{ color: delta.color }}>
            {delta.symbol}
          </span>
        )}
      </div>
    </div>
  );
}

function getSuccessColor(val) {
  if (val == null) return '#7986a0';
  if (val >= 85) return '#22c55e';
  if (val >= 65) return '#eab308';
  return '#ef4444';
}
