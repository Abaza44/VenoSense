import { createContext, useContext, useState, useCallback } from 'react';
import { getPatient, getAllPatients } from '../services/firestore';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectPatient = useCallback(async (patientId) => {
    if (!patientId) {
      setSelectedPatient(null);
      return;
    }
    setLoading(true);
    try {
      const patient = await getPatient(patientId);
      setSelectedPatient(patient);
    } catch (err) {
      console.error('Failed to load patient:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PatientContext.Provider
      value={{
        patients,
        selectedPatient,
        loading,
        loadPatients,
        selectPatient,
        setSelectedPatient,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatientContext must be inside PatientProvider');
  return ctx;
}
