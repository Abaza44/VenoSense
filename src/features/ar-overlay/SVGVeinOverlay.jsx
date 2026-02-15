/**
 * ═══════════════════════════════════════════════════════════════
 * DELIVERABLE 2 — SVG VEIN OVERLAY COMPONENT
 * ═══════════════════════════════════════════════════════════════
 *
 * Drop-in React SVG overlay that renders anatomical vein paths
 * with glow effects, pulse animation, scan-line reveal,
 * and clickable hotspot measurement points.
 *
 * Usage:
 *   <SVGVeinOverlay
 *     width={640}
 *     height={480}
 *     veins={['cephalic', 'basilic', 'medianCubital']}
 *     scanProgress={1.0}
 *     onHotspotClick={(veinData) => { ... }}
 *   />
 */

import { useState, useMemo } from 'react';
import { VEIN_DATASET, getHotspotData, getAllPaths } from '../../data/veinDataset';

export default function SVGVeinOverlay({
  width = 640,
  height = 480,
  veins = ['cephalic', 'basilic', 'medianCubital'],
  scanProgress = 1.0,     // 0–1, controls reveal animation
  showHotspots = true,
  showBranches = true,
  onHotspotClick,
  selectedVeinId = null,
  className = '',
}) {
  const [hoveredVein, setHoveredVein] = useState(null);

  // Build SVG paths from dataset
  const renderedVeins = useMemo(() => {
    return veins.map(veinId => {
      const vein = VEIN_DATASET[veinId];
      if (!vein) return null;

      const allPaths = showBranches ? getAllPaths(veinId) : [
        { points: vein.segments.map(s => ({ x: s.x, y: s.y })), lineWidth: vein.lineWidth, color: vein.color }
      ];

      const hotspot = getHotspotData(veinId);

      return { vein, allPaths, hotspot };
    }).filter(Boolean);
  }, [veins, showBranches]);

  // Convert relative points to SVG smooth path string
  const toSVGPath = (points) => {
    if (points.length < 2) return '';
    const scaled = points.map(p => ({ x: p.x * width, y: p.y * height }));

    // Start at first point
    let d = `M ${scaled[0].x} ${scaled[0].y}`;

    // Smooth Bezier curves through remaining points
    for (let i = 1; i < scaled.length; i++) {
      const prev = scaled[i - 1];
      const curr = scaled[i];
      const mx = (prev.x + curr.x) / 2;
      const my = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`;
    }

    // Connect to final point
    const last = scaled[scaled.length - 1];
    d += ` L ${last.x} ${last.y}`;

    return d;
  };

  // Clip mask for scan-line reveal
  const clipY = scanProgress * height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`absolute top-0 left-0 w-full h-full ${className}`}
      style={{ zIndex: 10, pointerEvents: 'none' }}
    >
      {/* ── SVG DEFS: filters and animations ── */}
      <defs>
        {/* Glow filter for each vein color */}
        <filter id="vein-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0
                    0.8 0 0 0 0.9
                    1 0 0 0 1
                    0 0 0 0.6 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Stronger glow for selected/hovered veins */}
        <filter id="vein-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0
                    0.9 0 0 0 0.95
                    1 0 0 0 1
                    0 0 0 0.8 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Hotspot pulse animation */}
        <filter id="hotspot-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Scan-line reveal clip */}
        <clipPath id="scan-reveal">
          <rect x="0" y="0" width={width} height={clipY} />
        </clipPath>

        {/* Scan-line gradient */}
        <linearGradient id="scanline-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
          <stop offset="80%" stopColor="#00e5ff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* ── SCAN LINE (during scanning) ── */}
      {scanProgress > 0 && scanProgress < 1 && (
        <g>
          {/* Scan trail */}
          <rect x="0" y={Math.max(0, clipY - 40)} width={width} height="40"
            fill="url(#scanline-grad)" opacity="0.8" />
          {/* Bright scan line */}
          <line x1="0" y1={clipY} x2={width} y2={clipY}
            stroke="#00e5ff" strokeWidth="2" opacity="0.9">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.5s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {/* ── VEIN PATHS (clipped by scan progress) ── */}
      <g clipPath="url(#scan-reveal)">
        {renderedVeins.map(({ vein, allPaths, hotspot }) => {
          const isSelected = selectedVeinId === vein.id;
          const isHovered = hoveredVein === vein.id;
          const glowFilter = isSelected || isHovered ? 'url(#vein-glow-strong)' : 'url(#vein-glow-cyan)';

          return (
            <g key={vein.id}>
              {/* Render all paths (main + branches) */}
              {allPaths.map((pathData, pi) => {
                const d = toSVGPath(pathData.points);
                if (!d) return null;

                return (
                  <g key={pi}>
                    {/* Layer 1: Wide outer glow */}
                    <path
                      d={d}
                      fill="none"
                      stroke={pathData.color}
                      strokeWidth={pathData.lineWidth * 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.08}
                      filter={glowFilter}
                    />

                    {/* Layer 2: Medium glow */}
                    <path
                      d={d}
                      fill="none"
                      stroke={pathData.color}
                      strokeWidth={pathData.lineWidth * 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.2}
                    />

                    {/* Layer 3: Main vein line (with pulse animation) */}
                    <path
                      d={d}
                      fill="none"
                      stroke={pathData.color}
                      strokeWidth={pathData.lineWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isSelected ? 0.95 : 0.75}
                    >
                      <animate
                        attributeName="opacity"
                        values={isSelected ? '0.85;1;0.85' : '0.5;0.85;0.5'}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </path>

                    {/* Layer 4: Bright core (white) */}
                    <path
                      d={d}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={Math.max(1, pathData.lineWidth * 0.3)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.25}
                    >
                      <animate
                        attributeName="opacity"
                        values="0.15;0.35;0.15"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </g>
                );
              })}

              {/* ── HOTSPOT MARKER ── */}
              {showHotspots && hotspot && scanProgress >= 1 && (
                <g
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredVein(vein.id)}
                  onMouseLeave={() => setHoveredVein(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onHotspotClick?.(hotspot);
                  }}
                >
                  {/* Pulse ring (expanding) */}
                  <circle
                    cx={hotspot.x * width}
                    cy={hotspot.y * height}
                    r="18"
                    fill="none"
                    stroke={vein.color}
                    strokeWidth="1"
                    opacity="0"
                  >
                    <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Main hotspot circle */}
                  <circle
                    cx={hotspot.x * width}
                    cy={hotspot.y * height}
                    r={isHovered || isSelected ? 14 : 10}
                    fill={`${vein.color}25`}
                    stroke={vein.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter="url(#hotspot-glow)"
                    style={{ transition: 'r 0.2s ease' }}
                  >
                    <animate attributeName="r"
                      values={isSelected ? '13;15;13' : '9;11;9'}
                      dur="1.5s" repeatCount="indefinite" />
                  </circle>

                  {/* Center dot */}
                  <circle
                    cx={hotspot.x * width}
                    cy={hotspot.y * height}
                    r="3"
                    fill="#ffffff"
                    opacity="0.9"
                  />

                  {/* Crosshair lines */}
                  <line
                    x1={hotspot.x * width - 7} y1={hotspot.y * height}
                    x2={hotspot.x * width + 7} y2={hotspot.y * height}
                    stroke={vein.color} strokeWidth="1" opacity="0.5"
                  />
                  <line
                    x1={hotspot.x * width} y1={hotspot.y * height - 7}
                    x2={hotspot.x * width} y2={hotspot.y * height + 7}
                    stroke={vein.color} strokeWidth="1" opacity="0.5"
                  />

                  {/* Tiny label */}
                  <text
                    x={hotspot.x * width + 16}
                    y={hotspot.y * height + 4}
                    fill={vein.color}
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    opacity="0.7"
                  >
                    {hotspot.diameter}mm
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* ── CORNER BRACKETS (HUD aesthetic) ── */}
      <g stroke="rgba(0,229,255,0.3)" strokeWidth="1.5" fill="none">
        <polyline points={`10,30 10,10 30,10`} />
        <polyline points={`${width - 30},10 ${width - 10},10 ${width - 10},30`} />
        <polyline points={`10,${height - 30} 10,${height - 10} 30,${height - 10}`} />
        <polyline points={`${width - 30},${height - 10} ${width - 10},${height - 10} ${width - 10},${height - 30}`} />
      </g>
    </svg>
  );
}
