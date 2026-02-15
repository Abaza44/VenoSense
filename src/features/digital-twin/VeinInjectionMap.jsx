import React, { useState } from 'react';
import { getInjectionHistory } from '../../data/veinData';

const VeinInjectionMap = ({ patientId }) => {
    const history = getInjectionHistory(patientId);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Simple arm silhouette (Left Forearm view)
    // Points relative to 0-100 coordinate space
    const armPath = "M 30,10 C 20,20 15,40 20,90 C 25,95 35,98 45,95 C 60,90 70,80 75,30 C 78,15 70,5 60,5 C 50,5 40,8 30,10 Z";

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success': return '#22c55e'; // Green
            case 'Failed': return '#ef4444'; // Red
            default: return '#eab308'; // Yellow
        }
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 p-4">
            <div className="relative h-[300px] w-[150px]">
                {/* Arm Base */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                    <path d={armPath} fill="#e2cba9" stroke="#d4b483" strokeWidth="1" />

                    {/* Vein Hints (Subtle) */}
                    <path d="M 35,30 Q 40,50 35,80" fill="none" stroke="rgba(0,0,255,0.05)" strokeWidth="2" />
                    <path d="M 60,20 Q 55,50 60,85" fill="none" stroke="rgba(0,0,255,0.05)" strokeWidth="2" />
                </svg>

                {/* Injection Points */}
                {history.map((point) => (
                    <div
                        key={point.id}
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform"
                        style={{
                            backgroundColor: getStatusColor(point.status),
                            left: `${point.x * 100}%`,
                            top: `${point.y * 100}%`,
                            transform: 'translate(-50%, -50%)' // Center the dot
                        }}
                    >
                        {/* Ripple effect for failed/recent */}
                        {point.status === 'Failed' && (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                        )}
                    </div>
                ))}

                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="absolute z-10 bg-black/80 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap"
                        style={{
                            left: `${hoveredPoint.x * 100}%`,
                            top: `${(hoveredPoint.y * 100) - 10}%`,
                            transform: 'translate(-50%, -100%)'
                        }}
                    >
                        <p className="font-bold text-blue-300">{hoveredPoint.veinName}</p>
                        <p>{hoveredPoint.date}</p>
                        <p className={hoveredPoint.status === 'Success' ? 'text-green-400' : 'text-red-400'}>
                            {hoveredPoint.status}
                        </p>
                    </div>
                )}
            </div>

            <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 p-1 rounded">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Success</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Failed</div>
            </div>

            <div className="absolute top-2 left-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Injection History</h3>
            </div>
        </div>
    );
};

export default VeinInjectionMap;
