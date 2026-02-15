import { useState, useEffect } from 'react';
import { getPatient, getPatientScans } from '../services/firestore';

/**
 * Hook to load a patient + their scans from Firestore (or fallback).
 */
export function useFirestorePatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setPatient(null);
      setScans([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [p, s] = await Promise.all([
          getPatient(patientId),
          getPatientScans(patientId),
        ]);
        if (!cancelled) {
          setPatient(p);
          setScans(s);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [patientId]);

  return { patient, scans, loading, error };
}
