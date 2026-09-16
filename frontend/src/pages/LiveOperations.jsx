import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { Bus, Radio, AlertTriangle, ShieldCheck, Gauge } from 'lucide-react';

export default function LiveOperations() {
  const [buses, setBuses] = useState([]);
  const [defects, setDefects] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    Promise.all([api.getBuses(), api.getDefects()]).then(([bData, dData]) => {
      setBuses(bData);
      setDefects(dData);
      if (bData.length > 0) setSelectedBus(bData[0]);
    });
  }, []);

  useWebSocket((msg) => {
    if (msg.type === 'bus_telemetry') {
      setBuses(msg.data);
      if (selectedBus) {
        const updated = msg.data.find(b => b.id === selectedBus.id);
        if (updated) setSelectedBus(updated);
      }
    }
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-3 max-w-[1800px] mx-auto">
      {/* Top Banner */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
          <h1 className="text-base font-bold text-slate-900 dark:text-white font-mono tracking-wider">
            LIVE TACTICAL OPERATIONS • FULL-SCREEN GIS MONITOR
          </h1>
        </div>

        <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
          Sync Rate: <span className="text-blue-600 font-bold">2.5 sec</span> • Telemetry Buffer: <span className="text-emerald-600 font-bold">Active</span>
        </div>
      </div>

      {/* Main Operations Split: Large Map (75%) + Active Bus Dock (25%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
        {/* Full-bleed Map */}
        <div className="lg:col-span-9 h-full">
          <MapView
            buses={buses}
            defects={defects}
            selectedBus={selectedBus}
            onSelectBus={setSelectedBus}
          />
        </div>

        {/* Tactical Fleet List Dock */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="space-y-3 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800 pb-2">
              Fleet Units ({buses.length})
            </h2>

            <div className="space-y-2">
              {buses.map((bus) => {
                const isSelected = selectedBus?.id === bus.id;
                return (
                  <div
                    key={bus.id}
                    onClick={() => setSelectedBus(bus)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-blue-700 font-mono">{bus.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {bus.status || 'TRANSIT'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 font-bold truncate">{bus.route_name}</div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-2 pt-1 border-t border-slate-200/80">
                      <span>Speed: <b className="text-amber-600">{bus.speed} km/h</b></span>
                      <span>Cap: <b className="text-purple-600">{bus.occupancy}%</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Bus Telemetry Footer */}
          {selectedBus && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1 mt-3">
              <div className="text-blue-700 font-extrabold">TRACKING: {selectedBus.id}</div>
              <div className="flex justify-between text-slate-700">
                <span>GPS:</span>
                <span>{selectedBus.lat?.toFixed(4)}, {selectedBus.lng?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Heading:</span>
                <span>{selectedBus.heading}°</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Battery / Fuel:</span>
                <span className="text-emerald-700 font-bold">{selectedBus.battery_or_fuel}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
