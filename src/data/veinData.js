/**
 * ═══════════════════════════════════════════════════════════════
 * DELIVERABLE 2 — MULTI-PATIENT VEIN DATABASE
 * ═══════════════════════════════════════════════════════════════
 *
 * Comprehensive dummy vein dataset simulating a diverse patient population.
 * Includes profiles for:
 *   - Standard Male (High muscle mass, prominent veins)
 *   - Standard Female (Average build, good access)
 *   - Pediatric (Small, shallow, mobile veins)
 *   - Geriatric (Large but fragile/rolling veins)
 *   - Difficult Access (Deep veins, low visibility)
 *
 * All coordinates are RELATIVE (0–1).
 */

// ─── BASE VEIN TEMPLATES ─────────────────────────────────────
// We use a base template and modify it per patient to avoid huge code duplication
// while still allowing unique physiological traits.

const BASE_PATHS = {
    cephalic: [
        { x: 0.64, y: 0.94 }, { x: 0.63, y: 0.86 }, { x: 0.61, y: 0.76 },
        { x: 0.58, y: 0.65 }, { x: 0.55, y: 0.54 }, { x: 0.52, y: 0.44 },
        { x: 0.50, y: 0.34 }, { x: 0.48, y: 0.24 }, { x: 0.46, y: 0.14 }, { x: 0.45, y: 0.06 }
    ],
    basilic: [
        { x: 0.36, y: 0.94 }, { x: 0.37, y: 0.86 }, { x: 0.38, y: 0.76 },
        { x: 0.39, y: 0.65 }, { x: 0.41, y: 0.55 }, { x: 0.43, y: 0.45 },
        { x: 0.44, y: 0.35 }, { x: 0.46, y: 0.25 }, { x: 0.47, y: 0.15 }, { x: 0.48, y: 0.06 }
    ],
    medianCubital: [
        { x: 0.54, y: 0.40 }, { x: 0.52, y: 0.37 }, { x: 0.50, y: 0.34 },
        { x: 0.47, y: 0.33 }, { x: 0.45, y: 0.35 }, { x: 0.43, y: 0.38 }
    ],
    accessoryCephalic: [
        { x: 0.68, y: 0.80 }, { x: 0.70, y: 0.70 }, { x: 0.71, y: 0.60 },
        { x: 0.70, y: 0.50 }, { x: 0.67, y: 0.42 }
    ],
    dorsalArch: [
        { x: 0.40, y: 0.92 }, { x: 0.45, y: 0.90 }, { x: 0.50, y: 0.88 },
        { x: 0.55, y: 0.90 }, { x: 0.60, y: 0.92 }
    ]
};

// ─── PATIENT PROFILES GENERATOR ──────────────────────────────

function generateVeinData(profile) {
    const { id, type, modifiers } = profile;

    const applyVariance = (val, variance = 0.1) => val * (1 + (Math.random() - 0.5) * variance);

    return {
        cephalic: createVein('cephalic', 'Cephalic Vein', BASE_PATHS.cephalic, modifiers, '#00e5ff'),
        basilic: createVein('basilic', 'Basilic Vein', BASE_PATHS.basilic, modifiers, '#00bcd4'),
        medianCubital: createVein('medianCubital', 'Median Cubital', BASE_PATHS.medianCubital, modifiers, '#26c6da', true),
        accessoryCephalic: createVein('accessoryCephalic', 'Accessory Cephalic', BASE_PATHS.accessoryCephalic, modifiers, '#4dd0e1'),
        dorsalArch: createVein('dorsalArch', 'Dorsal Arch', BASE_PATHS.dorsalArch, modifiers, '#80deea'),
    };
}

function createVein(id, name, path, mods, color, isGolden = false) {
    const depthBase = isGolden ? mods.depth * 0.8 : mods.depth;
    const diameterBase = isGolden ? mods.diameter * 1.3 : mods.diameter;

    const segments = path.map(p => ({
        x: p.x,
        y: p.y,
        depth: Number((depthBase * (0.9 + Math.random() * 0.2)).toFixed(1)),
        diameter: Number((diameterBase * (0.9 + Math.random() * 0.2)).toFixed(1)),
        stability: Math.min(100, Math.round(mods.stability * (0.9 + Math.random() * 0.2))),
        confidence: Number((mods.confidence * (0.98 + Math.random() * 0.02)).toFixed(1))
    }));

    // Find best segment for hotspot
    const bestSegmentIndex = Math.floor(segments.length / 2);
    const bestSeg = segments[bestSegmentIndex];

    return {
        id,
        name,
        anatomicalRegion: 'forearm',
        clinicalNotes: mods.notes,
        color: color,
        glowColor: color.replace(')', ', 0.4)').replace('rgb', 'rgba'),
        lineWidth: diameterBase, // Visual width matches physical diameter roughly
        segments,
        hotspot: {
            x: bestSeg.x,
            y: bestSeg.y,
            segmentIndex: bestSegmentIndex,
            punctureScore: Math.round(bestSeg.stability * (bestSeg.diameter / 2) * 10), // Simple scoring algo
            reason: mods.hotspotReason
        },
        branches: [], // Simplified for multi-patient generation
        summary: {
            avgDepth: depthBase,
            avgDiameter: diameterBase,
            avgStability: mods.stability,
            deviceConfidence: mods.confidence,
            accessDifficulty: mods.difficulty,
            recommendedGauge: mods.gauge
        }
    };
}

// ─── PATIENT DATABASE ────────────────────────────────────────

import generatedPatients from './generated_patients.json';

// Combine manual mock data with generated data if needed, or just use generated.
// For this task, we'll use the generated data as the primary source, 
// possibly keeping the manual ones for reference or specific testing scenarios if they don't conflict.

export const PATIENT_DB = {
    ...generatedPatients
};

// ─── DEFAULT EXPORT (Backward Compatibility) ─────────────────
// Defaults to the Standard Male profile so existing code works
// ─── DEFAULT EXPORT (Backward Compatibility) ─────────────────
// Defaults to the first patient's vein data so existing code works
export const VEIN_DATASET = Object.values(PATIENT_DB)[0]?.veinData || {};

// ─── HELPER EXPORTS ──────────────────────────────────────────

export function getPatientList() {
    return Object.values(PATIENT_DB).map(p => {
        // Paranoid safety check
        if (!p || !p.veinData) {
            console.warn('Malformed patient data:', p);
            return {
                id: p?.id || 'unknown',
                nationalId: p?.nationalId || 'unknown',
                name: p?.name || 'Unknown',
                age: p?.age || 0,
                bloodType: p?.bloodType || 'Unknown',
                medicalOrders: [],
                condition: 'Unknown',
                difficulty: 'Unknown'
            };
        }

        // Safely find a difficulty rating
        const vein = p.veinData.cephalic || Object.values(p.veinData)[0];
        const difficulty = vein?.summary?.accessDifficulty || 'Unknown';

        return {
            id: p.id,
            nationalId: p.nationalId,
            name: p.name,
            age: p.age,
            bloodType: p.bloodType, // Added
            medicalOrders: p.medicalOrders || [], // Added with fallback
            condition: p.condition,
            difficulty: difficulty
        };
    });
}

export function getPatientData(patientId) {
    return PATIENT_DB[patientId] || Object.values(PATIENT_DB)[0];
}

/** Get all vein IDs (from default profile) */
export function getAllVeinIds() {
    return Object.keys(VEIN_DATASET);
}

/** Get primary veins only */
export function getPrimaryVeinIds() {
    return ['cephalic', 'basilic', 'medianCubital'];
}

/** Get hotspot data for specific vein (supports patient context if passed, else default) */
export function getHotspotData(veinId, patientId = null) {
    const dataset = patientId ? getPatientData(patientId).veinData : VEIN_DATASET;
    const vein = dataset[veinId];
    if (!vein) return null;

    const seg = vein.segments[vein.hotspot.segmentIndex];
    return {
        veinId: vein.id,
        name: vein.name,
        patientId: patientId || 'default',
        x: vein.hotspot.x,
        y: vein.hotspot.y,
        depth: seg.depth,
        diameter: seg.diameter,
        stability: seg.stability,
        confidence: seg.confidence,
        punctureScore: vein.hotspot.punctureScore,
        reason: vein.hotspot.reason,
        color: vein.color,
    };
}

/** Get paths for rendering */
export function getAllPaths(veinId, patientId = null) {
    const dataset = patientId ? getPatientData(patientId).veinData : VEIN_DATASET;
    const vein = dataset[veinId];
    if (!vein) return [];

    const paths = [{ points: vein.segments.map(s => ({ x: s.x, y: s.y })), lineWidth: vein.lineWidth, color: vein.color }];
    // Branches would be added here if generated
    return paths;
}

// ─── FIRESTORE PERSISTENCE ───
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore';

// We keep the in-memory DB as a cache so synchronous components (like AR Overlay) 
// still work once data is loaded.
// However, components should ideally subscribe or wait for load.

let unsubscribe = null;
const listeners = []; // List of registered callbacks

// Initialize Real-time Listener (Observer Pattern)
export function subscribeToPatients(callback) {
    // Add callback to listeners
    listeners.push(callback);

    // If this is the first listener, start the Firestore subscription
    if (!unsubscribe) {
        const q = collection(db, "patients");
        unsubscribe = onSnapshot(q, (querySnapshot) => {
            const patients = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Ensure ID matches doc ID
                PATIENT_DB[data.id] = data;
                patients.push(data);
            });
            console.log("Firestore: Synced", patients.length, "patients");

            // Notify all listeners
            listeners.forEach(listener => listener(Object.values(PATIENT_DB)));
        }, (error) => {
            console.error("Firestore Error:", error);
        });
    } else {
        // If already subscribed, immediately fire callback with current data
        // asking for a fresh copy from PATIENT_DB in case it's populated
        if (Object.keys(PATIENT_DB).length > 0) {
            callback(Object.values(PATIENT_DB));
        }
    }

    // Return unsubscribe function for THIS listener
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }

        // If no listeners left, stop Firestore subscription
        if (listeners.length === 0 && unsubscribe) {
            unsubscribe();
            unsubscribe = null;
            console.log("Firestore: Unsubscribed (no listeners)");
        }
    };
}

// Ensure we allow components to fetch explicitly if they prefer
export async function fetchPatientsOnce() {
    const querySnapshot = await getDocs(collection(db, "patients"));
    const patients = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        PATIENT_DB[data.id] = data;
        patients.push(data);
    });
    return patients;
}

export async function addPatient(patientData) {
    const newId = patientData.nationalId || Date.now().toString();

    // Generate mock vein data
    const baseVeins = generateVeinData({
        id: newId,
        type: 'adult',
        modifiers: {
            difficulty: 'Easy',
            depth: 3,
            diameter: 3,
            stability: 80,
            confidence: 90,
            notes: 'Newly added patient',
            hotspotReason: 'Manual Entry',
            gauge: '22G'
        }
    });

    const newPatient = {
        ...patientData,
        id: newId,
        veinData: baseVeins,
        medicalOrders: [],
        injectionHistory: []
    };

    try {
        // Save to Firestore
        // We use setDoc with specific ID if nationalId is key, or addDoc for auto-ID?
        // Let's use setDoc to keep ID consistent with our internal logic
        await setDoc(doc(db, "patients", newId), newPatient);

        // Update local cache immediately for optimistic UI
        PATIENT_DB[newId] = newPatient;
        return newPatient;
    } catch (e) {
        console.error("Error adding patient to Firestore: ", e);
        throw e;
    }
}

export function getInjectionHistory(patientId) {
    const patient = PATIENT_DB[patientId];
    if (!patient) return [];

    // Return existing history or generate mock history if missing
    if (!patient.injectionHistory || patient.injectionHistory.length === 0) {
        // Mock some history for demo purposes if none exists
        const history = [];
        const count = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < count; i++) {
            history.push({
                id: `inj_${i}`,
                date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
                veinName: Math.random() > 0.5 ? 'Cephalic Vein' : 'Median Cubital',
                status: Math.random() > 0.2 ? 'Success' : 'Failed',
                x: 0.4 + Math.random() * 0.2,
                y: 0.3 + Math.random() * 0.4
            });
        }

        patient.injectionHistory = history;

        // Persist generated history to Firestore asynchronously
        const patientRef = doc(db, "patients", patientId);
        updateDoc(patientRef, {
            injectionHistory: history
        }).catch(err => console.error("Failed to save history mock:", err));
    }

    return patient.injectionHistory;
}
