import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Activity, 
  ShieldCheck, 
  Compass, 
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('TODAY');
  const [defectsByType, setDefectsByType] = useState([]);
  const [recurrenceData, setRecurrenceData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [fleetMetrics, setFleetMetrics] = useState([]);
  const [rqiData, setRqiData] = useState([]);
  const [congestionData, setCongestionData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [byType, recurrence, hourly, fleet, rqi, congestion] = await Promise.all([
        api.getDefectsByType(),
        api.getRecurrenceBreakdown(),
        api.getHourlyIncidents(),
        api.getFleetMetrics(),
        api.getRoadQualityIndex(),
        api.getCongestionCorridors()
      ]);
      setDefectsByType(byType);
      setRecurrenceData(recurrence);
      setHourlyData(hourly);
      setFleetMetrics(fleet);
      setRqiData(rqi);
      setCongestionData(congestion);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }
  };

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wider">
              URBAN INTELLIGENCE & INFRASTRUCTURE ANALYTICS
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Real-time Telemetry Aggregations • Road Quality Index (RQI) • Multi-Corridor Congestion Trends
          </p>
        </div>

        {/* Time-Range Selector */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {['TODAY', 'LAST 7 DAYS', 'LAST 30 DAYS'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                timeRange === r
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-cyan-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Defects by Category (Donut) + Recurrence Escalation (Bar) + 24h Incidents (Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Defects by Category */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase">Defect Distribution</span>
            <span className="text-[10px] font-mono text-slate-500">By Type</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defectsByType}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {defectsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
            {defectsByType.map((d) => (
              <div key={d.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-700 dark:text-slate-300">{d.name}: <b>{d.count}</b></span>
              </div>
            ))}
          </div>
        </div>

        {/* Recurrence Escalation Distribution */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase">Recurrence Escalation</span>
            <span className="text-[10px] font-mono text-slate-500">Multi-Bus Verification</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recurrenceData}>
                <XAxis dataKey="level" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {recurrenceData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] font-mono text-slate-500 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            Priority automatically escalates to <span className="text-rose-600 font-bold">HIGH</span> upon 3+ verified bus scans
          </div>
        </div>

        {/* 24-Hour Incident Trajectory */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase">24-Hour Incident Trajectory</span>
            <span className="text-[10px] font-mono text-slate-500">Hourly Density</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="incColorLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#incColorLight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] font-mono text-slate-500 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            Peak incident density observed during evening rush hour (18:00 IST)
          </div>
        </div>
      </div>

      {/* Row 2: Road Quality Index (RQI) by Ward + Corridor Congestion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Road Quality Index Cards */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase">Road Quality Index (RQI) by Municipal Ward</span>
            <span className="text-[10px] font-mono text-blue-600 font-bold">Scale: 0 - 100</span>
          </div>

          <div className="space-y-2.5">
            {rqiData.map((item) => (
              <div key={item.zone} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">{item.zone}</span>
                  <span className="font-extrabold text-sm" style={{ color: item.color }}>
                    Score: {item.score}/100
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%`, backgroundColor: item.color }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Status: <b style={{ color: item.color }}>{item.status}</b></span>
                  <span>Target: 85+</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corridor Congestion Speeds & Density */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase">Corridor Congestion & Traffic Flow</span>
            <span className="text-[10px] font-mono text-slate-500">Sensors / Min</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5">Corridor Segment</th>
                  <th className="p-2.5">Density</th>
                  <th className="p-2.5">Avg Speed</th>
                  <th className="p-2.5">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {congestionData.map((c) => (
                  <tr key={c.corridor} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{c.corridor}</td>
                    <td className="p-2.5 text-slate-700 dark:text-slate-300">{c.vehicles_per_min} v/min</td>
                    <td className="p-2.5 text-blue-700 dark:text-cyan-300 font-bold">{c.speed_avg}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.level === 'HIGH' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : c.level === 'MEDIUM' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {c.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
