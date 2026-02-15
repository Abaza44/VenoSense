import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export class HandTracker {
    constructor() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5, // Lower threshold for easier detection
            minTrackingConfidence: 0.5
        });

        this.onResultsCallback = null;
        this.hands.onResults(this.handleResults.bind(this));
        this.camera = null;
    }

    handleResults(results) {
        if (this.onResultsCallback) {
            this.onResultsCallback(results);
        }
    }

    start(videoElement, onResults) {
        this.onResultsCallback = onResults;

        if (this.camera) {
            this.camera.stop();
        }

        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        this.camera.start();
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
    }
}

export const handTracker = new HandTracker();
