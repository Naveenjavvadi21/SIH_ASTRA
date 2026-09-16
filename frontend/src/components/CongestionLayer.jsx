import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { CONGESTION_SEGMENTS } from '../data/routesData';

export default function CongestionLayer({ isVisible = true }) {
  if (!isVisible) return null;

  return (
    <>
      {CONGESTION_SEGMENTS.map((segment, idx) => (
        <Polyline
          key={`congestion-${idx}`}
          positions={segment.coordinates}
          pathOptions={{
            color: segment.color,
            weight: 6,
            opacity: 0.85,
            dashArray: segment.level === 'HIGH' ? '1, 10' : undefined,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        >
          <Tooltip sticky>
            <div className="text-xs font-mono p-1">
              <div className="font-bold text-slate-100">{segment.name}</div>
              <div className="text-slate-300">
                Density: <span className="font-bold" style={{ color: segment.color }}>{segment.vehicles_min} vehicles/min</span>
              </div>
              <div className="text-slate-400">Congestion: {segment.level}</div>
            </div>
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
}
