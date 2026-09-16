import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  Clock, 
  MapPin, 
  Cpu, 
  ShieldAlert,
  Loader2,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function IncidentModal({ alert, onClose, onStatusUpdated }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!alert) return null;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const pdfUrl = api.getIncidentPdfUrl(alert.id);
      
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('PDF export failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ASTRA_Incident_${alert.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('PDF export error:', e);
      window.alert('Failed to export PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleMarkReviewed = async () => {
    try {
      setIsUpdating(true);
      const newStatus = alert.status === 'OPEN' ? 'REVIEWED' : 'DISPATCHED';
      await api.updateAlertStatus(alert.id, newStatus, 'Reviewed and verified by Smart City Command Center operator');
      if (onStatusUpdated) onStatusUpdated(alert.id, newStatus);
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-mono">{alert.id}</h3>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase">{alert.type.replace('_', ' ')}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Simulated Edge Camera Snapshot Preview */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-300 dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />
            
            {/* Visual simulation of camera frame */}
            <div className="text-center z-20 space-y-2 p-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-600/30 border border-rose-400/50 text-rose-200 font-mono text-xs">
                <span>EVIDENCE LOCALIZED • YOLOv11n</span>
              </div>
              <div className="text-2xl md:text-3xl font-mono font-extrabold text-white tracking-widest bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-700 shadow-lg">
                {alert.license_plate}
              </div>
              <div className="text-xs font-mono text-slate-300">
                Optical Plate OCR Scan • Confidence: {Math.round((alert.confidence || 0.9) * 100)}%
              </div>
            </div>

            {/* Bounding box outline */}
            <div className="absolute inset-8 border-2 border-dashed border-rose-500/80 rounded pointer-events-none" />
          </div>

          {/* Incident Meta Table */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500">Reporting Mobile Unit:</span>
              <div className="text-blue-700 dark:text-cyan-300 font-bold mt-0.5">{alert.bus_id}</div>
            </div>
            <div>
              <span className="text-slate-500">Current Status:</span>
              <div className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">{alert.status}</div>
            </div>
            <div>
              <span className="text-slate-500">GPS Coordinates:</span>
              <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{alert.lat?.toFixed(4)}, {alert.lng?.toFixed(4)}</div>
            </div>
            <div>
              <span className="text-slate-500">AI Confidence Rating:</span>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{Math.round((alert.confidence || 0.9) * 100)}%</div>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Location Details:</span>
              <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 font-sans">{alert.location_name}</div>
            </div>
            {alert.notes && (
              <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Operator Audit Notes:</span>
                <div className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px] font-sans italic">{alert.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleMarkReviewed}
            disabled={isUpdating}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUpdating ? 'Saving...' : alert.status === 'OPEN' ? 'Mark Reviewed' : 'Dispatch Squad'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-blue-600/30 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span>{isExporting ? 'Exporting...' : 'Export Incident Report (PDF)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
