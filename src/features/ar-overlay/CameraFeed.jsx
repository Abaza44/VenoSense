import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VeinRenderer } from './VeinRenderer';
import { veinEnhancer } from './VeinEnhancer';
import { watchService } from '../../services/WatchDataService';
import { handTracker } from '../../services/HandTracker';
import { Bluetooth, RefreshCw, Hand, AlertTriangle, ScanLine, Eye, Zap } from 'lucide-react';

export default function CameraFeed({ onVeinSelected, injectionHistory = [] }) {
    const videoRef = useRef(null);
    const enhancedRef = useRef(null); // Layer 2: OpenCV Enhanced Output
    const overlayRef = useRef(null);  // Layer 3: AR Veins Overlay
    const rendererRef = useRef(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [watchStatus, setWatchStatus] = useState('disconnected');
    const [handDetected, setHandDetected] = useState(false);
    const [aiStatus, setAiStatus] = useState('initializing'); // initializing, ready, error
    const [renderMode, setRenderMode] = useState('ai'); // 'ai', 'manual'
    const [isMedicalMode, setIsMedicalMode] = useState(false); // New Medical Enhancement Mode

    // Update Renderer with History
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.updateInjectionHistory(injectionHistory);
        }
    }, [injectionHistory]);

    // 1. Initialize Camera & Hand Tracker
    useEffect(() => {
        let aiTimeout;

        if (videoRef.current) {
            // Start timeout to detect AI failure
            aiTimeout = setTimeout(() => {
                if (aiStatus === 'initializing') {
                    console.warn("AI failed to load in time");
                    setAiStatus('error');
                    setRenderMode('manual'); // Auto-fallback
                }
            }, 10000); // 10 seconds timeout

            handTracker.start(videoRef.current, (results) => {
                setCameraReady(true);
                setAiStatus('ready');
                clearTimeout(aiTimeout);

                const hands = results.multiHandLandmarks;
                if (hands && hands.length > 0) {
                    setHandDetected(true);
                    if (rendererRef.current && renderMode === 'ai') {
                        rendererRef.current.updateHandLandmarks(hands[0]);
                    }
                } else {
                    setHandDetected(false);
                    if (rendererRef.current && renderMode === 'ai') {
                        rendererRef.current.updateHandLandmarks(null);
                    }
                }
            });
        }

        // Initialize Vein Enhancer (OpenCV)
        veinEnhancer.init(() => console.log("OpenCV Ready"));

        return () => {
            handTracker.stop();
            clearTimeout(aiTimeout);
        };
    }, []);

    // 2. Initialize Renderer and Loop
    useEffect(() => {
        if (overlayRef.current) {
            rendererRef.current = new VeinRenderer(overlayRef.current);

            let animationId;
            const loop = () => {
                // 1. Process Enhanced Frame (Hidden or Visible based on state)
                if (isMedicalMode && videoRef.current && videoRef.current.readyState === 4 && enhancedRef.current) {
                    veinEnhancer.processFrame(videoRef.current, enhancedRef.current);
                }

                // 2. Render AR Overlay (Always On Top)
                if (rendererRef.current) {
                    // If Medical Mode, Disable Spotlight (false). If Standard, Enable Spotlight (true).
                    const useSpotlight = !isMedicalMode;
                    rendererRef.current.renderFrame(useSpotlight);
                }

                animationId = requestAnimationFrame(loop);
            };
            animationId = requestAnimationFrame(loop);

            return () => cancelAnimationFrame(animationId);
        }
    }, [isMedicalMode]); // Re-bind loop if mode changes

    // 3. Connect to Watch Service
    const handleConnectWatch = async () => {
        setWatchStatus('connecting');
        await watchService.connect();
        setWatchStatus('connected');

        watchService.subscribe((data) => {
            if (rendererRef.current) {
                rendererRef.current.updateVeinData(data.veins);
            }
        });
    };

    const toggleMode = () => {
        const newMode = renderMode === 'ai' ? 'manual' : 'ai';
        setRenderMode(newMode);
        if (rendererRef.current) {
            if (newMode === 'manual') rendererRef.current.updateHandLandmarks(null);
            rendererRef.current.setMode(newMode);
        }
    };

    const toggleMedicalMode = () => {
        setIsMedicalMode(!isMedicalMode);
    };

    // Handle canvas clicks
    const handleCanvasClick = useCallback((e) => {
        if (watchStatus !== 'connected' || !overlayRef.current || !rendererRef.current) return;
        const rect = overlayRef.current.getBoundingClientRect();
        const scaleX = overlayRef.current.width / rect.width;
        const scaleY = overlayRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const vein = rendererRef.current.getHotspotAt(x, y);
        if (vein && onVeinSelected) {
            onVeinSelected(vein);
        }
    }, [watchStatus, onVeinSelected]);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden rounded-lg">
            {/* Layer 1: Raw Video (Scanning Source) - Hidden when Enhanced */}
            <video
                ref={videoRef}
                className={`absolute top-0 left-0 w-full h-full object-cover ${isMedicalMode ? 'opacity-0' : 'opacity-100'}`}
                autoPlay playsInline muted
            />

            {/* Layer 2: Medical Enhanced Canvas (OpenCV Output) - Visible Only when Enhanced */}
            <canvas
                ref={enhancedRef}
                width={640}
                height={480}
                className={`absolute top-0 left-0 w-full h-full object-cover ${isMedicalMode ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Layer 3: AR Overlay Canvas (Veins & UI) - Always Top & Transparent */}
            <canvas
                ref={overlayRef}
                width={640}
                height={480}
                onClick={handleCanvasClick}
                className={`absolute top-0 left-0 w-full h-full object-cover z-10 ${watchStatus === 'connected' ? 'cursor-pointer' : 'cursor-default'}`}
            />

            {/* ISO-Standard Alignment Guide */}
            {(!handDetected || renderMode === 'manual') && (
                <div className={`absolute inset-0 pointer-events-none flex items-center justify-center z-10 transition-opacity duration-300 ${handDetected ? 'opacity-0' : 'opacity-60'}`}>
                    <div className={`
                        relative border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300
                        ${handDetected ? 'border-green-500 scale-95' : 'border-[#00e5ff]/50 animate-pulse scale-100'}
                        w-80 h-[32rem]
                    `}>
                        {!handDetected && (
                            <>
                                <ScanLine className="text-[#00e5ff]/50 mb-4" size={64} />
                                <p className="text-[#00e5ff] font-mono font-bold text-lg bg-black/60 px-4 py-1 rounded">
                                    PLACE HAND HERE
                                </p>
                                <p className="text-[#00e5ff]/70 font-mono text-xs mt-2">
                                    Keep fingers spread slightly
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Medical Mode Banner */}
            {isMedicalMode && (
                <div className="absolute top-0 left-0 right-0 bg-green-900/80 text-green-300 text-xs font-mono py-1 text-center border-b border-green-500 z-30">
                    ENHANCED VISION ENABLED (CLAHE FILTER)
                </div>
            )}

            {/* HUD: Status Indicators */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-20">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${watchStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-white font-mono text-xs tracking-wider uppercase">
                        {watchStatus === 'connected' ? 'WATCH LINK STABLE' : 'WATCH DISCONNECTED'}
                    </span>
                </div>

                <div className="flex gap-2">
                    {/* AI Status */}
                    {!isMedicalMode && (
                        <div className={`flex items-center gap-2 px-2 py-1 rounded backdrop-blur-md ${aiStatus === 'ready' ? 'bg-green-900/40 text-green-400' :
                            aiStatus === 'error' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'
                            }`}>
                            {aiStatus === 'ready' ? <Hand size={14} /> : <AlertTriangle size={14} />}
                            <span className="font-mono text-xs uppercase">
                                {aiStatus === 'ready' ? (handDetected ? 'HAND DETECTED' : 'SEARCHING...') :
                                    aiStatus === 'error' ? 'AI FAILED' : 'LOADING AI...'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Mode Switchers */}
            <div className="absolute top-14 right-4 z-20 flex flex-col gap-2">
                <button
                    onClick={toggleMode}
                    className="bg-gray-900/80 p-2 rounded text-xs font-mono text-white border border-gray-600 hover:bg-gray-700 pointer-events-auto flex items-center justify-end gap-2 w-32"
                >
                    {renderMode === 'ai' ? 'AUTO (AI)' : 'MANUAL'} <Eye size={14} />
                </button>
                <button
                    onClick={toggleMedicalMode}
                    className={`p-2 rounded text-xs font-bold font-mono border pointer-events-auto flex items-center justify-end gap-2 w-32 transition-colors ${isMedicalMode
                        ? 'bg-green-600/90 text-white border-green-400 shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                        : 'bg-gray-900/80 text-gray-400 border-gray-600 hover:text-white'
                        }`}
                >
                    {isMedicalMode ? 'ENHANCE ON' : 'ENHANCE OFF'} <Zap size={14} />
                </button>
            </div>

            {/* Connect Button (if disconnected) */}
            {watchStatus !== 'connected' && (
                <button
                    onClick={handleConnectWatch}
                    disabled={watchStatus === 'connecting'}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-[#00e5ff] text-black rounded-full font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto z-20"
                >
                    {watchStatus === 'connecting' ? (
                        <RefreshCw className="animate-spin" size={18} />
                    ) : (
                        <Bluetooth size={18} />
                    )}
                    {watchStatus === 'connecting' ? 'SYNCING...' : 'SYNC WITH WATCH'}
                </button>
            )}
        </div>
    );
}
