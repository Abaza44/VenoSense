import { createContext, useContext, useState } from 'react';

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  // Current scan data (set by AR overlay, read by recommender)
  const [currentScan, setCurrentScan] = useState(null);

  // Last recommendation result
  const [lastRecommendation, setLastRecommendation] = useState(null);

  // Recommendation history (last 5)
  const [history, setHistory] = useState([]);

  const addToHistory = (rec) => {
    setHistory((prev) => [rec, ...prev].slice(0, 5));
  };

  const clearScan = () => {
    setCurrentScan(null);
  };

  return (
    <ScanContext.Provider
      value={{
        currentScan,
        setCurrentScan,
        lastRecommendation,
        setLastRecommendation,
        history,
        addToHistory,
        clearScan,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScanContext must be inside ScanProvider');
  return ctx;
}
