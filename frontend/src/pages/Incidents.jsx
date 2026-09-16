import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  FileDown, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Eye, 
  Sparkles,
  ShieldAlert,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import IncidentModal from '../components/IncidentModal';

export default function Incidents() {
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error('Failed to load alerts:', e);
    }
  };

  const handleExportPDF = async (alertItem, e) => {
    e.stopPropagation();
    try {
      setDownloadingId(alertItem.id);
      const pdfUrl = api.getIncidentPdfUrl(alertItem.id);
      const res = await fetch(pdfUrl);
      if (!res.ok) throw new Error('PDF failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ASTRA_Incident_${alertItem.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const exportIncidentsCSV = () => {
    const headers = ['Incident_ID', 'Type', 'License_Plate', 'Confidence', 'Bus_ID', 'Location', 'Status', 'Timestamp'];
    const rows = alerts.map(a => [
      a.id,
      a.type,
      a.license_plate,
      a.confidence,
      a.bus_id,
      `"${a.location_name.replace(/"/g, '""')}"`,
      a.status,
      a.timestamp
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASTRA_Incidents_Log_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleQuickStatus = async (alertItem, e) => {
    e.stopPropagation();
    try {
      const nextStatus = alertItem.status === 'OPEN' ? 'REVIEWED' : 'RESOLVED';
      const updated = await api.updateAlertStatus(alertItem.id, nextStatus, 'Quick update from Incidents Table');
      setAlerts((prev) => prev.map((a) => (a.id === alertItem.id ? updated : a)));
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const filtered = alerts.filter((a) => {
    const matchesSearch = 
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.bus_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || a.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wider">
              INCIDENT MANAGEMENT & EVIDENCE DOSSIER
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Automated Traffic Violations, Hit & Run Reports, and Municipal Infraction Exports (YOLOv11 + ANPR)
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search plate, ID, bus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="HIT_AND_RUN">Hit & Run</option>
            <option value="ILLEGAL_PARKING">Illegal Parking</option>
            <option value="RECKLESS_DRIVING">Reckless Driving</option>
            <option value="WATERLOGGED_ROAD">Waterlogged Road</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportIncidentsCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold transition-all border border-slate-200 dark:border-slate-700"
            title="Download CSV Incident Logs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Incident ID</th>
                <th className="p-3.5">Violation Type</th>
                <th className="p-3.5">License Plate</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Bus Unit</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No incidents match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isHitAndRun = item.type === 'HIT_AND_RUN';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedAlert(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{item.id}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center space-x-1 font-bold ${
                          isHitAndRun ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          <span>{isHitAndRun ? '🚨' : '⚠️'}</span>
                          <span>{item.type.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs">
                          {item.license_plate}
                        </span>
                      </td>

                      <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-bold">
                        {Math.round((item.confidence || 0.9) * 100)}%
                      </td>

                      <td className="p-3.5 text-blue-700 dark:text-cyan-300 font-semibold">
                        {item.bus_id}
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-[220px] truncate font-sans font-medium">
                        {item.location_name}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'OPEN'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.status === 'REVIEWED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={(e) => handleQuickStatus(item, e)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                          title="Advance Status"
                        >
                          {item.status === 'OPEN' ? 'Review' : 'Resolve'}
                        </button>

                        <button
                          onClick={(e) => handleExportPDF(item, e)}
                          disabled={downloadingId === item.id}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors inline-flex items-center space-x-1 shadow-sm"
                          title="Download Official PDF Report"
                        >
                          {downloadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5" />
                          )}
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedAlert && (
        <IncidentModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onStatusUpdated={(id, status) => {
            setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
            setSelectedAlert((prev) => (prev ? { ...prev, status } : null));
          }}
        />
      )}
    </div>
  );
}
