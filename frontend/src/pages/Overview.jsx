import React, { useState, useEffect, useCallback } from 'react';
import KPICards from '../components/KPICards';
import MapView from '../components/MapView';
import LiveAlertPanel from '../components/LiveAlertPanel';
import IncidentModal from '../components/IncidentModal';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { sound } from '../services/sound';

export default function Overview({ activeRole = 'commissioner' }) {
  const [buses, setBuses] = useState([]);
  const [defects, setDefects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [isTriggeringAlert, setIsTriggeringAlert] = useState(false);

  // Load initial data
  const loadData = async () => {
    try {
      const [busesData, defectsData, alertsData, kpisData] = await Promise.all([
        api.getBuses(),
        api.getDefects(),
        api.getAlerts(),
        api.getKPIs()
      ]);
      setBuses(busesData);
      setDefects(defectsData);
      setAlerts(alertsData);
      setKpis(kpisData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle incoming WebSocket telemetry and alerts
  const handleWebSocketMessage = useCallback((msg) => {
    if (!msg || !msg.type) return;

    if (msg.type === 'bus_telemetry') {
      setBuses(msg.data);
      if (selectedBus) {
        const updated = msg.data.find((b) => b.id === selectedBus.id);
        if (updated) setSelectedBus(updated);
      }
    } else if (msg.type === 'new_alert') {
      // Play command center audio chime!
      sound.playAlertChime();
      setAlerts((prev) => [msg.data, ...prev]);
      setKpis((prev) => prev ? { ...prev, active_incidents: prev.active_incidents + 1 } : null);
    } else if (msg.type === 'defect_update') {
      setDefects((prev) =>
        prev.map((d) => (d.id === msg.data.id ? { ...d, ...msg.data } : d))
      );
    } else if (msg.type === 'new_defect') {
      setDefects((prev) => [msg.data, ...prev]);
      setKpis((prev) => prev ? { ...prev, total_defects: prev.total_defects + 1 } : null);
    }
  }, [selectedBus]);

  useWebSocket(handleWebSocketMessage);

  // Manual Trigger for Live Demo
  const handleTriggerDemoIncident = async () => {
    try {
      setIsTriggeringAlert(true);
      await api.triggerIncident({
        type: 'HIT_AND_RUN',
        license_plate: 'AP 37 AB 4821',
        bus_id: 'ASTRA-103',
        location_name: 'Benz Circle Flyover Underpass'
      });
    } catch (e) {
      console.error('Trigger incident error:', e);
    } finally {
      setIsTriggeringAlert(false);
    }
  };

  // Update Defect status handler
  const handleUpdateDefectStatus = async (id, status) => {
    try {
      const updated = await api.updateDefectStatus(id, status);
      setDefects((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (e) {
      console.error('Failed to update defect status:', e);
    }
  };

  return (
    <div className="space-y-4 max-w-[1800px] mx-auto">
      {/* Top Level KPI Strip */}
      <KPICards kpis={kpis} role={activeRole} />

      {/* Main Command Center Layout: Map (70%) + Live Incidents (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-17.5rem)] min-h-[580px]">
        {/* Central GIS Map View */}
        <div className="lg:col-span-8 xl:col-span-9 h-full flex flex-col">
          <MapView
            buses={buses}
            defects={defects}
            selectedBus={selectedBus}
            onSelectBus={setSelectedBus}
            onUpdateDefectStatus={handleUpdateDefectStatus}
          />
        </div>

        {/* Right Dock: Live Incidents Stream */}
        <div className="lg:col-span-4 xl:col-span-3 h-full">
          <LiveAlertPanel
            alerts={alerts}
            onSelectAlert={setSelectedAlert}
            onTriggerDemoIncident={handleTriggerDemoIncident}
            isTriggering={isTriggeringAlert}
          />
        </div>
      </div>

      {/* Incident Detail Modal with PDF Export */}
      {selectedAlert && (
        <IncidentModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onStatusUpdated={(id, status) => {
            setAlerts((prev) =>
              prev.map((a) => (a.id === id ? { ...a, status } : a))
            );
            setSelectedAlert((prev) => (prev ? { ...prev, status } : null));
          }}
        />
      )}
    </div>
  );
}
