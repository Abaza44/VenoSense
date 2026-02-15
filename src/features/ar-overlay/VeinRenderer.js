/**
 * Renders animated vein paths on a Canvas overlay.
 * Supports multi-point path rendering from JSON data.
 * Anchors veins to Detected Hand Landmarks (AI Mode) or Static Frame (Manual Mode).
 */

export class VeinRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.phase = 0;
        this.visible = true;
        this.veins = [];
        this.injectionHistory = []; // New
        this.handLandmarks = null;
        this.mode = 'ai'; // 'ai' or 'manual'
    }

    updateVeinData(veins) {
        this.veins = veins;
        // Simple Heuristic: Best vein has largest diameter and shallowest depth (Ratio?)
        // Let's prioritize Diameter for stickability, then Depth.
        // Score = Diameter - (Depth * 0.5)
        let bestScore = -Infinity;
        this.bestVeinId = null;

        veins.forEach(v => {
            const score = v.diameter - (v.depth * 0.2); // Arbitrary weight
            if (score > bestScore) {
                bestScore = score;
                this.bestVeinId = v.id;
            }
        });
    }

    updateInjectionHistory(history) {
        this.injectionHistory = history;
    }

    updateHandLandmarks(landmarks) {
        this.handLandmarks = landmarks;
    }

    setMode(mode) {
        this.mode = mode;
    }

    renderFrame(enableSpotlight = true) {
        const { canvas, ctx } = this;
        const w = canvas.width;
        const h = canvas.height;

        // Clear for next frame (Transparent Overlay)
        ctx.clearRect(0, 0, w, h);

        this.phase += 0.02;

        if (this.mode === 'manual') {
            this.renderManualMode(w, h);
        } else {
            // AI Mode
            if (this.handLandmarks) {
                this.renderVeinsOnHand(w, h, enableSpotlight); // Pass spotlight flag
                this.renderDebugLandmarks(w, h);
            } else {
                this.renderScanningState(w, h);
            }
        }
    }

    renderManualMode(w, h) {
        // Define a static frame in the center of the screen
        const handFrame = {
            wrist: { x: 0.5, y: 0.8 },      // Wrist at bottom center
            elbowX: 0.5,                    // Elbow straight up...
            elbowY: 0.2,                    // ...at top center
            armWidth: 0.35,                 // Fixed relative width
            angle: 0
        };

        // Render veins into this static frame
        if (this.veins.length > 0) {
            this.veins.forEach(vein => {
                this.drawVein(vein, w, h, handFrame, 1.0);
            });
        }
    }

    renderScanningState(w, h) {
        const { ctx, phase } = this;
        const cx = w / 2;
        const cy = h / 2;
        const size = 150;

        ctx.strokeStyle = `rgba(0, 229, 255, ${0.5 + 0.5 * Math.sin(phase * 4)})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
        ctx.setLineDash([]);

        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("AI SCANNING...", cx, cy + size / 2 + 20);
    }

    renderDebugLandmarks(w, h) {
        const landmarks = this.handLandmarks;
        const ctx = this.ctx;

        ctx.fillStyle = "#00e5ff";
        landmarks.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * w, p.y * h, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    renderVeinsOnHand(w, h, useSpotlight = true) {
        const landmarks = this.handLandmarks;
        // ... (standard vars extraction) ...
        const wrist = landmarks[0];
        const middleKnuckle = landmarks[9];
        const indexKnuckle = landmarks[5];
        const pinkyKnuckle = landmarks[17];

        const vx = middleKnuckle.x - wrist.x;
        const vy = middleKnuckle.y - wrist.y;
        const handScale = Math.sqrt(vx * vx + vy * vy);

        const widthX = pinkyKnuckle.x - indexKnuckle.x;
        const widthY = pinkyKnuckle.y - indexKnuckle.y;
        const handWidth = Math.sqrt(widthX * widthX + widthY * widthY);

        const dirX = -vx / handScale;
        const dirY = -vy / handScale;
        const forearmLength = handScale * 3.5;
        const startX = wrist.x;
        const startY = wrist.y;
        const endX = startX + dirX * forearmLength;
        const endY = startY + dirY * forearmLength;
        const armWidth = handWidth * 1.8;

        // --- VISUAL ISOLATION ---
        if (useSpotlight) {
            // Only dim background in Standard AR Mode to focus spotlight
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.shadowColor = "rgba(0,0,0,1)";
            this.ctx.shadowBlur = 30;

            // Cut out Arm
            this.drawArmPath(this.ctx, w, h, startX, startY, endX, endY, armWidth);
            this.ctx.fillStyle = "black";
            this.ctx.fill();

            // Cut out Hand
            const handCx = (wrist.x + middleKnuckle.x) / 2 * w;
            const handCy = (wrist.y + middleKnuckle.y) / 2 * h;
            const handRadius = handWidth * w * 0.8;
            this.ctx.beginPath();
            this.ctx.arc(handCx, handCy, handRadius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowBlur = 0;
            this.ctx.globalCompositeOperation = 'source-over';
        }

        // Draw Focus Border (Optional, looks cool in both modes)
        this.ctx.strokeStyle = !useSpotlight ? "rgba(0, 229, 255, 0.4)" : "#00e5ff";
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash(!useSpotlight ? [5, 5] : []);
        this.drawArmPath(this.ctx, w, h, startX, startY, endX, endY, armWidth);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // --- DEBUG VISUALIZATION (Optional Border) ---
        // this.drawDebugArmBox(w, h, startX, startY, endX, endY, armWidth); // Disabled in favor of isolation mask

        // Draw a "Focus Frame" border for cool effect
        this.ctx.strokeStyle = "#00e5ff";
        this.ctx.lineWidth = 2;
        this.drawArmPath(this.ctx, w, h, startX, startY, endX, endY, armWidth);
        this.ctx.stroke();

        // Pass this frame to vein drawing
        this.veins.forEach(vein => {
            this.drawVein(vein, w, h, {
                startX, startY, // Wrist (Y=1 in Vein Data usually)
                endX, endY,     // Elbow (Y=0 in Vein Data usually)
                armWidth
            }, 1.0);
        });

        // Draw Injection History
        if (this.injectionHistory && this.injectionHistory.length > 0) {
            this.renderInjectionHistory(w, h, {
                startX, startY,
                endX, endY,
                armWidth
            });
        }
    }

    renderInjectionHistory(w, h, handFrame) {
        const { ctx, phase } = this;
        const { startX, startY, endX, endY, armWidth } = handFrame;

        // Vector: Elbow -> Wrist
        const armVecX = startX - endX;
        const armVecY = startY - endY;
        const vecLen = Math.sqrt(armVecX ** 2 + armVecY ** 2) || 1;

        // Perpendicular vector
        const perpX = -armVecY * (armWidth / vecLen);
        const perpY = armVecX * (armWidth / vecLen);

        this.injectionHistory.forEach(inj => {
            // Map normalized coordinates (x,y) to screen space
            // Same logic as drawVein
            const py = inj.y; // 0=Elbow, 1=Wrist (approx)
            const px = inj.x - 0.5;

            const lx = endX + py * armVecX;
            const ly = endY + py * armVecY;

            const finalX = (lx + px * perpX) * w;
            const finalY = (ly + px * perpY) * h;

            const color = inj.status === 'Success' ? '#22c55e' : '#ef4444';

            // Draw Marker
            ctx.beginPath();
            ctx.arc(finalX, finalY, 6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Pulse Ring
            ctx.beginPath();
            ctx.arc(finalX, finalY, 6 + 4 * Math.sin(phase * 3), 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label (optional)
            ctx.fillStyle = "white";
            ctx.font = "10px monospace";
            ctx.fillText(inj.date, finalX + 10, finalY);
        });
    }

    drawArmPath(ctx, w, h, sx, sy, ex, ey, width) {
        // Perpendicular Vector for Width
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const px = -dy / len * (width / 2);
        const py = dx / len * (width / 2);

        // 4 Corners of Forearm Box
        const tl = { x: (ex + px) * w, y: (ey + py) * h };
        const tr = { x: (ex - px) * w, y: (ey - py) * h };
        const br = { x: (sx - px) * w, y: (sy - py) * h };
        const bl = { x: (sx + px) * w, y: (sy + py) * h };

        ctx.beginPath();
        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();
    }

    drawDebugArmBox(w, h, sx, sy, ex, ey, width) {
        const ctx = this.ctx;

        // Perpendicular Vector for Width
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const px = -dy / len * (width / 2);
        const py = dx / len * (width / 2);

        // 4 Corners of Forearm Box
        const tl = { x: (ex + px) * w, y: (ey + py) * h }; // Elbow Left
        const tr = { x: (ex - px) * w, y: (ey - py) * h }; // Elbow Right
        const br = { x: (sx - px) * w, y: (sy - py) * h }; // Wrist Right
        const bl = { x: (sx + px) * w, y: (sy + py) * h }; // Wrist Left

        ctx.beginPath();
        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();

        ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"; // Green
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
        ctx.fill();

        ctx.fillStyle = "#00ff00";
        ctx.font = "12px monospace";
        ctx.fillText("FOREARM ZONE", (sx + ex) / 2 * w, (sy + ey) / 2 * h);
    }

    drawVein(vein, w, h, handFrame, opacityMultiplier = 1.0) {
        const { ctx, phase } = this;
        // Unpack Frame: start=Wrist, end=Elbow
        const { startX, startY, endX, endY, armWidth } = handFrame;

        let points = [];
        const rawPath = vein.path || [{ x: vein.x, y: vein.y }];

        // Vector along arm (Elbow -> Wrist) if Y=0 is elbow and Y=1 is wrist?
        // Or Y=0 Top and Y=1 Bottom? 
        // Let's assume Vein Data Y: 0=Elbow(Top), 1=Wrist(Bottom)

        // Vector: Elbow -> Wrist
        const armVecX = startX - endX;
        const armVecY = startY - endY;

        // Perpendicular vector
        const vecLen = Math.sqrt(armVecX ** 2 + armVecY ** 2) || 1;
        const perpX = -armVecY * (armWidth / vecLen);
        const perpY = armVecX * (armWidth / vecLen);

        points = rawPath.map(p => {
            // Y component (Position along length: 0=Elbow, 1=Wrist)
            const py = p.y;

            // Center line point at this Y
            const lx = endX + py * armVecX; // Start at Elbow + ratio * length
            const ly = endY + py * armVecY;

            // X component (Position across width: 0.5=Center)
            const px = p.x - 0.5;

            // Wait, perp vector magnitude logic:
            // perpX/Y uses (width / len). Width is full width?
            // If armWidth is full width, then perp magnitude is full width.
            // px goes -0.5 to 0.5. 
            // So Magnitude * 0.5 = Half Width. 
            // So just `+ px * perpX` would be correct scale if magnitude is full width.
            // Let's check: perp magnitude is `armWidth`. 
            // px is -0.5. Result is -0.5 * armWidth. Correct (half width left).

            const finalX = lx + px * perpX;
            const finalY = ly + px * perpY;

            return { x: finalX * w, y: finalY * h };
        });

        if (points.length < 2 && rawPath.length > 1) return;

        const pulseOpacity = (0.5 + 0.3 * Math.sin(phase * 2)) * opacityMultiplier;

        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const midX = (prev.x + curr.x) / 2;
                const midY = (prev.y + curr.y) / 2;
                ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }

            const isBest = vein.id === this.bestVeinId;
            const color = isBest ? "rgba(74, 222, 128, " : "rgba(0, 229, 255, "; // Green vs Cyan

            ctx.strokeStyle = `${color}${0.4 * opacityMultiplier})`;
            ctx.lineWidth = (vein.diameter || 3) * 3;
            ctx.lineCap = "round";
            ctx.stroke();

            ctx.strokeStyle = `${color}${pulseOpacity})`;
            ctx.lineCap = "round";
            ctx.lineWidth = (vein.diameter || 3);
            ctx.stroke();

            // Label
            if (isBest && points.length > 0) {
                const mp = points[Math.floor(points.length / 2)];
                ctx.fillStyle = "#4ade80";
                ctx.font = "bold 12px monospace";
                ctx.fillText("★ BEST SITE", mp.x + 10, mp.y);
            }
        } else if (points.length === 1) {
            // Fallback for single points (no path)
            const p = points[0];
            const isBest = vein.id === this.bestVeinId;
            const color = isBest ? "rgba(74, 222, 128, " : "rgba(0, 229, 255, ";

            ctx.fillStyle = `${color}${pulseOpacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, (vein.diameter || 3) * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Halo
            ctx.strokeStyle = `${color}${0.4 * opacityMultiplier})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            if (isBest) {
                ctx.fillStyle = "#4ade80";
                ctx.font = "bold 12px monospace";
                ctx.fillText("★ BEST SITE", p.x + 12, p.y);
            }
        }
    }

    getHotspotAt(clickX, clickY) {
        if (this.veins.length > 0) return this.veins[0];
        return null;
    }
}
