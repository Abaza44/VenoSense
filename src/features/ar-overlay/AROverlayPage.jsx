import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraFeed from './CameraFeed';
import VeinCanvas from './VeinCanvas';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PatientSelector from '../../components/PatientSelector';
import { usePatientContext } from '../../context/PatientContext';
import { useScanContext } from '../../context/ScanContext';
import { formatMm } from '../../utils/formatters';

const CANVAS_W = 640;
const CANVAS_H = 480;

export default function AROverlayPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { selectedPatient } = usePatientContext();
  const { setCurrentScan } = useScanContext();

  const [state, setState] = useState('idle'); // idle | scanning | complete
  const [selectedVein, setSelectedVein] = useState(null);
  const [feedReady, setFeedReady] = useState(false);

  const handleFeedReady = useCallback(() => {
    setFeedReady(true);
  }, []);

  const handleStartScan = useCallback(async () => {
    setState('scanning');
    setSelectedVein(null);
    await canvasRef.current?.startScan(2500);
    setState('complete');
  }, []);

  const handleReset = useCallback(() => {
    setState('idle');
    setSelectedVein(null);
    canvasRef.current?.reset();
  }, []);

  const handleVeinClick = useCallback((vein) => {
    setSelectedVein(vein);
  }, []);

  const handleGetRecommendation = useCallback(() => {
    if (!selectedVein) return;

    // Save scan data to context
    setCurrentScan({
      veins: [{
        name: selectedVein.name,
        depth: selectedVein.depth,
        diameter: selectedVein.diameter,
        stability: selectedVein.stability,
      }],
      timestamp: new Date().toISOString(),
    });

    // Navigate with URL params as well (belt and suspenders)
    navigate(
      `/recommend?depth=${selectedVein.depth}&diameter=${selectedVein.diameter}&stability=${selectedVein.stability}&vein=${encodeURIComponent(selectedVein.name)}`
    );
  }, [selectedVein, navigate, setCurrentScan]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-display font-bold tracking-wide">AR Vein Scanner</h1>
            <Badge variant="vein" size="xs">LIVE</Badge>
          </div>
          <p className="text-gray-400 text-sm">
            Real-time vein visualization overlay. Tap veins after scan for measurements.
          </p>
        </div>
        <PatientSelector className="w-56" />
      </div>

      {/* Scanner viewport */}
      <div className="relative bg-black rounded-xl overflow-hidden border border-surface-600/50"
           style={{ maxWidth: CANVAS_W, aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}>

        {/* Camera feed (Layer 1) */}
        <CameraFeed onReady={handleFeedReady} />

        {/* Vein Canvas overlay (Layer 2) */}
        <VeinCanvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={handleVeinClick}
        />

        {/* HUD overlay (Layer 3) */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          {/* Top HUD bar */}
          <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${state === 'scanning' ? 'bg-yellow-400 animate-pulse' : state === 'complete' ? 'bg-green-400' : 'bg-gray-500'}`} />
              <span className="text-xs font-mono text-white/80 tracking-wider">
                {state === 'idle' && 'READY'}
                {state === 'scanning' && 'SCANNING...'}
                {state === 'complete' && 'SCAN COMPLETE — TAP A VEIN'}
              </span>
            </div>
            <span className="text-xs font-mono text-white/40">
              VeinoTronic AR v2.0
            </span>
          </div>

          {/* Patient name badge (if selected) */}
          {selectedPatient && (
            <div className="absolute top-12 left-4">
              <div className="bg-black/50 backdrop-blur-sm rounded px-2.5 py-1 border border-white/10">
                <span className="text-xs font-mono text-vein-400">
                  {selectedPatient.id} — {selectedPatient.name}
                </span>
              </div>
            </div>
          )}

          {/* Bottom control bar */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center justify-between text-xs font-mono text-white/50">
              <span>RES: {CANVAS_W}×{CANVAS_H}</span>
              <span>CONFIDENCE: 99.2%</span>
            </div>
          </div>

          {/* Corner brackets (aesthetic) */}
          <CornerBrackets />
        </div>

        {/* Selected Vein Tooltip */}
        {selectedVein && state === 'complete' && (
          <div
            className="absolute pointer-events-auto animate-fade-in"
            style={{
              left: `min(70%, ${(selectedVein.screenX / CANVAS_W) * 100}%)`,
              top: `max(10%, ${((selectedVein.screenY / CANVAS_H) * 100) - 15}%)`,
              zIndex: 30,
            }}
          >
            <div className="bg-surface-900/95 backdrop-blur-md rounded-lg border border-vein-400/30 shadow-vein p-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedVein.color }} />
                <span className="text-sm font-semibold text-white">{selectedVein.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <MiniStat label="Depth" value={formatMm(selectedVein.depth)} />
                <MiniStat label="Diameter" value={formatMm(selectedVein.diameter)} />
                <MiniStat label="Stability" value={`${selectedVein.stability}`} />
              </div>
              <button
                onClick={handleGetRecommendation}
                className="w-full bg-vein-400 text-surface-900 text-xs font-bold py-2 rounded-md hover:bg-vein-300 transition-colors"
              >
                Get Needle Recommendation →
              </button>
            </div>
          </div>
        )}

        {/* Start Scan button (centered) */}
        {state === 'idle' && feedReady && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 25 }}>
            <Button onClick={handleStartScan} size="lg" className="pointer-events-auto shadow-vein-strong">
              ⚡ Start Vein Scan
            </Button>
          </div>
        )}

        {/* Reset button */}
        {state === 'complete' && (
          <div className="absolute bottom-4 right-4 pointer-events-auto" style={{ zIndex: 25 }}>
            <Button onClick={handleReset} variant="secondary" size="sm">
              ↻ New Scan
            </Button>
          </div>
        )}
      </div>

      {/* Instructions below viewport */}
      <div className="mt-4 max-w-[640px]">
        <div className="bg-surface-800/50 rounded-lg px-4 py-3 border border-surface-600/30">
          <p className="text-xs text-gray-400 leading-relaxed">
            {state === 'idle' && 'Point the scanner at the patient\'s arm area and press "Start Vein Scan" to begin analysis.'}
            {state === 'scanning' && 'Scanning in progress... The system is analyzing the vein structure using infrared imaging.'}
            {state === 'complete' && 'Scan complete. Tap on any highlighted vein to view measurements and get a needle recommendation.'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-gray-500 font-mono uppercase">{label}</p>
      <p className="text-sm font-mono font-bold text-vein-400">{value}</p>
    </div>
  );
}

function CornerBrackets() {
  const bracketStyle = 'absolute w-6 h-6 border-vein-400/40';
  return (
    <>
      <div className={`${bracketStyle} top-2 left-2 border-t-2 border-l-2`} />
      <div className={`${bracketStyle} top-2 right-2 border-t-2 border-r-2`} />
      <div className={`${bracketStyle} bottom-2 left-2 border-b-2 border-l-2`} />
      <div className={`${bracketStyle} bottom-2 right-2 border-b-2 border-r-2`} />
    </>
  );
}
