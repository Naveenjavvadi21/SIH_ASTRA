import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../hooks/useTheme';

export default function DashboardLayout({ 
  isConnected, 
  activeRole, 
  setActiveRole, 
  alertCount, 
  onOpenAlerts 
}) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors">
      {/* Top Bar */}
      <Navbar
        isConnected={isConnected}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        theme={theme}
        toggleTheme={toggleTheme}
        alertCount={alertCount}
        onOpenAlerts={onOpenAlerts}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Dynamic Route Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/70 dark:bg-[#090d16]/95">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
