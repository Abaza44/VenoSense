import { useState, useCallback } from 'react';
import { generateScanData } from '../services/simulatedDevice';
import { useScanContext } from '../context/ScanContext';

/**
 * Simulates a device scan with loading delay and stores result in ScanContext.
 */
export function useSimulatedScan() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const { setCurrentScan } = useScanContext();

  const startScan = useCallback(
    async (durationMs = 2500) => {
      setScanning(true);
      setScanResult(null);

      // Simulate the scan duration
      await new Promise((r) => setTimeout(r, durationMs));

      const data = generateScanData();
      const result = {
        veins: data,
        timestamp: new Date().toISOString(),
        deviceConfidence: 99.2,
      };

      setScanResult(result);
      setCurrentScan(result);
      setScanning(false);
      return result;
    },
    [setCurrentScan]
  );

  const resetScan = useCallback(() => {
    setScanResult(null);
    setScanning(false);
  }, []);

  return { scanning, scanResult, startScan, resetScan };
}
