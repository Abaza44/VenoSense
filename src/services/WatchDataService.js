/**
 * WatchDataService.js
 * Simulates real-time data streaming from a connected VeinoWatch.
 * Emits vein coordinates and metadata relative to the wrist position.
 */

// Mock data pattern to cycle through
const MOCK_STREAM_DATA = [
    {
        timestamp: Date.now(),
        connectionStatus: 'connected',
        batteryLevel: 85,
        veins: [
            {
                id: 'v1',
                name: 'Cephalic',
                depth: 3.2,
                diameter: 3.8,
                confidence: 0.95,
                path: [
                    { "x": 0.68, "y": 0.95 }, { "x": 0.66, "y": 0.82 },
                    { "x": 0.63, "y": 0.70 }, { "x": 0.60, "y": 0.58 },
                    { "x": 0.57, "y": 0.46 }, { "x": 0.55, "y": 0.34 }
                ]
            },
            {
                id: 'v2',
                name: 'Basilic',
                depth: 4.5,
                diameter: 2.9,
                confidence: 0.88,
                path: [
                    { "x": 0.34, "y": 0.96 }, { "x": 0.36, "y": 0.84 },
                    { "x": 0.38, "y": 0.72 }, { "x": 0.41, "y": 0.60 },
                    { "x": 0.43, "y": 0.48 }
                ]
            },
            {
                id: 'v3',
                name: 'Median Cubital',
                depth: 2.1,
                diameter: 4.2,
                confidence: 0.98,
                path: [
                    { "x": 0.40, "y": 0.62 }, { "x": 0.45, "y": 0.58 },
                    { "x": 0.50, "y": 0.55 }, { "x": 0.55, "y": 0.53 },
                    { "x": 0.60, "y": 0.52 }
                ]
            },
        ]
    },
    // Pattern 2 (Slightly shifted for "live" feel if we wanted, but let's keep it stable for now to avoid jitter)
    {
        timestamp: Date.now(),
        connectionStatus: 'connected',
        batteryLevel: 84,
        veins: [
            {
                id: 'v1',
                name: 'Cephalic',
                depth: 3.2,
                diameter: 3.9, // Slightly changing metrics
                confidence: 0.96,
                path: [
                    { "x": 0.68, "y": 0.95 }, { "x": 0.66, "y": 0.82 },
                    { "x": 0.63, "y": 0.70 }, { "x": 0.60, "y": 0.58 },
                    { "x": 0.57, "y": 0.46 }, { "x": 0.55, "y": 0.34 }
                ]
            },
            {
                id: 'v2',
                name: 'Basilic',
                depth: 4.5,
                diameter: 2.9,
                confidence: 0.89,
                path: [
                    { "x": 0.34, "y": 0.96 }, { "x": 0.36, "y": 0.84 },
                    { "x": 0.38, "y": 0.72 }, { "x": 0.41, "y": 0.60 },
                    { "x": 0.43, "y": 0.48 }
                ]
            },
            {
                id: 'v3',
                name: 'Median Cubital',
                depth: 2.1,
                diameter: 4.2,
                confidence: 0.98,
                path: [
                    { "x": 0.40, "y": 0.62 }, { "x": 0.45, "y": 0.58 },
                    { "x": 0.50, "y": 0.55 }, { "x": 0.55, "y": 0.53 },
                    { "x": 0.60, "y": 0.52 }
                ]
            },
        ]
    }
];

class WatchDataService {
    constructor() {
        this.subscribers = [];
        this.intervalId = null;
        this.isConnected = false;
        this.mode = 'simulation'; // 'simulation' or 'manual'
    }

    connect() {
        console.log("Searching for VeinoWatch...");
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true;
                if (this.mode === 'simulation') {
                    this.startStreaming();
                }
                console.log("VeinoWatch Connected!");
                resolve(true);
            }, 800);
        });
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'manual') {
            if (this.intervalId) clearInterval(this.intervalId);
        } else {
            if (this.isConnected) this.startStreaming();
        }
    }

    pushData(customVeins) {
        const data = {
            timestamp: Date.now(),
            connectionStatus: 'connected',
            batteryLevel: 90,
            veins: customVeins
        };
        this.notifySubscribers(data);
    }

    disconnect() {
        this.isConnected = false;
        if (this.intervalId) clearInterval(this.intervalId);
        this.subscribers = [];
    }

    startStreaming() {
        if (this.intervalId) clearInterval(this.intervalId);

        // Emit data every 100ms (10Hz update rate)
        this.intervalId = setInterval(() => {
            // Just picking the first static frame for stability in this demo, 
            // but in a real app this would be parsing BLE packets
            const data = { ...MOCK_STREAM_DATA[0], timestamp: Date.now() };
            this.notifySubscribers(data);
        }, 100);
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    notifySubscribers(data) {
        this.subscribers.forEach(cb => cb(data));
    }
}

export const watchService = new WatchDataService();
