/**
 * VeinDiagram — Simple SVG arm outline with vein markers.
 * Shows a visual map of where veins were detected.
 */

export default function VeinDiagram({ veins = [], className = '' }) {
  // Map vein names to approximate positions on the arm diagram
  const veinPositions = {
    'Cephalic Vein': { cx: 72, cy: 100, label: 'R' },
    'Basilic Vein': { cx: 38, cy: 110, label: 'L' },
    'Median Cubital Vein': { cx: 55, cy: 80, label: 'M' },
    'Dorsal Venous Network': { cx: 55, cy: 160, label: 'D' },
    'Accessory Cephalic Vein': { cx: 68, cy: 65, label: 'A' },
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 110 200"
        className="w-full h-auto"
        style={{ maxHeight: 220 }}
      >
        {/* Arm outline */}
        <path
          d="M30 10 C25 10, 20 30, 22 60 C24 90, 20 110, 18 140 C16 165, 25 185, 35 195 L75 195 C85 185, 94 165, 92 140 C90 110, 86 90, 88 60 C90 30, 85 10, 80 10 Z"
          fill="rgba(60, 45, 35, 0.4)"
          stroke="rgba(0, 229, 255, 0.15)"
          strokeWidth="1"
        />

        {/* Vein lines (background) */}
        {/* Cephalic */}
        <path
          d="M72 30 Q70 50, 72 70 Q73 90, 72 110 Q71 130, 70 160"
          fill="none"
          stroke="rgba(0, 229, 255, 0.15)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        {/* Basilic */}
        <path
          d="M38 30 Q40 50, 38 70 Q37 90, 38 110 Q39 130, 40 160"
          fill="none"
          stroke="rgba(0, 188, 212, 0.15)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        {/* Median cubital (connecting) */}
        <path
          d="M68 75 Q55 70, 42 75"
          fill="none"
          stroke="rgba(38, 198, 218, 0.15)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Vein measurement points */}
        {veins.map((vein, i) => {
          const pos = veinPositions[vein.name];
          if (!pos) return null;

          const color = vein.stability >= 70 ? '#22c55e' : vein.stability >= 50 ? '#eab308' : '#ef4444';

          return (
            <g key={i}>
              {/* Outer glow */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r="10"
                fill={`${color}15`}
                stroke={`${color}40`}
                strokeWidth="1"
              />
              {/* Inner dot */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r="5"
                fill={`${color}80`}
                stroke={color}
                strokeWidth="1.5"
              >
                <animate
                  attributeName="r"
                  values="4;6;4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Label */}
              <text
                x={pos.cx}
                y={pos.cy + 20}
                textAnchor="middle"
                fill="#7986a0"
                fontSize="7"
                fontFamily="monospace"
              >
                {vein.diameter}mm
              </text>
            </g>
          );
        })}

        {/* "ARM" label */}
        <text x="55" y="195" textAnchor="middle" fill="#7986a030" fontSize="8" fontFamily="monospace">
          FOREARM MAP
        </text>
      </svg>
    </div>
  );
}
