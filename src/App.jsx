import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AROverlayPage from './features/ar-overlay/AROverlayPage';
import RecommenderPage from './features/needle-recommender/RecommenderPage';
import DigitalTwinPage from './features/digital-twin/DigitalTwinPage';
import './index.css';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ar" element={<AROverlayPage />} />
          <Route path="/recommend" element={<RecommenderPage />} />
          <Route path="/patients" element={<DigitalTwinPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
