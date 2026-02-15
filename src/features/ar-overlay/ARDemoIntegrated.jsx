/**
 * ═══════════════════════════════════════════════════════════════
 * INTEGRATED AR DEMO — Ties All Deliverables Together
 * ═══════════════════════════════════════════════════════════════
 *
 * This is the "money shot" component for the hackathon demo.
 * It connects:
 *   1. Camera feed (or fallback)
 *   2. SVG Vein Overlay (from veinDataset.js)
 *   3. Recommendation Engine V2 (quickRecommendFromHotspot)
 *   4. Firebase save (saveScanV2)
 *   5. All the UI/UX tricks (scan-line, glow, HUD, tooltip)
 *
 * Usage: Replace AROverlayPage.jsx or mount alongside it at /ar-v2
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraFeed from './CameraFeed';
import SVGVeinOverlay from './SVGVeinOverlay';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import ConfidenceBar from '../../components/ui/ConfidenceBar';
import PatientSelector from '../../components/PatientSelector';
import { usePatientContext } from '../../context/PatientContext';
import { useScanContext } from '../../context/ScanContext';
import { getPrimaryVeinIds, getAllVeinIds } from '../../data/veinDataset';
import { quickRecommendFromHotspot, compareVeins } from '../needle-recommender/RecommendationEngineV2';
import { saveScanV2 } from '../../services/firestoreV2';
import { formatMm, formatPercent } from '../../utils/formatters';
import { NEEDLE_SPECS } from '../../utils/constants';

const W = 640;
const H = 480;

export default function ARDemoIntegrated() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatientContext();
  const { setCurrentScan } = useScanContext();

  // ── State Machine ──
  const [phase, setPhase] = useState('idle');
  // idle → scanning → scanned → vein-selected → saving → saved
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedVein, setSelectedVein] = useState(null);
  const [quickRec, setQuickRec] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showRankings, setShowRankings] = useState(false);
  const [showAllVeins, setShowAllVeins] = useState(false);
  const [feedReady, setFeedReady] = useState(false);
  const [saved, setSaved] = useState(false);

  const scanTimerRef = useRef(null);

  // ── Scan Animation ──
  const startScan = useCallback(() => {
    setPhase('scanning');
    setSelectedVein(null);
    setQuickRec(null);
    setShowRankings(false);
    setSaved(false);
    setScanProgress(0);

    const start = performance.now();
    const duration = 2500;

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setScanProgress(p);
      if (p < 1) {
        scanTimerRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('scanned');

        // Auto-compute vein rankings
        const ctx = {
          ageGroup: selectedPatient?.ageGroup || 'adult',
          patientHistory: selectedPatient?.history || 'none',
        };
        const veinsToCompare = showAllVeins ? getAllVeinIds() : getPrimaryVeinIds();
        const ranked = compareVeins(veinsToCompare, ctx);
        setRankings(ranked);
      }
    };
    scanTimerRef.current = requestAnimationFrame(tick);
  }, [selectedPatient, showAllVeins]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) cancelAnimationFrame(scanTimerRef.current);
    };
  }, []);

  // ── Hotspot Click ──
  const handleHotspotClick = useCallback((hotspotData) => {
    const ctx = {
      ageGroup: selectedPatient?.ageGroup || 'adult',
      patientHistory: selectedPatient?.history || 'none',
    };
    const result = quickRecommendFromHotspot(hotspotData, ctx);
    setSelectedVein(hotspotData);
    setQuickRec(result);
    setPhase('vein-selected');
  }, [selectedPatient]);

  // ── Navigate to Full Recommender ──
  const goToRecommender = useCallback(() => {
    if (!selectedVein) return;
    setCurrentScan({
      veins: [{
        name: selectedVein.name,
        depth: selectedVein.depth,
        diameter: selectedVein.diameter,
        stability: selectedVein.stability,
      }],
    });
    navigate(
      `/recommend?depth=${selectedVein.depth}&diameter=${selectedVein.diameter}&stability=${selectedVein.stability}&vein=${encodeURIComponent(selectedVein.name)}`
    );
  }, [selectedVein, navigate, setCurrentScan]);

  // ── Save Scan to Firebase ──
  const handleSave = useCallback(async () => {
    if (!selectedPatient || !quickRec) return;
    setPhase('saving');

    await saveScanV2(selectedPatient.id, {
      arm: 'left',
      deviceId: 'VTRON-001',
      scanDuration: 2.5,
      veins: rankings.map(r => ({
        id: r.vein.id,
        name: r.vein.name,
        depth: r.hotspot.depth,
        diameter: r.hotspot.diameter,
        stability: r.hotspot.stability,
        confidence: r.hotspot.confidence,
      })),
      recommendation: {
        primaryVein: quickRec.veinName,
        gauge: quickRec.recommendation.gauge,
        needleLength: quickRec.recommendation.needleLength,
        success: quickRec.recommendation.successProbability,
        angle: quickRec.recommendation.insertionAngle,
        risks: [quickRec.recommendation.topRisk],
      },
    });

    setSaved(true);
    setPhase('saved');
  }, [selectedPatient, quickRec, rankings]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    setPhase('idle');
    setScanProgress(0);
    setSelectedVein(null);
    setQuickRec(null);
    setShowRankings(false);
    setSaved(false);
  }, []);

  // ── Which veins to render ──
  const visibleVeins = showAllVeins ? getAllVeinIds() : getPrimaryVeinIds();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-display font-bold tracking-wide">AR Vein Scanner</h1>
            <Badge variant="vein" size="xs">LIVE</Badge>
            {phase !== 'idle' && (
              <Badge variant={phase === 'scanning' ? 'warning' : 'success'} size="xs">
                {phase.toUpperCase().replace('-', ' ')}
              </Badge>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            Tap veins after scan for instant measurements and needle recommendations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle: show all 5 veins or just the 3 primary */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAllVeins}
              onChange={(e) => setShowAllVeins(e.target.checked)}
              className="accent-vein-400"
            />
            <span className="text-xs text-gray-400">Show all veins</span>
          </label>
          <PatientSelector className="w-52" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: Scanner Viewport ── */}
        <div className="lg:col-span-2">
          <div
            className="relative bg-black rounded-xl overflow-hidden border border-surface-600/50"
            style={{ aspectRatio: `${W}/${H}` }}
          >
            {/* Camera / fallback */}
            <CameraFeed onReady={() => setFeedReady(true)} />

            {/* SVG Vein Overlay */}
            <SVGVeinOverlay
              width={W}
              height={H}
              veins={visibleVeins}
              scanProgress={scanProgress}
              showHotspots={phase === 'scanned' || phase === 'vein-selected'}
              showBranches={showAllVeins}
              onHotspotClick={handleHotspotClick}
              selectedVeinId={selectedVein?.veinId}
            />

            {/* HUD: top bar */}
            <div className="absolute top-0 left-0 right-0 px-4 py-3 flex justify-between bg-gradient-to-b from-black/60 to-transparent pointer-events-none" style={{ zIndex: 20 }}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  phase === 'scanning' ? 'bg-yellow-400 animate-pulse' :
                  phase === 'idle' ? 'bg-gray-500' : 'bg-green-400'
                }`} />
                <span className="text-xs font-mono text-white/80 tracking-wider">
                  {phase === 'idle' && 'READY'}
                  {phase === 'scanning' && `SCANNING... ${Math.round(scanProgress * 100)}%`}
                  {phase === 'scanned' && `${visibleVeins.length} VEINS DETECTED — TAP TO ANALYZE`}
                  {phase === 'vein-selected' && `ANALYZING: ${selectedVein?.name}`}
                  {phase === 'saving' && 'SAVING TO PATIENT RECORD...'}
                  {phase === 'saved' && 'SCAN SAVED ✓'}
                </span>
              </div>
              <span className="text-xs font-mono text-white/30">VeinoTronic AR v2.0</span>
            </div>

            {/* HUD: patient badge */}
            {selectedPatient && (
              <div className="absolute top-11 left-4 pointer-events-none" style={{ zIndex: 20 }}>
                <span className="bg-black/60 backdrop-blur rounded px-2 py-1 text-xs font-mono text-vein-400">
                  {selectedPatient.id} — {selectedPatient.name}
                </span>
              </div>
            )}

            {/* HUD: bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex justify-between bg-gradient-to-t from-black/60 to-transparent pointer-events-none" style={{ zIndex: 20 }}>
              <span className="text-[10px] font-mono text-white/30">RES: {W}×{H}</span>
              <span className="text-[10px] font-mono text-white/30">CONFIDENCE: 99.2%</span>
            </div>

            {/* Scan button */}
            {phase === 'idle' && feedReady && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 25 }}>
                <Button onClick={startScan} size="lg" className="shadow-vein-strong">
                  ⚡ Start Vein Scan
                </Button>
              </div>
            )}

            {/* Reset button */}
            {(phase === 'scanned' || phase === 'vein-selected' || phase === 'saved') && (
              <div className="absolute bottom-3 right-3" style={{ zIndex: 25 }}>
                <Button onClick={handleReset} variant="secondary" size="sm">↻ New Scan</Button>
              </div>
            )}
          </div>

          {/* Quick recommendation tooltip below viewport */}
          {quickRec && quickRec.recommendation && (
            <Card glow padding="p-4" className="mt-4 animate-slide-up">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: quickRec.veinColor }} />
                    <span className="font-semibold text-white">{quickRec.veinName}</span>
                    <Badge variant="vein" size="xs">Score: {quickRec.punctureScore}</Badge>
                  </div>

                  {/* Measurement row */}
                  <div className="flex gap-5 mb-3">
                    <MiniMetric label="Depth" value={formatMm(quickRec.measurement.depth)} />
                    <MiniMetric label="Diameter" value={formatMm(quickRec.measurement.diameter)} />
                    <MiniMetric label="Stability" value={`${quickRec.measurement.stability}/100`} />
                    <MiniMetric label="Device" value={`${quickRec.measurement.confidence}%`} />
                  </div>

                  {/* Recommendation summary */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-mono font-bold"
                        style={{
                          borderColor: quickRec.recommendation.gaugeColor,
                          color: quickRec.recommendation.gaugeColor,
                          backgroundColor: quickRec.recommendation.gaugeColor + '15',
                        }}
                      >
                        {quickRec.recommendation.gauge}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{quickRec.recommendation.gauge} · {quickRec.recommendation.needleLength}</p>
                        <p className="text-xs text-gray-400">{quickRec.recommendation.insertionAngle}° insertion angle</p>
                      </div>
                    </div>

                    <ConfidenceBar
                      value={quickRec.recommendation.successProbability}
                      label="Success"
                      className="flex-1 min-w-[120px]"
                      height="h-2"
                    />
                  </div>

                  {/* Risk note */}
                  <p className="text-xs text-gray-500 mt-2 italic">{quickRec.recommendation.topRisk}</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 ml-4 shrink-0">
                  <Button size="sm" onClick={goToRecommender}>
                    Full Analysis →
                  </Button>
                  {selectedPatient && !saved && (
                    <Button size="sm" variant="secondary" onClick={handleSave}
                      loading={phase === 'saving'}>
                      💾 Save Scan
                    </Button>
                  )}
                  {saved && (
                    <Badge variant="success" size="sm">Saved ✓</Badge>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: Vein Rankings Panel ── */}
        <div>
          {rankings.length > 0 ? (
            <Card padding="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                  Vein Ranking
                </h3>
                <span className="text-xs text-gray-500">{rankings.length} analyzed</span>
              </div>

              <div className="space-y-2">
                {rankings.map((r, i) => (
                  <div
                    key={r.vein.id}
                    className={`stagger-item rounded-lg p-3 border cursor-pointer transition-all
                      ${selectedVein?.veinId === r.vein.id
                        ? 'border-vein-400/40 bg-vein-400/10'
                        : 'border-surface-600/50 bg-surface-700/30 hover:border-surface-500'
                      }`}
                    onClick={() => handleHotspotClick({
                      veinId: r.vein.id,
                      name: r.vein.name,
                      depth: r.hotspot.depth,
                      diameter: r.hotspot.diameter,
                      stability: r.hotspot.stability,
                      confidence: r.hotspot.confidence,
                      punctureScore: r.hotspot.punctureScore,
                      color: VEIN_DATASET_COLORS[r.vein.id] || '#00e5ff',
                    })}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-500">
                          #{r.rank}
                        </span>
                        <span className="text-sm font-medium text-white">{r.vein.name}</span>
                      </div>
                      <Badge
                        variant={r.isBestChoice ? 'success' : i === 1 ? 'vein' : 'default'}
                        size="xs"
                      >
                        {r.rankLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatMm(r.hotspot.diameter)} dia · {formatMm(r.hotspot.depth)} deep
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold"
                          style={{ color: NEEDLE_SPECS[r.recommendation.gauge]?.color || '#fff' }}>
                          {r.recommendation.gauge}
                        </span>
                        <span className="text-xs font-mono" style={{
                          color: r.recommendation.successProbability >= 85 ? '#22c55e' :
                                 r.recommendation.successProbability >= 65 ? '#eab308' : '#ef4444'
                        }}>
                          {r.recommendation.successProbability}%
                        </span>
                      </div>
                    </div>
                    <ConfidenceBar
                      value={r.compositeScore}
                      showPercent={false}
                      height="h-1"
                      className="mt-2"
                      animated={false}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card padding="p-8" className="text-center">
              <div className="w-12 h-12 rounded-full bg-surface-700 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7986a0" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Run a scan to see</p>
              <p className="text-sm text-gray-400">vein rankings here</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

function MiniMetric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 font-mono uppercase">{label}</p>
      <p className="text-sm font-mono font-semibold text-vein-400">{value}</p>
    </div>
  );
}

// Quick color lookup (avoids importing full dataset just for colors)
const VEIN_DATASET_COLORS = {
  cephalic: '#00e5ff',
  basilic: '#00bcd4',
  medianCubital: '#26c6da',
  accessoryCephalic: '#4dd0e1',
  dorsalArch: '#80deea',
};
