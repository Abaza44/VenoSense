import React, { useState, useEffect } from 'react';
import CameraFeed from './CameraFeed';
import { ArrowRight, Activity, Droplet, Settings, Play, ScanLine, Code, Hand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { watchService } from '../../services/WatchDataService';

// Default JSON provided by user
const DEFAULT_JSON_DATA = [
    {
        "id": 1,
        "name": "Cephalic",
        "depth": 4.2,
        "diameter": 3.1,
        "path": [
            { "x": 0.68, "y": 0.95 },
            { "x": 0.66, "y": 0.82 },
            { "x": 0.63, "y": 0.70 },
            { "x": 0.60, "y": 0.58 },
            { "x": 0.57, "y": 0.46 },
            { "x": 0.55, "y": 0.34 },
            { "x": 0.53, "y": 0.22 }
        ]
    },
    {
        "id": 2,
        "name": "Basilic",
        "depth": 6.8,
        "diameter": 3.8,
        "path": [
            { "x": 0.34, "y": 0.96 },
            { "x": 0.36, "y": 0.84 },
            { "x": 0.38, "y": 0.72 },
            { "x": 0.41, "y": 0.60 },
            { "x": 0.43, "y": 0.48 },
            { "x": 0.45, "y": 0.36 },
            { "x": 0.47, "y": 0.24 }
        ]
    },
    {
        "id": 3,
        "name": "Median Cubital",
        "depth": 3.5,
        "diameter": 4.0,
        "path": [
            { "x": 0.40, "y": 0.62 },
            { "x": 0.45, "y": 0.58 },
            { "x": 0.50, "y": 0.55 },
            { "x": 0.55, "y": 0.53 },
            { "x": 0.60, "y": 0.52 }
        ]
    }
];

// ... previous imports
import { useSearchParams } from 'react-router-dom';
import { getPatientData, getInjectionHistory } from '../../data/veinData';

const AROverlayPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedVein, setSelectedVein] = useState(null);
    const [showControls, setShowControls] = useState(true);
    const [inputMode, setInputMode] = useState('json');
    const [patientName, setPatientName] = useState(null);
    const [history, setHistory] = useState([]); // New State

    // JSON Input State
    const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_JSON_DATA, null, 2));

    useEffect(() => {
        watchService.setMode('simulation');
        if (!watchService.isConnected) {
            watchService.connect();
        }

        // Check for patientId in URL
        const patientId = searchParams.get('patientId');
        if (patientId) {
            const patient = getPatientData(patientId);
            if (patient) {
                setPatientName(patient.name);

                // Load history
                const patientHistory = getInjectionHistory(patientId);
                setHistory(patientHistory);

                // Convert patient vein data to AR format
                // The AR view expects an array of objects with { id, name, depth, diameter, path: [{x,y}] }
                const arData = Object.values(patient.veinData).map((v, index) => ({
                    id: index + 1,
                    name: v.name,
                    depth: v.summary.avgDepth,
                    diameter: v.summary.avgDiameter,
                    // Map segments to 2D path (using x, y)
                    path: v.segments.map(s => ({ x: s.x, y: s.y }))
                }));

                setJsonInput(JSON.stringify(arData, null, 2));

                // Auto-push after a short delay to ensure connection
                setTimeout(() => {
                    watchService.pushData(arData);
                    setShowControls(false); // Hide controls since we loaded data automatically
                }, 500);
            }
        }

        return () => {
            // watchService.disconnect();
        };
    }, [searchParams]);

    const handlePushData = () => {
        try {
            const data = JSON.parse(jsonInput);
            watchService.pushData(data);
            setShowControls(false); // Auto-hide on success
        } catch (e) {
            alert("Invalid JSON format");
        }
    };

    const handleVeinSelected = (vein) => {
        setSelectedVein(vein);
    };

    const handleAnalyze = () => {
        if (selectedVein) {
            navigate('/recommend');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-white relative">
            <div className="flex-1 relative overflow-hidden">
                <CameraFeed onVeinSelected={handleVeinSelected} injectionHistory={history} />

                {/* Hand Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-70">
                    <div className="relative border-4 border-dashed border-[#00e5ff]/50 rounded-3xl flex flex-col items-center justify-center animate-pulse w-64 h-96">
                        <ScanLine size={48} className="text-[#00e5ff]/50 mb-4" />
                        <p className="text-[#00e5ff] font-mono font-bold text-sm bg-black/50 px-2 rounded">
                            ALIGN HAND HERE
                        </p>
                    </div>
                </div>

                {/* Patient Banner */}
                {patientName && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/60 backdrop-blur-md border border-[#00e5ff] px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                        <Activity size={16} className="text-[#00e5ff] animate-pulse" />
                        <span className="text-white font-bold text-sm tracking-wide">
                            SCANNING: <span className="text-[#00e5ff]">{patientName}</span>
                        </span>
                    </div>
                )}

                {/* Simulation Controls Toggle */}
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="absolute top-4 right-4 z-40 bg-gray-900/80 p-2 rounded-full text-white hover:bg-gray-800 border border-gray-600"
                >
                    <Settings size={20} />
                </button>

                {/* Data Entry Panel */}
                {showControls && (
                    <div className="absolute top-16 right-4 z-40 bg-gray-900/95 border border-gray-700 p-4 rounded-xl w-80 shadow-2xl backdrop-blur-md max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                            <h4 className="text-sm font-bold text-gray-300">Data Injection</h4>
                            <div className="flex bg-gray-800 rounded p-1">
                                <button
                                    onClick={() => setInputMode('json')}
                                    className={`p-1 rounded ${inputMode === 'json' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
                                >
                                    <Code size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <p className="text-[10px] text-gray-400 mb-2">
                                Paste JSON configuration for vein paths.
                            </p>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-64 bg-gray-800 border border-gray-600 rounded p-2 text-[10px] font-mono text-[#00e5ff] resize-none focus:outline-none focus:border-[#00e5ff]"
                                spellCheck="false"
                            />
                        </div>

                        <button
                            onClick={handlePushData}
                            className="w-full mt-4 py-3 bg-[#00e5ff] text-black font-bold text-sm rounded hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                        >
                            <Play size={16} fill="black" />
                            PROJECT DATA
                        </button>
                    </div>
                )}

                {/* Result Modal */}
                {selectedVein && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 border border-[#00e5ff] p-5 rounded-xl shadow-[0_0_30px_rgba(0,229,255,0.4)] w-80 animate-scaleIn z-30 backdrop-blur-sm">
                        <button
                            onClick={() => setSelectedVein(null)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-bold text-[#00e5ff] mb-1">{selectedVein.name}</h3>
                        <div className="w-full h-px bg-gray-700 mb-3"></div>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm flex items-center gap-2">
                                    <Activity size={14} /> Diameter
                                </span>
                                <span className="text-white font-mono">{selectedVein.diameter} mm</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm flex items-center gap-2">
                                    <Droplet size={14} /> Depth
                                </span>
                                <span className="text-white font-mono">{selectedVein.depth} mm</span>
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            className="w-full py-2 bg-[#00e5ff] text-black font-bold rounded hover:bg-white transition-colors flex items-center justify-center gap-2"
                        >
                            Get Recommendation <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};
export default AROverlayPage;
