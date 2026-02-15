import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage a WebRTC camera stream.
 * Falls back gracefully if camera is unavailable.
 */
export function useCameraStream() {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
        setCameraError(false);
      }
    } catch (err) {
      console.warn('Camera unavailable:', err.message);
      setCameraError(true);
      setCameraReady(true); // Still "ready" — with fallback image
      setErrorMessage(err.message);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    cameraReady,
    cameraError,
    errorMessage,
    startCamera,
    stopCamera,
  };
}
