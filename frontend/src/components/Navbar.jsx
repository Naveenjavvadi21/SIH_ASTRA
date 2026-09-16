import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  HardHat, 
  Bus, 
  Landmark,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { sound } from '../services/sound';

export const ROLES = [
  { id: 'commissioner', label: 'City Commissioner', icon: Landmark, color: 'text-amber-500' },
  { id: 'police', label: 'Traffic Police HQ', icon: ShieldCheck, color: 'text-blue-600' },
  { id: 'pwd', label: 'Municipal Engineer (PWD)', icon: HardHat, color: 'text-orange-500' },
  { id: 'fleet', label: 'Bus Fleet Manager', icon: Bus, color: 'text-cyan-600' },
];

export default function Navbar({ 
  isConnected, 
  activeRole, 
  setActiveRole, 
  theme, 
  toggleTheme, 
  alertCount = 4,
  onOpenAlerts
}) {
  const [time, setTime] = useState(new Date());
  const [soundActive, setSoundActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const state = sound.toggle();
    setSoundActive(state);
    if (state) sound.playAlertChime();
  };

  const currentRoleObj = ROLES.find(r => r.id === activeRole) || ROLES[0];
  const RoleIcon = currentRoleObj.icon;

  return (
    <header className="h-16 bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md transition-colors">
      {/* Brand & Live Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-base md:text-lg text-slate-900 dark:text-white font-mono">
                ASTRA
              </span>
              <span className="text-slate-300 dark:text-slate-600 text-xs hidden sm:inline">•</span>
              <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 tracking-wider hidden sm:inline">
                URBAN INTELLIGENCE
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden md:block">
              SIH26124 • YOLOv11 Mobile Sensing Network
            </div>
          </div>
        </div>

        {/* Live System Pulsing Pill */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold ml-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>LIVE SYSTEM</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Simulated Time */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>{time.toLocaleTimeString()} IST</span>
        </div>

        {/* WebSocket Connection Status */}
        <div 
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono border ${
            isConnected 
              ? 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/30 text-blue-700 dark:text-cyan-400' 
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}
          title={isConnected ? 'Connected to Edge Stream' : 'Connecting to Edge Stream...'}
        >
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span className="hidden sm:inline font-semibold">WS SYNC</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="hidden sm:inline font-semibold">RECONNECTING</span>
            </>
          )}
        </div>

        {/* Audio Alert Chime Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border transition-all ${
            soundActive
              ? 'bg-blue-50 dark:bg-slate-900 border-blue-200 dark:border-slate-800 text-blue-600 dark:text-cyan-400'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
          }`}
          title={soundActive ? 'Alert audio chimes enabled' : 'Alert audio chimes muted'}
        >
          {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            {ROLES.map(role => (
              <option key={role.id} value={role.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {role.label}
              </option>
            ))}
          </select>
          <RoleIcon className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${currentRoleObj.color}`} />
        </div>

        {/* Live Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          title="View Live Incidents"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600" />
          )}
        </button>
      </div>
    </header>
  );
}
