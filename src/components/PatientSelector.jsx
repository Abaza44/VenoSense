import { useEffect } from 'react';
import { usePatientContext } from '../context/PatientContext';

export default function PatientSelector({ onSelect, className = '' }) {
  const { patients, selectedPatient, loading, loadPatients, selectPatient } = usePatientContext();

  useEffect(() => {
    if (patients.length === 0) loadPatients();
  }, [patients.length, loadPatients]);

  const handleChange = (e) => {
    const id = e.target.value;
    selectPatient(id || null);
    if (onSelect) onSelect(id || null);
  };

  return (
    <div className={className}>
      <label className="block text-xs text-gray-400 font-mono uppercase tracking-wider mb-1.5">
        Patient
      </label>
      <select
        value={selectedPatient?.id || ''}
        onChange={handleChange}
        disabled={loading}
        className="w-full bg-surface-700 border border-surface-500 text-white rounded-lg px-3 py-2.5 text-sm
                   focus:outline-none focus:border-vein-400/50 focus:ring-1 focus:ring-vein-400/30
                   disabled:opacity-50 appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%237986a0' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
      >
        <option value="">— Select Patient —</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.id} — {p.name} (Age {p.age})
          </option>
        ))}
      </select>
    </div>
  );
}
