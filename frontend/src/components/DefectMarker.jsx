import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AlertCircle, Droplets, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const DEFECT_CONFIG = {
  pothole: {
    color: '#ea580c', // Orange
    bgColor: 'rgba(234, 88, 12, 0.15)',
    borderColor: '#c2410c',
    label: 'Pothole Defect',
    icon: '🕳️'
  },
  waterlogging: {
    color: '#0284c7', // Blue
    bgColor: 'rgba(2, 132, 199, 0.15)',
    borderColor: '#0369a1',
    label: 'Waterlogging Inundation',
    icon: '🌊'
  },
  missing_signage: {
    color: '#ca8a04', // Yellow
    bgColor: 'rgba(202, 138, 4, 0.15)',
    borderColor: '#a16207',
    label: 'Missing Road Signage',
    icon: '⚠️'
  }
};

const createDefectIcon = (type, recurrence, priority) => {
  const cfg = DEFECT_CONFIG[type] || DEFECT_CONFIG.pothole;
  const isHigh = priority === 'HIGH' || recurrence >= 3;

  return L.divIcon({
    className: 'custom-defect-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: ${cfg.color};
          border: 3px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          box-shadow: 0 4px 12px ${isHigh ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0,0,0,0.25)'};
          animation: ${isHigh ? 'pulse 1.2s infinite' : 'none'};
        ">
          ${cfg.icon}
        </div>
        <!-- Recurrence badge on marker -->
        <div style="
          position: absolute;
          top: -6px;
          right: -8px;
          background: ${isHigh ? '#dc2626' : '#1e293b'};
          color: #ffffff;
          font-family: monospace;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 9999px;
          border: 1.5px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          x${recurrence}
        </div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 21],
    popupAnchor: [0, -22]
  });
};

export default function DefectMarker({ defect, onStatusChange }) {
  if (!defect || !defect.lat || !defect.lng) return null;

  const cfg = DEFECT_CONFIG[defect.type] || DEFECT_CONFIG.pothole;
  const recurrence = defect.recurrence_count || 1;
  const priority = defect.priority || (recurrence >= 3 ? 'HIGH' : recurrence === 2 ? 'MEDIUM' : 'LOW');
  const icon = createDefectIcon(defect.type, recurrence, priority);

  let detectedBuses = [];
  try {
    if (typeof defect.detected_by === 'string') {
      detectedBuses = JSON.parse(defect.detected_by);
    } else if (Array.isArray(defect.detected_by)) {
      detectedBuses = defect.detected_by;
    }
  } catch {
    detectedBuses = ['ASTRA-Fleet'];
  }

  const priorityBadgeColor = {
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }[priority] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Marker position={[defect.lat, defect.lng]} icon={icon}>
      <Popup>
        <div className="p-1 space-y-2 font-sans min-w-[240px] text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-extrabold text-slate-800 font-mono text-xs tracking-wider">
              {defect.id}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${priorityBadgeColor}`}>
              {priority} PRIORITY
            </span>
          </div>

          {/* Type & Location */}
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <span>{cfg.label}</span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">{defect.address}</div>
          </div>

          {/* Recurrence & Detection Box */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between items-center text-slate-700">
              <span>Multi-Bus Recurrence:</span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {recurrence} buses verified
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>YOLOv11 Confidence:</span>
              <span className="text-emerald-700 font-bold">
                {Math.round((defect.confidence || 0.9) * 100)}%
              </span>
            </div>
            <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-200">
              Reporting Fleet Units:
              <div className="flex flex-wrap gap-1 mt-1">
                {detectedBuses.map((busId) => (
                  <span key={busId} className="px-1.5 py-0.5 rounded bg-white text-blue-700 border border-slate-300 text-[10px] font-bold shadow-xs">
                    {busId}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            <button
              onClick={() => onStatusChange && onStatusChange(defect.id, defect.status === 'OPEN' ? 'IN_PROGRESS' : 'REPAIRED')}
              className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{defect.status === 'OPEN' ? 'Dispatch PWD Repair' : 'Mark as Repaired'}</span>
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
