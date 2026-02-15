import { useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ConfidenceBar from '../../components/ui/ConfidenceBar';
import { getRiskClass } from './riskAssessment';
import { NEEDLE_SPECS } from '../../utils/constants';

export default function ResultCard({ recommendation }) {
  const [showReasoning, setShowReasoning] = useState(false);
  const r = recommendation;

  if (!r) return null;

  const severityVariant = {
    critical: 'danger',
    warning: 'warning',
    info: 'info',
    success: 'success',
  };

  return (
    <div className="animate-slide-up space-y-4">
      {/* Main Recommendation Card */}
      <Card glow className="relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-vein-400/10 to-transparent rounded-bl-full" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-1">
                AI Recommendation
              </p>
              <h3 className="text-2xl font-display font-bold text-white tracking-wide">
                {r.gauge}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {r.gaugeDetails.typicalUse}
              </p>
            </div>

            {/* Gauge color indicator */}
            <div
              className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-sm"
              style={{
                borderColor: r.gaugeDetails.color,
                color: r.gaugeDetails.color,
                backgroundColor: r.gaugeDetails.color + '15',
              }}
            >
              {r.gaugeDetails.colorName.slice(0, 3).toUpperCase()}
            </div>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <MetricBox label="Gauge" value={r.gauge} sub={`OD: ${r.gaugeDetails.outerDiameterMm}mm`} />
            <MetricBox label="Length" value={r.needleLength.inches} sub={r.needleLength.label} />
            <MetricBox label="Flow Rate" value={r.gaugeDetails.flowRate} sub="capacity" />
          </div>

          {/* Confidence bar */}
          <ConfidenceBar
            value={r.successProbability}
            label="Success Probability"
            className="mb-3"
          />

          {/* Confidence badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={r.confidenceLevel.level === 'HIGH' ? 'success' : r.confidenceLevel.level === 'MODERATE' ? 'warning' : 'danger'}
              size="xs"
            >
              {r.confidenceLevel.level} CONFIDENCE
            </Badge>
            <span className="text-xs text-gray-500 font-mono">
              {r.successProbability}% estimated first-attempt success
            </span>
          </div>
        </div>
      </Card>

      {/* Risk Warnings */}
      <Card padding="p-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
          Risk Assessment
        </h4>
        <div className="space-y-2">
          {r.risks.map((risk, i) => (
            <div
              key={i}
              className={`${getRiskClass(risk.severity)} bg-surface-700/50 rounded-lg px-3 py-2.5 flex items-start gap-2.5`}
            >
              <Badge variant={severityVariant[risk.severity] || 'default'} size="xs">
                {risk.severity}
              </Badge>
              <span className="text-sm text-gray-300 leading-relaxed">{risk.message}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reasoning Chain (expandable) */}
      <Card padding="p-4">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
            AI Reasoning Chain
          </span>
          <span className="text-vein-400 text-sm">{showReasoning ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showReasoning && (
          <div className="mt-3 space-y-2">
            {r.reasoning.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <span className="text-vein-400 font-mono font-bold mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Alternative Gauges */}
      {r.alternativeGauges.length > 0 && (
        <Card padding="p-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
            Alternatives
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {r.alternativeGauges.map((alt) => (
              <div
                key={alt.gauge}
                className="bg-surface-700/50 rounded-lg px-3 py-2.5 border border-surface-600/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-mono font-bold text-sm"
                    style={{ color: NEEDLE_SPECS[alt.gauge]?.color || '#fff' }}
                  >
                    {alt.gauge}
                  </span>
                  <span className="text-xs text-gray-500">{alt.colorName}</span>
                </div>
                <p className="text-xs text-gray-400">{alt.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricBox({ label, value, sub }) {
  return (
    <div className="bg-surface-700/50 rounded-lg p-3 text-center">
      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{label}</p>
      <p className="text-lg font-display font-bold text-white mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}
