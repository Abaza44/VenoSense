/**
 * VeinRenderer — Canvas-based animated vein overlay
 *
 * Renders glowing, pulsing vein paths on a transparent Canvas.
 * Includes scan-line reveal animation and interactive hotspots.
 */

import { VEIN_PATTERNS } from './veinPatterns';

export class VeinRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.phase = 0;
    this.visible = false;
    this.scanProgress = 0;
    this.scanActive = false;
    this._onScanComplete = null;
  }

  /**
   * Start the scan-line reveal animation
   */
  startScan(durationMs = 2500) {
    this.scanProgress = 0;
    this.visible = true;
    this.scanActive = true;
    const startTime = performance.now();

    return new Promise((resolve) => {
      this._onScanComplete = resolve;

      const animate = (now) => {
        this.scanProgress = Math.min(1, (now - startTime) / durationMs);
        if (this.scanProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.scanActive = false;
          if (this._onScanComplete) this._onScanComplete();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  /**
   * Reset to pre-scan state
   */
  reset() {
    this.visible = false;
    this.scanProgress = 0;
    this.scanActive = false;
    this.phase = 0;
  }

  /**
   * Main render loop — call inside requestAnimationFrame
   */
  renderFrame() {
    const { canvas, ctx } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.visible) return;

    this.phase += 0.025;

    // Draw veins
    Object.values(VEIN_PATTERNS).forEach((vein) => {
      this._drawVein(vein, w, h);
    });

    // Draw scan line
    if (this.scanActive) {
      this._drawScanLine(w, h);
    }
  }

  _drawVein(vein, w, h) {
    const { ctx, phase, scanProgress } = this;
    const points = vein.path.map((p) => ({ x: p.x * w, y: p.y * h }));

    // Only reveal veins up to scan line
    const visiblePoints = points.filter((p) => p.y / h <= scanProgress + 0.02);
    if (visiblePoints.length < 2) return;

    const pulseOpacity = 0.45 + 0.35 * Math.sin(phase * 2);

    // Build the smooth curve path
    const buildPath = () => {
      ctx.beginPath();
      ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
      for (let i = 1; i < visiblePoints.length; i++) {
        const prev = visiblePoints[i - 1];
        const curr = visiblePoints[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
      // Connect to last point
      const last = visiblePoints[visiblePoints.length - 1];
      ctx.lineTo(last.x, last.y);
    };

    // Layer 1: Wide outer glow
    buildPath();
    ctx.strokeStyle = vein.color + '25';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Layer 2: Medium glow
    buildPath();
    ctx.strokeStyle = vein.color + '40';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Layer 3: Bright center line
    buildPath();
    ctx.globalAlpha = pulseOpacity;
    ctx.strokeStyle = vein.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Layer 4: Bright core (very thin, white-ish)
    buildPath();
    ctx.globalAlpha = pulseOpacity * 0.6;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Hotspot indicator (only after scan complete)
    if (scanProgress >= 1) {
      const hx = vein.hotspot.x * w;
      const hy = vein.hotspot.y * h;
      const radius = 10 + 3 * Math.sin(phase * 3);

      // Outer pulse ring
      ctx.beginPath();
      ctx.arc(hx, hy, radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = vein.color + '30';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Main circle
      ctx.beginPath();
      ctx.arc(hx, hy, radius, 0, Math.PI * 2);
      ctx.fillStyle = vein.color + '25';
      ctx.fill();
      ctx.strokeStyle = vein.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(hx, hy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Crosshair lines
      const ch = 6;
      ctx.beginPath();
      ctx.moveTo(hx - ch, hy);
      ctx.lineTo(hx + ch, hy);
      ctx.moveTo(hx, hy - ch);
      ctx.lineTo(hx, hy + ch);
      ctx.strokeStyle = vein.color + '60';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  _drawScanLine(w, h) {
    const y = this.scanProgress * h;
    const { ctx } = this;

    // Main scan line
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    ctx.stroke();

    // Glow trail below
    const gradient = ctx.createLinearGradient(0, y, 0, y + 40);
    gradient.addColorStop(0, 'rgba(0, 229, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, w, 40);

    // Slight glow above
    const gradientUp = ctx.createLinearGradient(0, y - 10, 0, y);
    gradientUp.addColorStop(0, 'rgba(0, 229, 255, 0.0)');
    gradientUp.addColorStop(1, 'rgba(0, 229, 255, 0.1)');
    ctx.fillStyle = gradientUp;
    ctx.fillRect(0, y - 10, w, 10);

    ctx.globalAlpha = 1.0;
  }

  /**
   * Hit-test: check if click coordinates are near a vein hotspot
   */
  getHotspotAt(clickX, clickY) {
    if (this.scanProgress < 1) return null;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const threshold = 30;

    for (const [key, vein] of Object.entries(VEIN_PATTERNS)) {
      const hx = vein.hotspot.x * w;
      const hy = vein.hotspot.y * h;
      const dist = Math.sqrt((clickX - hx) ** 2 + (clickY - hy) ** 2);
      if (dist < threshold) {
        return {
          key,
          name: vein.name,
          depth: vein.depth,
          diameter: vein.diameter,
          stability: vein.stability,
          color: vein.color,
          screenX: hx,
          screenY: hy,
        };
      }
    }
    return null;
  }
}
