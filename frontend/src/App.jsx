import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import LiveOperations from './pages/LiveOperations';
import OnboardAI from './pages/OnboardAI';
import Incidents from './pages/Incidents';
import RoadConditions from './pages/RoadConditions';
import Analytics from './pages/Analytics';
import Fleet from './pages/Fleet';
import Settings from './pages/Settings';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';

export default function App() {
  const [activeRole, setActiveRole] = useState('commissioner');
  const [alertCount, setAlertCount] = useState(4);

  // Load initial alert count
  useEffect(() => {
    api.getAlerts('OPEN').then((openAlerts) => {
      if (openAlerts && Array.isArray(openAlerts)) {
        setAlertCount(openAlerts.length);
      }
    }).catch((err) => {
      console.warn('Initial alerts load error:', err);
    });
  }, []);

  const handleGlobalWSMessage = useCallback((msg) => {
    if (msg?.type === 'new_alert') {
      setAlertCount((prev) => prev + 1);
    }
  }, []);

  const { isConnected } = useWebSocket(handleGlobalWSMessage);

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardLayout
              isConnected={isConnected}
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              alertCount={alertCount}
            />
          }
        >
          <Route index element={<Overview activeRole={activeRole} />} />
          <Route path="live-ops" element={<LiveOperations activeRole={activeRole} />} />
          <Route path="onboard-ai" element={<OnboardAI />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="road-conditions" element={<RoadConditions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="fleet" element={<Fleet />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
