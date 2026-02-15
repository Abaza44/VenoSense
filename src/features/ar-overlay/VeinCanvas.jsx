import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { VeinRenderer } from './VeinRenderer';

/**
 * Canvas overlay for vein rendering.
 * Exposes startScan(), reset(), and getHotspotAt() via ref.
 */
const VeinCanvas = forwardRef(function VeinCanvas({ width, height, onClick }, ref) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    rendererRef.current = new VeinRenderer(canvasRef.current);

    const loop = () => {
      rendererRef.current?.renderFrame();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startScan: (duration) => rendererRef.current?.startScan(duration),
    reset: () => rendererRef.current?.reset(),
    getHotspotAt: (x, y) => rendererRef.current?.getHotspotAt(x, y),
  }));

  // Handle canvas clicks
  const handleClick = useCallback(
    (e) => {
      if (!canvasRef.current || !onClick) return;
      const rect = canvasRef.current.getBoundingClientRect();
      // Scale click position to canvas coordinates
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const hotspot = rendererRef.current?.getHotspotAt(x, y);
      if (hotspot) {
        onClick(hotspot);
      }
    },
    [onClick]
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
      style={{ zIndex: 10 }}
    />
  );
});

export default VeinCanvas;
