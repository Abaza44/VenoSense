import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { ScanProvider } from './context/ScanContext';
import DashboardShell from './components/Layout/DashboardShell';
import Dashboard from './pages/Dashboard';
import AROverlayPage from './features/ar-overlay/AROverlayPage';
import ARDemoIntegrated from './features/ar-overlay/ARDemoIntegrated';
import RecommenderPage from './features/needle-recommender/RecommenderPage';
import DigitalTwinPage from './features/digital-twin/DigitalTwinPage';

export default function App() {
  return (
    <BrowserRouter>
      <PatientProvider>
        <ScanProvider>
          <DashboardShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ar" element={<ARDemoIntegrated />} />
              <Route path="/ar-legacy" element={<AROverlayPage />} />
              <Route path="/recommend" element={<RecommenderPage />} />
              <Route path="/patients" element={<DigitalTwinPage />} />
            </Routes>
          </DashboardShell>
        </ScanProvider>
      </PatientProvider>
    </BrowserRouter>
  );
}
