import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Gauge, 
  Users, 
  Battery, 
  Compass, 
  Activity, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  Radio,
  Cpu 
} from 'lucide-react';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Fleet() {
  const [buses, setBuses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadFleet();
  }, []);

  const loadFleet = async () => {
    try {
      const data = await api.getBuses();
      setBuses(data);
    } catch (e) {
      console.error('Failed to load fleet:', e);
    }
  };

  useWebSocket((msg) => {
    if (msg.type === 'bus_telemetry') {
      setBuses(msg.data);
    }
  });

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Bus className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wider">
              MOBILE SENSING FLEET • VIRTUAL SENSING NODES
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Real-time Telemetry • Ultralytics YOLOv11 Edge Computer Health • 5 Active Sensing Buses
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>5 / 5 ACTIVE BUS NODES</span>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all"
          >
            {/* Top Node Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-extrabold text-base text-blue-700 dark:text-cyan-300 font-mono tracking-wide">{bus.id}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {bus.status || 'IN_TRANSIT'}
                </span>
              </div>

              {/* Route & Plate */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={bus.route_name}>
                  {bus.route_name}
                </div>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 inline-block font-medium">
                  {bus.plate_number}
                </div>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] block">Speed</span>
                <span className="font-extrabold text-amber-600">{bus.speed} km/h</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Occupancy</span>
                <span className="font-extrabold text-purple-600">{bus.occupancy}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Heading</span>
                <span className="font-extrabold text-blue-600">{bus.heading}°</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Battery/Fuel</span>
                <span className="font-extrabold text-emerald-600">{bus.battery_or_fuel}%</span>
              </div>
            </div>

            {/* GPS & Sensor Health */}
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
              <div className="flex justify-between">
                <span>GPS Coordinates:</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">{bus.lat?.toFixed(4)}, {bus.lng?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Edge Vision Model:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">YOLOv11n Active</span>
              </div>
            </div>

            {/* Action: Connect to Onboard AI */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/onboard-ai')}
                className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-cyan-600/20 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Inspect Edge Cam</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
