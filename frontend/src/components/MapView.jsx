import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import BusMarker from './BusMarker';
import DefectMarker from './DefectMarker';
import CongestionLayer from './CongestionLayer';
import { BUS_ROUTES } from '../data/routesData';
import { Layers, Eye, EyeOff, Flame, AlertCircle, Compass } from 'lucide-react';

const VIJAYAWADA_CENTER = [16.5062, 80.6480]; // Benz Circle / MG Road center

// Map Controller for smooth flyTo when bus is selected
function MapFlyController({ selectedBus }) {
  const map = useMap();
  useEffect(() => {
    if (selectedBus && selectedBus.lat && selectedBus.lng) {
      map.flyTo([selectedBus.lat, selectedBus.lng], 15, { duration: 1.2 });
    }
  }, [selectedBus, map]);
  return null;
}

export default function MapView({ 
  buses = [], 
  defects = [], 
  selectedBus = null,
  onSelectBus, 
  onUpdateDefectStatus,
  isDark = false 
}) {
  const [showFleet, setShowFleet] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showDefects, setShowDefects] = useState(true);
  const [showCongestion, setShowCongestion] = useState(true);
  const [roadConditionMode, setRoadConditionMode] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-950">
      {/* Interactive Layer Controls Toolbar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 backdrop-blur-md shadow-lg text-xs font-mono">
        {/* Fleet Toggle */}
        <button
          onClick={() => setShowFleet(!showFleet)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            showFleet 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400"></span>
          <span>Fleet ({buses.length})</span>
        </button>

        {/* Defects Toggle */}
        <button
          onClick={() => setShowDefects(!showDefects)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            showDefects 
              ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/40' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 dark:bg-orange-400"></span>
          <span>Defects ({defects.length})</span>
        </button>

        {/* Congestion Toggle */}
        <button
          onClick={() => setShowCongestion(!showCongestion)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            showCongestion 
              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 dark:bg-rose-400"></span>
          <span>Traffic Heatmap</span>
        </button>

        {/* Road Condition Mode Switch */}
        <button
          onClick={() => setRoadConditionMode(!roadConditionMode)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            roadConditionMode 
              ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-rose-500/30' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Condition Mode</span>
        </button>
      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-lg text-[11px] font-mono space-y-1.5 max-w-[250px] text-slate-800 dark:text-slate-200">
        <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px] flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
          <span>GIS Cartography</span>
          <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Virtual Fleet</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
            <span>Pothole</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
            <span>Waterlogging</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ca8a04]"></span>
            <span>Sign Defect</span>
          </div>
        </div>
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
          Recurrence: <span className="text-emerald-600 font-bold">x1 Low</span> • <span className="text-amber-600 font-bold">x2 Med</span> • <span className="text-rose-600 font-bold">x3+ High</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={VIJAYAWADA_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className={isDark ? "dark-tiles" : ""}
      >
        <MapFlyController selectedBus={selectedBus} />

        {/* Standard OpenStreetMap TileLayer (100% Free & Open-Source) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Bus Route Polylines */}
        {showRoutes && BUS_ROUTES.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: route.color,
              weight: 3.5,
              opacity: 0.65,
              dashArray: '5, 8'
            }}
          />
        ))}

        {/* Traffic Congestion Layer */}
        <CongestionLayer isVisible={showCongestion} />

        {/* Moving Bus Fleet */}
        {showFleet && buses.map((bus) => (
          <BusMarker 
            key={bus.id} 
            bus={bus} 
            onSelectBus={onSelectBus} 
          />
        ))}

        {/* Road Defects (Standard Marker Mode) */}
        {showDefects && !roadConditionMode && defects.map((defect) => (
          <DefectMarker
            key={defect.id}
            defect={defect}
            onStatusChange={onUpdateDefectStatus}
          />
        ))}

        {/* Road Condition Mode: Defect Density & Severity Heat Bubbles */}
        {roadConditionMode && defects.map((defect) => {
          const rec = defect.recurrence_count || 1;
          const radius = rec >= 3 ? 24 : rec === 2 ? 18 : 12;
          const color = rec >= 3 ? '#dc2626' : rec === 2 ? '#d97706' : '#2563eb';
          return (
            <CircleMarker
              key={`density-${defect.id}`}
              center={[defect.lat, defect.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.55,
                weight: 2
              }}
            >
              <Tooltip>
                <div className="text-xs font-mono p-1 text-slate-900">
                  <div className="font-bold text-slate-900">{defect.type.toUpperCase()} DENSITY</div>
                  <div className="text-slate-700">Recurrence: <b>{rec} detections</b></div>
                  <div className="text-amber-700 font-semibold">Priority: {defect.priority}</div>
                  <div className="text-slate-600">{defect.address}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
