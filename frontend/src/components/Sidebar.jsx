import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  Cpu, 
  AlertTriangle, 
  Construction, 
  BarChart3, 
  BusFront, 
  Settings as SettingsIcon,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, tag: 'Live GIS' },
  { path: '/live-ops', label: 'Live Operations', icon: Radio, tag: 'Fleet Stream' },
  { path: '/onboard-ai', label: 'Onboard AI', icon: Cpu, tag: 'YOLOv11' },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle, tag: 'ANPR/Alerts' },
  { path: '/road-conditions', label: 'Road Conditions', icon: Construction, tag: 'Recurrence' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, tag: 'RQI / Trends' },
  { path: '/fleet', label: 'Fleet', icon: BusFront, tag: '5 Units' },
  { path: '/settings', label: 'Settings', icon: SettingsIcon, tag: 'Config' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className="w-64 bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] select-none shrink-0 transition-colors">
      {/* Navigation Section */}
      <div className="p-4 space-y-1">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-3 py-2">
          Operations Center
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                    {item.tag}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Card */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">ASTRA Node</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30 font-bold">
              OPTIMAL
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="text-blue-600 dark:text-slate-200 font-bold">YOLOv11n-COCO</span>
            </div>
            <div className="flex justify-between">
              <span>Active Fleet:</span>
              <span className="text-emerald-600 dark:text-cyan-400 font-semibold">5 / 5 Units</span>
            </div>
            <div className="flex justify-between">
              <span>Edge Uptime:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">99.4%</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
