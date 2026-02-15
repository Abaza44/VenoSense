import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';

/* ─── LOCAL FALLBACK DATA ────────────────────────────────── 
   If Firebase is not configured or fails, we use this data.
   The demo looks identical either way.                       */

const LOCAL_PATIENTS = [
  {
    id: 'PT-001',
    name: 'Ahmed M.',
    age: 34,
    ageGroup: 'adult',
    bloodType: 'A+',
    history: 'none',
  },
  {
    id: 'PT-002',
    name: 'Fatima K.',
    age: 72,
    ageGroup: 'geriatric',
    bloodType: 'O-',
    history: 'diabetes',
  },
  {
    id: 'PT-003',
    name: 'Omar S.',
    age: 45,
    ageGroup: 'adult',
    bloodType: 'B+',
    history: 'none',
  },
  {
    id: 'PT-004',
    name: 'Layla H.',
    age: 28,
    ageGroup: 'adult',
    bloodType: 'AB+',
    history: 'none',
  },
  {
    id: 'PT-005',
    name: 'Hassan R.',
    age: 81,
    ageGroup: 'geriatric',
    bloodType: 'O+',
    history: 'chemotherapy',
  },
];

const LOCAL_SCANS = {
  'PT-001': [
    {
      id: 'scan-1',
      date: '2026-02-10',
      arm: 'left',
      veins: [
        { name: 'Cephalic Vein', depth: 2.8, diameter: 3.1, stability: 85 },
        { name: 'Basilic Vein', depth: 3.5, diameter: 2.6, stability: 78 },
      ],
      recommendation: { gauge: '20G', length: '1.00 inch', success: 92 },
    },
  ],
  'PT-002': [
    {
      id: 'scan-1',
      date: '2026-02-12',
      arm: 'right',
      veins: [
        { name: 'Basilic Vein', depth: 4.1, diameter: 2.2, stability: 55 },
        { name: 'Median Cubital Vein', depth: 2.9, diameter: 3.0, stability: 62 },
      ],
      recommendation: { gauge: '22G', length: '1.25 inch', success: 71 },
    },
    {
      id: 'scan-2',
      date: '2026-01-28',
      arm: 'right',
      veins: [
        { name: 'Basilic Vein', depth: 4.3, diameter: 2.0, stability: 50 },
      ],
      recommendation: { gauge: '22G', length: '1.25 inch', success: 65 },
    },
  ],
  'PT-003': [
    {
      id: 'scan-1',
      date: '2026-02-13',
      arm: 'left',
      veins: [
        { name: 'Median Cubital Vein', depth: 3.0, diameter: 4.5, stability: 90 },
        { name: 'Cephalic Vein', depth: 2.5, diameter: 3.8, stability: 88 },
      ],
      recommendation: { gauge: '18G', length: '1.00 inch', success: 95 },
    },
  ],
  'PT-004': [
    {
      id: 'scan-1',
      date: '2026-02-14',
      arm: 'right',
      veins: [
        { name: 'Cephalic Vein', depth: 2.1, diameter: 2.9, stability: 82 },
      ],
      recommendation: { gauge: '20G', length: '1.00 inch', success: 89 },
    },
  ],
  'PT-005': [
    {
      id: 'scan-1',
      date: '2026-02-09',
      arm: 'left',
      veins: [
        { name: 'Basilic Vein', depth: 5.2, diameter: 1.8, stability: 38 },
      ],
      recommendation: { gauge: '24G', length: '1.25 inch', success: 52 },
    },
    {
      id: 'scan-2',
      date: '2026-01-15',
      arm: 'left',
      veins: [
        { name: 'Basilic Vein', depth: 5.0, diameter: 2.0, stability: 42 },
      ],
      recommendation: { gauge: '24G', length: '1.25 inch', success: 58 },
    },
    {
      id: 'scan-3',
      date: '2025-12-20',
      arm: 'right',
      veins: [
        { name: 'Cephalic Vein', depth: 3.8, diameter: 2.1, stability: 45 },
      ],
      recommendation: { gauge: '22G', length: '1.00 inch', success: 61 },
    },
  ],
};

/* ─── FIRESTORE READ HELPERS ─────────────────────────────── */

/**
 * Get all patients
 */
export async function getAllPatients() {
  if (!isFirebaseReady) return LOCAL_PATIENTS;

  try {
    const snapshot = await getDocs(collection(db, 'patients'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore read failed, using fallback:', err.message);
    return LOCAL_PATIENTS;
  }
}

/**
 * Get a single patient by ID
 */
export async function getPatient(patientId) {
  if (!isFirebaseReady) {
    return LOCAL_PATIENTS.find((p) => p.id === patientId) || null;
  }

  try {
    const docSnap = await getDoc(doc(db, 'patients', patientId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.warn('Firestore read failed, using fallback:', err.message);
    return LOCAL_PATIENTS.find((p) => p.id === patientId) || null;
  }
}

/**
 * Get all scans for a patient, ordered by date descending
 */
export async function getPatientScans(patientId) {
  if (!isFirebaseReady) {
    return LOCAL_SCANS[patientId] || [];
  }

  try {
    const scansRef = collection(db, 'patients', patientId, 'scans');
    const q = query(scansRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore scan read failed, using fallback:', err.message);
    return LOCAL_SCANS[patientId] || [];
  }
}

/**
 * Save a new scan to a patient's record
 */
export async function saveScan(patientId, scanData) {
  const scanId = `scan-${Date.now()}`;
  const record = {
    ...scanData,
    id: scanId,
    date: new Date().toISOString().split('T')[0],
  };

  if (!isFirebaseReady) {
    // Save to local fallback
    if (!LOCAL_SCANS[patientId]) LOCAL_SCANS[patientId] = [];
    LOCAL_SCANS[patientId].unshift(record);
    return record;
  }

  try {
    const scanRef = doc(db, 'patients', patientId, 'scans', scanId);
    await setDoc(scanRef, record);
    return record;
  } catch (err) {
    console.warn('Firestore write failed, saving locally:', err.message);
    if (!LOCAL_SCANS[patientId]) LOCAL_SCANS[patientId] = [];
    LOCAL_SCANS[patientId].unshift(record);
    return record;
  }
}
