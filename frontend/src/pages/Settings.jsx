import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Database, 
  Cpu, 
  MapPin, 
  BellRing, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { sound } from '../services/sound';

export default function Settings() {
  const [confThreshold, setConfThreshold] = useState(0.35);
  const [telemetryRate, setTelemetryRate] = useState(2.5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cityCorridor, setCityCorridor] = useState('Vijayawada Central & Amaravati Metropolitan');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSoundToggle = (e) => {
    const val = e.target.checked;
    setSoundEnabled(val);
    sound.enabled = val;
    if (val) sound.playAlertChime();
  };

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wider">
              PLATFORM SYSTEM CONFIGURATION & EDGE PARAMETERS
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            ASTRA Node Settings • YOLOv11n Edge Tuning • Municipal Network Parameters
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Applied!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Edge AI Parameters */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase">Edge AI Perception Tuning (YOLOv11n)</h2>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1.5 text-slate-700 dark:text-slate-300">
                <span>YOLOv11 Detection Confidence Threshold:</span>
                <span className="font-extrabold text-blue-600">{Math.round(confThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-slate-700 dark:text-slate-300">
                <span>Telemetry GPS Broadcast Rate:</span>
                <span className="font-extrabold text-blue-600">{telemetryRate} sec</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={telemetryRate}
                onChange={(e) => setTelemetryRate(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 cursor-pointer font-semibold">
                <span>Audible Incident Chime (Web Audio Synthesizer):</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={handleSoundToggle}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Municipal Geo-Anchor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase">Corridor Geofencing & Basemap</h2>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-500 block mb-1">Target Urban Jurisdiction:</label>
              <input
                type="text"
                value={cityCorridor}
                onChange={(e) => setCityCorridor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Primary Basemap:</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">OpenStreetMap (OSM Standard)</span>
              </div>
              <div className="flex justify-between">
                <span>Mapbox Token Required:</span>
                <span className="text-emerald-700 font-bold">NO (100% Free / Open Source)</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Database:</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">SQLite + SpatiaLite Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-all shadow-md shadow-blue-600/30"
        >
          Apply Configuration
        </button>
      </div>
    </div>
  );
}
