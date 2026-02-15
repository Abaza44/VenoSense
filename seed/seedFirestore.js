/**
 * Firestore Seed Script
 *
 * Usage: node seed/seedFirestore.js
 * Requires: npm install firebase-admin
 * Requires: seed/serviceAccountKey.json (download from Firebase Console)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync(new URL('./serviceAccountKey.json', import.meta.url), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const patients = [
  {
    id: 'PT-001',
    name: 'Ahmed M.',
    age: 34,
    ageGroup: 'adult',
    bloodType: 'A+',
    history: 'none',
    scans: [
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
  },
  {
    id: 'PT-002',
    name: 'Fatima K.',
    age: 72,
    ageGroup: 'geriatric',
    bloodType: 'O-',
    history: 'diabetes',
    scans: [
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
  },
  {
    id: 'PT-003',
    name: 'Omar S.',
    age: 45,
    ageGroup: 'adult',
    bloodType: 'B+',
    history: 'none',
    scans: [
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
  },
  {
    id: 'PT-004',
    name: 'Layla H.',
    age: 28,
    ageGroup: 'adult',
    bloodType: 'AB+',
    history: 'none',
    scans: [
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
  },
  {
    id: 'PT-005',
    name: 'Hassan R.',
    age: 81,
    ageGroup: 'geriatric',
    bloodType: 'O+',
    history: 'chemotherapy',
    scans: [
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
  },
];

async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  for (const patient of patients) {
    const { scans, ...patientData } = patient;
    const patientRef = db.collection('patients').doc(patient.id);

    await patientRef.set(patientData);
    console.log(`  ✅ Patient: ${patient.name} (${patient.id})`);

    for (const scan of scans) {
      await patientRef.collection('scans').doc(scan.id).set(scan);
      console.log(`     📋 Scan: ${scan.date} — ${scan.recommendation.gauge}`);
    }
  }

  console.log('\n✨ Seeding complete! 5 patients with scan data loaded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
