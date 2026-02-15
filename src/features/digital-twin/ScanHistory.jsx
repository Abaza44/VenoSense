import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatDate, relativeTime } from '../../utils/formatters';

export default function ScanHistory({ scans, onSelectScan, selectedScanIds = [] }) {
  if (!scans || scans.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No scan history available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scans.map((scan, i) => {
        const isSelected = selectedScanIds.includes(scan.id);
        return (
          <Card
            key={scan.id}
            hover
            padding="p-3"
            onClick={() => onSelectScan?.(scan)}
            className={`stagger-item ${isSelected ? 'glow-border' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">
                    {formatDate(scan.date)}
                  </span>
                  <span className="text-xs text-gray-500">{relativeTime(scan.date)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default" size="xs">{scan.arm} arm</Badge>
                  {scan.veins?.map((v, vi) => (
                    <span key={vi} className="text-xs text-gray-400">
                      {v.name}: {v.diameter}mm
                    </span>
                  ))}
                </div>
              </div>
              {scan.recommendation && (
                <div className="text-right shrink-0 ml-3">
                  <span className="font-mono font-bold text-vein-400 text-sm">
                    {scan.recommendation.gauge}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {scan.recommendation.success}% success
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
