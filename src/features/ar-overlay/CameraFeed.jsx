import { useEffect } from 'react';
import { useCameraStream } from './useCameraStream';

/**
 * Renders camera video feed or a static fallback image.
 */
export default function CameraFeed({ onReady }) {
  const { videoRef, cameraReady, cameraError, startCamera } = useCameraStream();

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (cameraReady && onReady) {
      onReady({ useFallback: cameraError });
    }
  }, [cameraReady, cameraError, onReady]);

  if (cameraError) {
    // Fallback: gradient background simulating an arm
    return (
      <div
        className="w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #2d1f1a 0%, #3d2b22 30%, #4a3328 50%, #3d2b22 70%, #2d1f1a 100%)',
        }}
      >
        {/* Subtle arm-like shape overlay */}
        <div
          className="w-full h-full opacity-20"
          style={{
            background: `
              radial-gradient(ellipse 60% 100% at 50% 50%, rgba(80, 60, 45, 0.5) 0%, transparent 70%),
              radial-gradient(ellipse 30% 80% at 45% 40%, rgba(100, 75, 55, 0.3) 0%, transparent 60%)
            `,
          }}
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  );
}
