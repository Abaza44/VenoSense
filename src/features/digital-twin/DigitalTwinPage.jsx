import { useState, useEffect, useCallback } from 'react';
import PatientList from './PatientList';
import PatientProfile from './PatientProfile';
import ScanHistory from './ScanHistory';
import ScanComparison from './ScanComparison';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getAllPatients, getPatientScans } from '../../services/firestore';

export default function DigitalTwinPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [scans, setScans] = useState([]);
  const [scansLoading, setScansLoading] = useState(false);
  const [compareScans, setCompareScans] = useState([null, null]);

  // Load all patients
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAllPatients();
      setPatients(data);
      setLoading(false);
    }
    load();
  }, []);

  // Load scans when patient is selected
  useEffect(() => {
    if (!selectedId) {
      setScans([]);
      setCompareScans([null, null]);
      return;
    }
    async function loadScans() {
      setScansLoading(true);
      const s = await getPatientScans(selectedId);
      setScans(s);
      setScansLoading(false);
      setCompareScans([null, null]);
    }
    loadScans();
  }, [selectedId]);

  const handleSelectPatient = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const handleSelectScan = useCallback((scan) => {
    setCompareScans((prev) => {
      // Toggle: if same scan clicked, deselect it
      if (prev[0]?.id === scan.id) return [null, prev[1]];
      if (prev[1]?.id === scan.id) return [prev[0], null];

      // Fill empty slots
      if (!prev[0]) return [scan, prev[1]];
      if (!prev[1]) return [prev[0], scan];

      // Replace first slot
      return [scan, prev[1]];
    });
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedId);
  const latestScan = scans[0] || null;
  const selectedScanIds = compareScans.filter(Boolean).map((s) => s.id);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-display font-bold tracking-wide">
            Patient VeinMap
          </h1>
          <Badge variant="vein" size="xs">DIGITAL TWIN</Badge>
        </div>
        <p className="text-gray-400 text-sm">
          Cloud-based patient vein profiles. Compare scans across visits to track changes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient List */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
            Patients ({patients.length})
          </h3>
          <PatientList
            patients={patients}
            loading={loading}
            onSelect={handleSelectPatient}
            selectedId={selectedId}
          />
        </div>

        {/* Right: Patient Detail */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPatient ? (
            <>
              {/* Profile */}
              <PatientProfile patient={selectedPatient} latestScan={latestScan} />

              {/* Scan History */}
              <Card padding="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                    Scan History ({scans.length})
                  </h3>
                  {selectedScanIds.length > 0 && selectedScanIds.length < 2 && (
                    <span className="text-xs text-gray-500">Select one more scan to compare</span>
                  )}
                </div>
                {scansLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="spinner" />
                  </div>
                ) : (
                  <ScanHistory
                    scans={scans}
                    onSelectScan={handleSelectScan}
                    selectedScanIds={selectedScanIds}
                  />
                )}
              </Card>

              {/* Comparison */}
              {compareScans[0] && compareScans[1] && (
                <div className="animate-slide-up">
                  <ScanComparison scan1={compareScans[0]} scan2={compareScans[1]} />
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <Card padding="p-16" className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7986a0" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6M23 11h-6" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Select a patient from the list</p>
              <p className="text-gray-500 text-xs mt-1">to view their vein profile and scan history</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
