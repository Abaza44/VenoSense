/**
 * ═══════════════════════════════════════════════════════════════
 * DELIVERABLE 4 — FIREBASE FIRESTORE SCHEMA & HELPERS
 * ═══════════════════════════════════════════════════════════════
 *
 * Optimized Firestore structure for hackathon:
 *   - Flat where possible (fewer reads)
 *   - Subcollections only for scans (they grow over time)
 *   - Denormalized summary in patient doc (avoid extra reads)
 *
 * STRUCTURE:
 *
 *   patients/{patientId}                  ← Patient profile
 *   patients/{patientId}/scans/{scanId}   ← Individual scan records
 *   recommendations/{recId}               ← Standalone recommendation log (optional)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DOCUMENT SCHEMAS:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * patients/{patientId}:
 * {
 *   id:            "PT-001",
 *   name:          "Ahmed M.",
 *   age:           34,
 *   ageGroup:      "adult",              // "pediatric" | "adult" | "geriatric"
 *   bloodType:     "A+",
 *   history:       "none",               // "none"|"diabetes"|"chemotherapy"|"obesity"|"dehydration"
 *   createdAt:     Timestamp,
 *   updatedAt:     Timestamp,
 *
 *   // Denormalized summary (updated on each new scan to avoid extra reads)
 *   lastScan: {
 *     scanId:      "scan-1707955200000",
 *     date:        "2026-02-15",
 *     arm:         "left",
 *     topVein:     "Cephalic Vein",
 *     gauge:       "20G",
 *     success:     92,
 *   },
 *   totalScans:    3,
 * }
 *
 * patients/{patientId}/scans/{scanId}:
 * {
 *   id:            "scan-1707955200000",
 *   date:          "2026-02-15",
 *   arm:           "left",               // "left" | "right"
 *   deviceId:      "VTRON-001",          // Simulated device ID
 *   scanDuration:  2.5,                  // seconds
 *
 *   veins: [
 *     {
 *       id:         "cephalic",
 *       name:       "Cephalic Vein",
 *       depth:      2.8,                 // mm
 *       diameter:   3.1,                 // mm
 *       stability:  85,                  // 0–100
 *       confidence: 99.2,               // device confidence %
 *     },
 *     { ... },
 *   ],
 *
 *   recommendation: {
 *     primaryVein:  "cephalic",
 *     gauge:        "20G",
 *     needleLength: "1.00 inch",
 *     success:      92,                  // %
 *     angle:        15,                  // degrees
 *     risks:        ["No significant risks"],
 *   },
 *
 *   createdAt:      Timestamp,
 * }
 *
 * recommendations/{recId} (optional — for analytics):
 * {
 *   patientId:    "PT-001",
 *   scanId:       "scan-xxx",
 *   veinId:       "cephalic",
 *   input:        { depth, diameter, stability, ageGroup, history },
 *   output:       { gauge, length, success, risks },
 *   accepted:     true,                 // did the user accept this recommendation?
 *   createdAt:    Timestamp,
 * }
 */

import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  query, orderBy, limit, serverTimestamp, where,
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';

// ─── LOCAL FALLBACK (same as before, but enhanced with new fields) ──

const LOCAL_PATIENTS = [
  {
    id: 'PT-001', name: 'Ahmed M.', age: 34, ageGroup: 'adult',
    bloodType: 'A+', history: 'none', totalScans: 1,
    lastScan: { scanId: 'scan-1', date: '2026-02-10', arm: 'left', topVein: 'Cephalic Vein', gauge: '20G', success: 92 },
  },
  {
    id: 'PT-002', name: 'Fatima K.', age: 72, ageGroup: 'geriatric',
    bloodType: 'O-', history: 'diabetes', totalScans: 2,
    lastScan: { scanId: 'scan-1', date: '2026-02-12', arm: 'right', topVein: 'Median Cubital Vein', gauge: '22G', success: 71 },
  },
  {
    id: 'PT-003', name: 'Omar S.', age: 45, ageGroup: 'adult',
    bloodType: 'B+', history: 'none', totalScans: 1,
    lastScan: { scanId: 'scan-1', date: '2026-02-13', arm: 'left', topVein: 'Median Cubital Vein', gauge: '18G', success: 95 },
  },
  {
    id: 'PT-004', name: 'Layla H.', age: 28, ageGroup: 'adult',
    bloodType: 'AB+', history: 'none', totalScans: 1,
    lastScan: { scanId: 'scan-1', date: '2026-02-14', arm: 'right', topVein: 'Cephalic Vein', gauge: '20G', success: 89 },
  },
  {
    id: 'PT-005', name: 'Hassan R.', age: 81, ageGroup: 'geriatric',
    bloodType: 'O+', history: 'chemotherapy', totalScans: 3,
    lastScan: { scanId: 'scan-1', date: '2026-02-09', arm: 'left', topVein: 'Basilic Vein', gauge: '24G', success: 52 },
  },
];

const LOCAL_SCANS = {
  'PT-001': [
    {
      id: 'scan-1', date: '2026-02-10', arm: 'left', deviceId: 'VTRON-001', scanDuration: 2.3,
      veins: [
        { id: 'cephalic', name: 'Cephalic Vein', depth: 2.8, diameter: 3.1, stability: 85, confidence: 99.2 },
        { id: 'basilic', name: 'Basilic Vein', depth: 3.5, diameter: 2.6, stability: 78, confidence: 98.5 },
        { id: 'medianCubital', name: 'Median Cubital Vein', depth: 2.2, diameter: 4.0, stability: 89, confidence: 99.5 },
      ],
      recommendation: { primaryVein: 'cephalic', gauge: '20G', needleLength: '1.00 inch', success: 92, angle: 15, risks: ['No significant risks'] },
    },
  ],
  'PT-002': [
    {
      id: 'scan-1', date: '2026-02-12', arm: 'right', deviceId: 'VTRON-001', scanDuration: 2.8,
      veins: [
        { id: 'basilic', name: 'Basilic Vein', depth: 4.1, diameter: 2.2, stability: 55, confidence: 97.9 },
        { id: 'medianCubital', name: 'Median Cubital Vein', depth: 2.9, diameter: 3.0, stability: 62, confidence: 98.2 },
      ],
      recommendation: { primaryVein: 'medianCubital', gauge: '22G', needleLength: '1.00 inch', success: 71, angle: 15, risks: ['Diabetic patient. Check for peripheral neuropathy.'] },
    },
    {
      id: 'scan-2', date: '2026-01-28', arm: 'right', deviceId: 'VTRON-001', scanDuration: 3.1,
      veins: [
        { id: 'basilic', name: 'Basilic Vein', depth: 4.3, diameter: 2.0, stability: 50, confidence: 97.4 },
      ],
      recommendation: { primaryVein: 'basilic', gauge: '22G', needleLength: '1.25 inch', success: 65, angle: 20, risks: ['Tight vein-to-needle ratio.'] },
    },
  ],
  'PT-003': [
    {
      id: 'scan-1', date: '2026-02-13', arm: 'left', deviceId: 'VTRON-001', scanDuration: 2.1,
      veins: [
        { id: 'medianCubital', name: 'Median Cubital Vein', depth: 3.0, diameter: 4.5, stability: 90, confidence: 99.5 },
        { id: 'cephalic', name: 'Cephalic Vein', depth: 2.5, diameter: 3.8, stability: 88, confidence: 99.3 },
      ],
      recommendation: { primaryVein: 'medianCubital', gauge: '18G', needleLength: '1.00 inch', success: 95, angle: 15, risks: ['No significant risks'] },
    },
  ],
  'PT-004': [
    {
      id: 'scan-1', date: '2026-02-14', arm: 'right', deviceId: 'VTRON-001', scanDuration: 2.4,
      veins: [
        { id: 'cephalic', name: 'Cephalic Vein', depth: 2.1, diameter: 2.9, stability: 82, confidence: 99.0 },
      ],
      recommendation: { primaryVein: 'cephalic', gauge: '20G', needleLength: '1.00 inch', success: 89, angle: 15, risks: ['No significant risks'] },
    },
  ],
  'PT-005': [
    {
      id: 'scan-1', date: '2026-02-09', arm: 'left', deviceId: 'VTRON-001', scanDuration: 3.5,
      veins: [
        { id: 'basilic', name: 'Basilic Vein', depth: 5.2, diameter: 1.8, stability: 38, confidence: 96.8 },
      ],
      recommendation: { primaryVein: 'basilic', gauge: '24G', needleLength: '1.25 inch', success: 52, angle: 25, risks: ['Low vein stability.', 'Chemo-compromised veins.'] },
    },
    {
      id: 'scan-2', date: '2026-01-15', arm: 'left', deviceId: 'VTRON-001', scanDuration: 3.2,
      veins: [
        { id: 'basilic', name: 'Basilic Vein', depth: 5.0, diameter: 2.0, stability: 42, confidence: 97.0 },
      ],
      recommendation: { primaryVein: 'basilic', gauge: '24G', needleLength: '1.25 inch', success: 58, angle: 25, risks: ['Low vein stability.'] },
    },
    {
      id: 'scan-3', date: '2025-12-20', arm: 'right', deviceId: 'VTRON-001', scanDuration: 2.9,
      veins: [
        { id: 'cephalic', name: 'Cephalic Vein', depth: 3.8, diameter: 2.1, stability: 45, confidence: 97.2 },
      ],
      recommendation: { primaryVein: 'cephalic', gauge: '22G', needleLength: '1.00 inch', success: 61, angle: 20, risks: ['Chemo-compromised veins.'] },
    },
  ],
};

// ─── FIRESTORE CRUD (with fallback) ─────────────────────────

export async function getAllPatientsV2() {
  if (!isFirebaseReady) return LOCAL_PATIENTS;
  try {
    const snap = await getDocs(collection(db, 'patients'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Firestore fallback:', e.message);
    return LOCAL_PATIENTS;
  }
}

export async function getPatientV2(patientId) {
  if (!isFirebaseReady) return LOCAL_PATIENTS.find(p => p.id === patientId) || null;
  try {
    const snap = await getDoc(doc(db, 'patients', patientId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    return LOCAL_PATIENTS.find(p => p.id === patientId) || null;
  }
}

export async function getPatientScansV2(patientId, maxResults = 20) {
  if (!isFirebaseReady) return LOCAL_SCANS[patientId] || [];
  try {
    const q = query(
      collection(db, 'patients', patientId, 'scans'),
      orderBy('date', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return LOCAL_SCANS[patientId] || [];
  }
}

export async function saveScanV2(patientId, scanData) {
  const scanId = `scan-${Date.now()}`;
  const record = {
    ...scanData,
    id: scanId,
    date: new Date().toISOString().split('T')[0],
    createdAt: isFirebaseReady ? serverTimestamp() : new Date().toISOString(),
  };

  if (!isFirebaseReady) {
    if (!LOCAL_SCANS[patientId]) LOCAL_SCANS[patientId] = [];
    LOCAL_SCANS[patientId].unshift(record);

    // Update local patient summary
    const patient = LOCAL_PATIENTS.find(p => p.id === patientId);
    if (patient) {
      patient.totalScans = (patient.totalScans || 0) + 1;
      patient.lastScan = {
        scanId,
        date: record.date,
        arm: record.arm,
        topVein: record.recommendation?.primaryVein || 'Unknown',
        gauge: record.recommendation?.gauge || '—',
        success: record.recommendation?.success || 0,
      };
    }
    return record;
  }

  try {
    await setDoc(doc(db, 'patients', patientId, 'scans', scanId), record);

    // Update denormalized summary on the patient doc
    await updateDoc(doc(db, 'patients', patientId), {
      'lastScan.scanId': scanId,
      'lastScan.date': record.date,
      'lastScan.arm': record.arm || 'unknown',
      'lastScan.topVein': record.recommendation?.primaryVein || 'Unknown',
      'lastScan.gauge': record.recommendation?.gauge || '—',
      'lastScan.success': record.recommendation?.success || 0,
      updatedAt: serverTimestamp(),
    });

    return record;
  } catch (e) {
    console.warn('Firestore write failed:', e.message);
    if (!LOCAL_SCANS[patientId]) LOCAL_SCANS[patientId] = [];
    LOCAL_SCANS[patientId].unshift(record);
    return record;
  }
}

/**
 * Log a recommendation (optional analytics collection)
 */
export async function logRecommendation(patientId, scanId, data) {
  if (!isFirebaseReady) return; // Skip if no Firebase

  try {
    const recId = `rec-${Date.now()}`;
    await setDoc(doc(db, 'recommendations', recId), {
      patientId,
      scanId,
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    // Non-critical — fail silently
  }
}
