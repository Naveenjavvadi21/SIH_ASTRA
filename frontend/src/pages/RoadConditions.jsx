import React, { useState, useEffect } from 'react';
import { 
  Construction, 
  Droplets, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Filter,
  FileSpreadsheet,
  X,
  Users,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';

export default function RoadConditions() {
  const [defects, setDefects] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [isTriggering, setIsTriggering] = useState(false);
  const [dispatchModalDefect, setDispatchModalDefect] = useState(null);
  const [assignedCrew, setAssignedCrew] = useState('PWD Rapid Patch Crew #04');
  const [repairWindow, setRepairWindow] = useState('4 Hours (High Priority)');

  useEffect(() => {
    loadDefects();
  }, []);

  const loadDefects = async () => {
    try {
      const data = await api.getDefects();
      setDefects(data);
    } catch (e) {
      console.error('Failed to load defects:', e);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'OPEN' ? 'IN_PROGRESS' : 'REPAIRED';
      const updated = await api.updateDefectStatus(id, nextStatus);
      setDefects((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (e) {
      console.error('Failed to update defect status:', e);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalDefect) return;
    try {
      const updated = await api.updateDefectStatus(dispatchModalDefect.id, 'IN_PROGRESS');
      setDefects((prev) => prev.map((d) => (d.id === dispatchModalDefect.id ? updated : d)));
      setDispatchModalDefect(null);
    } catch (e) {
      console.error('Failed to dispatch squad:', e);
    }
  };

  const handleTriggerSimulatedScan = async (type = 'pothole') => {
    try {
      setIsTriggering(true);
      await api.triggerDefect({
        type,
        bus_id: 'ASTRA-101',
        address: 'MG Road near Benz Circle Jn'
      });
      await loadDefects();
    } catch (e) {
      console.error('Trigger defect error:', e);
    } finally {
      setIsTriggering(false);
    }
  };

  const exportDefectsCSV = () => {
    const headers = ['Defect_ID', 'Type', 'Priority', 'Recurrence_Count', 'Latitude', 'Longitude', 'Location_Address', 'Status'];
    const rows = defects.map(d => [
      d.id,
      d.type,
      d.priority,
      d.recurrence_count,
      d.lat,
      d.lng,
      `"${d.address.replace(/"/g, '""')}"`,
      d.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASTRA_Road_Defects_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtered = defects.filter((d) => {
    const matchesType = filterType === 'ALL' || d.type === filterType;
    const matchesPriority = filterPriority === 'ALL' || d.priority === filterPriority;
    return matchesType && matchesPriority;
  });

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Construction className="w-5 h-5 text-orange-500" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wider">
              MUNICIPAL ROAD DEFECT & RECURRENCE MONITOR
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            PWD Infrastructure Telemetry • Multi-Bus Spatial Consensus • Auto-Escalation Work Orders
          </p>
        </div>

        {/* Action & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Defect Types</option>
            <option value="pothole">Potholes</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="missing_signage">Missing Signage</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority (x3+)</option>
            <option value="MEDIUM">Medium Priority (x2)</option>
            <option value="LOW">Low Priority (x1)</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={exportDefectsCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold transition-all border border-slate-200 dark:border-slate-700"
            title="Download CSV database dump"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Simulate New Edge Scan */}
          <button
            onClick={() => handleTriggerSimulatedScan('pothole')}
            disabled={isTriggering}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-mono font-bold transition-all shadow-sm shadow-orange-600/30 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTriggering ? 'Scanning...' : '+ Recurrence Scan'}</span>
          </button>
        </div>
      </div>

      {/* Recurrence Logic Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-blue-50 dark:from-orange-950/40 dark:via-slate-900 dark:to-cyan-950/40 border border-orange-200 dark:border-orange-500/30 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300 gap-2 shadow-xs">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-orange-500 shrink-0" />
          <span>
            <b>Multi-Bus Spatial Consensus:</b> 1 detection = <span className="text-emerald-700 font-bold">LOW</span>, 2 detections = <span className="text-amber-700 font-bold">MEDIUM</span>, 3+ detections = <span className="text-rose-700 font-extrabold">HIGH (Auto-Escalated Priority)</span>.
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Spatial Clustering Radius: 35 meters
        </span>
      </div>

      {/* Defect Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const rec = item.recurrence_count || 1;
          const isHigh = item.priority === 'HIGH' || rec >= 3;
          let detectedBuses = [];
          try {
            detectedBuses = typeof item.detected_by === 'string' ? JSON.parse(item.detected_by) : item.detected_by || [];
          } catch {
            detectedBuses = ['ASTRA-Fleet'];
          }

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${
                isHigh ? 'border-orange-300 dark:border-orange-500/60 ring-1 ring-orange-500/20 shadow-md' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm tracking-wider">
                    {item.id}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    item.priority === 'HIGH' 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : item.priority === 'MEDIUM' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {item.priority} PRIORITY
                  </span>
                </div>

                {/* Defect Type & Recurrence Counter */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {item.type === 'pothole' ? '🕳️' : item.type === 'waterlogging' ? '🌊' : '⚠️'}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white capitalize">{item.type.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-500">YOLOv11: {Math.round((item.confidence || 0.9) * 100)}%</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block">Recurrence:</span>
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                      {rec} buses
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="text-xs font-mono space-y-0.5 text-slate-700 dark:text-slate-300">
                  <div className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-semibold">{item.address}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-5">{item.ward}</div>
                </div>

                {/* Detected By Fleet Units */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-500 text-[10px]">Verified By Units:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detectedBuses.map((busId) => (
                      <span key={busId} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        {busId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                {item.status === 'OPEN' ? (
                  <button
                    onClick={() => setDispatchModalDefect(item)}
                    className="w-full py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dispatch PWD Squad</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(item.id, item.status)}
                    className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm ${
                      item.status === 'IN_PROGRESS'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item.status === 'IN_PROGRESS' ? 'Mark Repaired' : 'Closed / Repaired'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PWD Work-Order Dispatch Modal */}
      {dispatchModalDefect && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <Construction className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-sm text-slate-900 font-mono">
                  PWD WORK ORDER CREATION
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalDefect(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>Defect ID: <b className="text-slate-900">{dispatchModalDefect.id}</b></div>
                <div>Category: <b className="capitalize text-slate-900">{dispatchModalDefect.type}</b></div>
                <div>Location: <span className="text-slate-700">{dispatchModalDefect.address}</span></div>
                <div>Recurrence Count: <b className="text-orange-600">{dispatchModalDefect.recurrence_count} buses</b></div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Assign PWD Repair Crew:</label>
                <select
                  value={assignedCrew}
                  onChange={(e) => setAssignedCrew(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="PWD Rapid Patch Crew #04">PWD Rapid Patch Crew #04 (Central Ward)</option>
                  <option value="PWD Asphalt Squad Alpha">PWD Asphalt Squad Alpha (Highway Division)</option>
                  <option value="Municipal Drainage Emergency Unit">Municipal Drainage Emergency Unit (Riverfront)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Resolution Window (SLA):</label>
                <select
                  value={repairWindow}
                  onChange={(e) => setRepairWindow(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="4 Hours">4 Hours (Emergency High Priority)</option>
                  <option value="12 Hours">12 Hours (Standard Recurrence)</option>
                  <option value="24 Hours">24 Hours (Low Priority)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setDispatchModalDefect(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs font-bold shadow-sm"
              >
                Generate Work Order & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
