
export class VeinEnhancer {
    constructor() {
        this.cv = null;
        this.ready = false;
        this.checkInterval = null;
    }

    /**
     * Waits for OpenCV.js to be fully loaded into window.cv
     */
    init(onReady) {
        if (window.cv && window.cv.Mat) {
            this.cv = window.cv;
            this.ready = true;
            if (onReady) onReady();
            return;
        }

        // Poll for CV
        this.checkInterval = setInterval(() => {
            if (window.cv && window.cv.Mat) {
                this.cv = window.cv;
                this.ready = true;
                clearInterval(this.checkInterval);
                if (onReady) onReady();
            }
        }, 100);
    }

    /**
     * Process video frame to enhance veins
     * @param {HTMLVideoElement} video 
     * @param {HTMLCanvasElement} canvas 
     */
    processFrame(video, canvas) {
        if (!this.ready || !this.cv) return;

        const cv = this.cv;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // 1. Draw video to canvas first (source)
        ctx.drawImage(video, 0, 0, width, height);

        // 2. Read from canvas to Mat
        let src = cv.imread(canvas);
        let dst = new cv.Mat();

        // 3. Convert to Grayscale or extract Green Channel 
        // (Veins contrast best in Green/NIR, here we simulate with Green)
        let rgbaPlanes = new cv.MatVector();
        cv.split(src, rgbaPlanes);
        let greenChannel = rgbaPlanes.get(1); // 0:R, 1:G, 2:B, 3:A (Wait, usually BGR in CV, but canvas is RGBA)
        // Check: ImageData is RGBA. cv.imread reads as RGBA.
        // So 0=R, 1=G, 2=B, 3=A. 
        // Actually, blood absorbs Green light well, causing veins to appear dark.
        // So we want to invert the Green channel or enhance contrast on it.

        // 4. CLAHE (Contrast Limited Adaptive Histogram Equalization)
        let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
        clahe.apply(greenChannel, dst);

        // 5. Invert to make veins light? Or keep dark?
        // Let's keep them dark but enhance surroundings.
        // Or apply a colormap to make it look "medical heat map"

        // Let's try simple CLAHE result first (Grayscale high contrast)
        // Maybe colorize: Apply colormap (COLORMAP_BONE or JET)
        // cv.applyColorMap(dst, dst, cv.COLORMAP_JET); // Needs 3 channels

        // For now, render the high-contrast Green channel
        cv.imshow(canvas, dst);

        // Cleanup
        src.delete();
        dst.delete();
        rgbaPlanes.delete();
        greenChannel.delete();
        clahe.delete();
    }
}

export const veinEnhancer = new VeinEnhancer();
