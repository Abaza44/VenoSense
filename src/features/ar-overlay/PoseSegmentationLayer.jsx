import { VeinRenderer } from './VeinRenderer';
import { watchService } from '../../services/WatchDataService'; // To get vein data

const PoseSegmentationLayer = ({ onPoseDetected }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("PoseSegmentationLayer mounted");
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;

        // Initialize Renderer
        if (canvasElement) {
            try {
                rendererRef.current = new VeinRenderer(canvasElement);
                console.log("VeinRenderer initialized");
                // Load default data (or fetch from service)
                // For MVP, we can grab from service if connected, or default.
                // Let's subscribe similarly to CameraFeed
                const sub = watchService.subscribe((data) => {
                    if (rendererRef.current) {
                        rendererRef.current.updateVeinData(data.veins);
                    }
                });
                // Initial pull
                const currentData = watchService.currentData;
                if (currentData) rendererRef.current.updateVeinData(currentData.veins);

                return () => sub.unsubscribe && sub.unsubscribe();
            } catch (e) {
                console.error("Failed to initialize VeinRenderer:", e);
                setError("Renderer Initialization Failed");
            }
        }
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        // const canvasCtx = canvasElement.getContext('2d'); // Renderer handles 2D context now

        if (!videoElement || !canvasElement) {
            console.error("Missing video or canvas ref");
            setError("DOM Elements Missing");
            return;
        }

        const pose = new Pose({
            locateFile: (file) => {
                const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                console.log("Loading MediaPipe file:", url);
                return url;
            }
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
            // LOGGING ONLY ONCE TO AVOID SPAM
            if (window.frameCount === undefined) window.frameCount = 0;
            if (window.frameCount++ % 100 === 0) console.log("Pose Loop Running...");
            console.log("Pose Results Received:", !!results.poseLandmarks);

            if (!canvasRef.current || !rendererRef.current) return;
            const renderer = rendererRef.current;

            // Clear canvas and draw video frame (handled by renderer usually?
            // In VeinRenderer, renderFrame expects to own the loop.
            // Here, MediaPipe owns the loop via onResults.
            // So we can manually trigger renderer methods here.)

            const w = canvasElement.width;
            const h = canvasElement.height;
            const ctx = canvasElement.getContext('2d');

            // Draw Video
            ctx.save();
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(results.image, 0, 0, w, h);
            ctx.restore();

            // Extract Landmarks
            if (results.poseLandmarks) {
                const landmarks = results.poseLandmarks;

                // Check for Arm Confidence (Left vs Right)
                // 11: Left Shoulder, 13: Left Elbow, 15: Left Wrist (User's left, screen right usually)
                // 12: Right Shoulder, 14: Right Elbow, 16: Right Wrist

                const leftConf = (landmarks[11].visibility + landmarks[13].visibility + landmarks[15].visibility) / 3;
                const rightConf = (landmarks[12].visibility + landmarks[14].visibility + landmarks[16].visibility) / 3;

                let activeArm = null;
                // Threshold
                if (leftConf > rightConf && leftConf > 0.5) {
                    activeArm = {
                        side: 'left',
                        shoulder: landmarks[11],
                        elbow: landmarks[13],
                        wrist: landmarks[15]
                    };
                } else if (rightConf > 0.5) {
                    activeArm = {
                        side: 'right',
                        shoulder: landmarks[12],
                        elbow: landmarks[14],
                        wrist: landmarks[16]
                    };
                }

                if (activeArm) {
                    // Use the NEW method in VeinRenderer
                    if (renderer.renderVeinsOnArm) {
                        renderer.renderVeinsOnArm(w, h, activeArm);
                    } else {
                        console.warn("renderVeinsOnArm missing on renderer");
                    }

                    if (onPoseDetected) onPoseDetected(activeArm);
                } else {
                    // Draw Skeleton Debug if no clear arm
                    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                    drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1 });

                    ctx.fillStyle = "rgba(0,0,0,0.5)";
                    ctx.fillRect(0, 0, w, h);
                    ctx.fillStyle = "white";
                    ctx.font = "20px monospace";
                    ctx.textAlign = "center";
                    ctx.fillText("POSITION ARM CLEARLY", w / 2, h / 2);
                }
            }
        });

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await pose.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        console.log("Starting Camera...");
        camera.start()
            .then(() => {
                console.log("Camera started");
                setIsLoading(false);
            })
            .catch(e => {
                console.error("Camera failed to start:", e);
                setError("Camera Access Denied or Failed");
                setIsLoading(false);
            });

        return () => {
            console.log("Detailed cleanup");
            camera.stop();
            pose.close();
        };
    }, []);

    return (
        <div className="relative w-full h-full bg-black">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover hidden" // Library uses it, but we don't show it directly
                playsInline
            />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
                width={640}
                height={480}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-[#00e5ff] z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e5ff] mb-2"></div>
                        <p className="font-mono text-xs">INITIALIZING MEDIAPIPE POSE...</p>
                    </div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-red-500 z-50 p-4">
                    <div className="flex flex-col items-center text-center">
                        <p className="font-bold text-lg mb-2">Initialization Failed</p>
                        <p className="font-mono text-xs mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-600 hover:bg-gray-700">
                            RELOAD
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoseSegmentationLayer;
