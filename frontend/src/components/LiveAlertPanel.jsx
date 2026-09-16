import React from 'react';
import { AlertTriangle, Clock, MapPin, Eye, Sparkles, PlusCircle } from 'lucide-react';

export default function LiveAlertPanel({ 
  alerts = [], 
  onSelectAlert, 
  onTriggerDemoIncident, 
  isTriggering = false 
}) {
  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
          <h2 className="font-bold text-sm tracking-wider font-mono text-slate-900 dark:text-slate-100 uppercase">
            LIVE INCIDENTS
          </h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30">
            {alerts.length} Active
          </span>
        </div>

        {/* Manual Judge Demo Trigger */}
        <button
          onClick={onTriggerDemoIncident}
          disabled={isTriggering}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-mono font-bold transition-all shadow-sm shadow-rose-600/20 disabled:opacity-50"
          title="Simulate immediate live incident via WebSocket"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isTriggering ? 'Dispatching...' : '+ Test Alert'}</span>
        </button>
      </div>

      {/* Alerts Stream List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {alerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs font-mono space-y-2">
            <AlertTriangle className="w-6 h-6 text-slate-300" />
            <span>No active incidents in queue</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const isHitAndRun = alert.type === 'HIT_AND_RUN';
            const isCritical = alert.type === 'HIT_AND_RUN' || alert.type === 'WATERLOGGED_ROAD';
            const isPulsing = alert.pulse;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                  isCritical 
                    ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-500/40 hover:border-rose-300' 
                    : 'bg-slate-50/60 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 hover:border-slate-300'
                } ${isPulsing ? 'ring-2 ring-rose-500 animate-pulse-fast' : ''}`}
              >
                {/* Top Row: Type & Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">{isHitAndRun ? '🚨' : alert.type === 'WATERLOGGED_ROAD' ? '🌊' : '⚠️'}</span>
                    <span className="font-bold text-xs tracking-wide text-slate-900 dark:text-white font-mono uppercase">
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    alert.status === 'OPEN' 
                      ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30' 
                      : alert.status === 'REVIEWED'
                      ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-1 text-xs font-mono text-slate-700 dark:text-slate-300 mb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plate:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
                      {alert.license_plate || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {Math.round((alert.confidence || 0.9) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reporting Bus:</span>
                    <span className="text-blue-700 dark:text-cyan-300 font-semibold">{alert.bus_id}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate font-sans font-medium">{alert.location_name}</span>
                  </div>
                </div>

                {/* Action View Button */}
                <div className="flex justify-end pt-1.5 border-t border-slate-200 dark:border-slate-800/80">
                  <button
                    onClick={() => onSelectAlert(alert)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-cyan-600/20 dark:hover:bg-cyan-600/40 dark:text-cyan-300 dark:border-cyan-500/30 text-xs font-mono font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>[VIEW DOSSIER]</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
