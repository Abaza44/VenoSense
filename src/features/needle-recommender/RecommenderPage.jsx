import { useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import InputForm from './InputForm';
import ResultCard from './ResultCard';
import { useRecommendation } from '../../hooks/useRecommendation';
import { useScanContext } from '../../context/ScanContext';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

export default function RecommenderPage() {
  const [searchParams] = useSearchParams();
  const { result, loading, error, recommend, reset } = useRecommendation();
  const { currentScan, history } = useScanContext();
  const [fromAR, setFromAR] = useState(false);

  // Check for URL params from AR overlay link
  const prefillData = useMemo(() => {
    const depth = searchParams.get('depth');
    const diameter = searchParams.get('diameter');
    const stability = searchParams.get('stability');
    const vein = searchParams.get('vein');

    if (depth || diameter) {
      setFromAR(true);
      return {
        depth: depth ? parseFloat(depth) : null,
        diameter: diameter ? parseFloat(diameter) : null,
        stability: stability ? parseFloat(stability) : null,
        veinName: vein || null,
      };
    }

    // Or from ScanContext (set by AR page)
    if (currentScan?.veins?.[0]) {
      setFromAR(true);
      const v = currentScan.veins[0];
      return { depth: v.depth, diameter: v.diameter, stability: v.stability };
    }

    return null;
  }, [searchParams, currentScan]);

  const handleSubmit = (formData) => {
    recommend(formData);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-display font-bold tracking-wide">
            Smart Needle Recommender
          </h1>
          <Badge variant="vein" size="xs">AI-POWERED</Badge>
        </div>
        <p className="text-gray-400 text-sm">
          Multi-factor scoring model analyzing vein geometry, patient demographics, and stability metrics.
        </p>
      </div>

      {/* AR Data Badge */}
      {fromAR && prefillData && (
        <div className="mb-4 bg-vein-400/10 border border-vein-400/20 rounded-lg px-4 py-3 flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 bg-vein-400 rounded-full animate-pulse" />
          <span className="text-sm text-vein-300">
            Data pre-filled from AR Scan
            {prefillData.veinName && <span className="font-semibold"> — {prefillData.veinName}</span>}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <div>
          <Card padding="p-6">
            <h2 className="text-sm font-mono uppercase tracking-wider text-gray-400 mb-4">
              Input Parameters
            </h2>
            <InputForm
              onSubmit={handleSubmit}
              loading={loading}
              prefillData={prefillData}
            />
          </Card>

          {/* AI Thinking Indicator */}
          {loading && (
            <Card padding="p-4" className="mt-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <span className="text-sm text-gray-400">AI engine analyzing parameters...</span>
              </div>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card padding="p-4" className="mt-4 border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </Card>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {result ? (
            <ResultCard recommendation={result} />
          ) : (
            <Card padding="p-12" className="flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7986a0" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Enter vein parameters and click</p>
              <p className="text-gray-400 text-sm font-semibold">Generate Recommendation</p>
              <p className="text-gray-500 text-xs mt-2">Results will appear here</p>
            </Card>
          )}
        </div>
      </div>

      {/* Recommendation History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-mono uppercase tracking-wider text-gray-400 mb-3">
            Recent Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 3).map((h, i) => (
              <Card key={i} padding="p-3" className="stagger-item">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-white">{h.gauge}</span>
                  <Badge
                    variant={h.successProbability >= 85 ? 'success' : h.successProbability >= 65 ? 'warning' : 'danger'}
                    size="xs"
                  >
                    {h.successProbability}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {h.input?.veinDiameter}mm dia × {h.input?.veinDepth}mm depth
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
