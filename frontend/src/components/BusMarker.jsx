import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bus as BusIcon, Activity, Battery, Compass, Gauge, Users } from 'lucide-react';

const createBusIcon = (heading = 0, busId = '') => {
  const shortId = busId.replace('ASTRA-', '');
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
          transform: rotate(${heading}deg);
          transition: transform 0.6s ease;
        ">
          <!-- Arrow pointing in heading direction -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
        <div style="
          background: #ffffff;
          color: #1e3a8a;
          font-family: monospace;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 6px;
          border: 1px solid #bfdbfe;
          margin-top: 3px;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        ">
          #${shortId}
        </div>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 26],
    popupAnchor: [0, -28]
  });
};

export default function BusMarker({ bus, onSelectBus }) {
  if (!bus || !bus.lat || !bus.lng) return null;

  const icon = createBusIcon(bus.heading, bus.id);

  return (
    <Marker 
      position={[bus.lat, bus.lng]} 
      icon={icon}
      eventHandlers={{
        click: () => onSelectBus && onSelectBus(bus)
      }}
    >
      <Popup>
        <div className="p-1 space-y-2.5 font-sans min-w-[220px] text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <BusIcon className="w-4 h-4 text-blue-600" />
              <span className="font-extrabold text-blue-700 font-mono text-sm">{bus.id}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
              {bus.status || 'IN_TRANSIT'}
            </span>
          </div>

          {/* Route & Plate */}
          <div className="text-xs space-y-0.5">
            <div className="text-slate-800 font-bold">{bus.route_name}</div>
            <div className="text-[11px] font-mono text-slate-500 font-medium">Plate: {bus.plate_number}</div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-700">
              <Gauge className="w-3.5 h-3.5 text-amber-500" />
              <span><b>{bus.speed}</b> km/h</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-700">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span><b>{bus.occupancy}%</b> cap</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-700">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span><b>{bus.heading}°</b> head</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-700">
              <Battery className="w-3.5 h-3.5 text-emerald-600" />
              <span><b>{bus.battery_or_fuel}%</b> batt</span>
            </div>
          </div>

          {/* AI Edge Status */}
          <div className="text-[10px] font-mono space-y-0.5 pt-1 border-t border-slate-100">
            <div className="flex justify-between text-slate-500">
              <span>YOLOv11 Edge Unit:</span>
              <span className="text-emerald-700 font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GPS:</span>
              <span className="text-slate-700 font-medium">{bus.lat.toFixed(4)}, {bus.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
