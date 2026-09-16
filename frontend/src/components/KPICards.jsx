import React from 'react';
import { Bus, Construction, AlertTriangle, Gauge, Route, Sparkles } from 'lucide-react';

export default function KPICards({ kpis, role = 'commissioner' }) {
  const cards = [
    {
      id: 'buses',
      title: 'ACTIVE BUSES',
      value: kpis?.active_buses ? `0${kpis.active_buses}` : '05',
      subtext: '● All systems operational',
      subtextColor: 'text-emerald-600 dark:text-emerald-400 font-medium',
      icon: Bus,
      iconColor: 'text-blue-600 dark:text-cyan-400',
      borderColor: role === 'fleet' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
    },
    {
      id: 'defects',
      title: 'ROAD DEFECTS',
      value: kpis?.total_defects ?? 8,
      subtext: `${kpis?.high_priority_defects ?? 3} high priority recurrence`,
      subtextColor: 'text-orange-600 dark:text-orange-400 font-medium',
      icon: Construction,
      iconColor: 'text-orange-500 dark:text-orange-400',
      borderColor: role === 'pwd' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200 dark:border-slate-800'
    },
    {
      id: 'incidents',
      title: 'ACTIVE INCIDENTS',
      value: kpis?.active_incidents ?? 4,
      subtext: '1 Critical Hit & Run queued',
      subtextColor: 'text-rose-600 dark:text-rose-400 font-medium',
      icon: AlertTriangle,
      iconColor: 'text-rose-500 dark:text-rose-400',
      borderColor: role === 'police' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'
    },
    {
      id: 'traffic',
      title: 'AVG TRAFFIC DENSITY',
      value: `${kpis?.avg_traffic_density ?? 62}/m`,
      subtext: 'Moderate corridor flow',
      subtextColor: 'text-amber-600 dark:text-amber-400 font-medium',
      icon: Gauge,
      iconColor: 'text-amber-500 dark:text-amber-400',
      borderColor: 'border-slate-200 dark:border-slate-800'
    },
    {
      id: 'routes',
      title: 'ROUTES MONITORED',
      value: `${kpis?.routes_monitored ?? 5}`,
      subtext: `${kpis?.total_corridor_km ?? 142.8} km urban span`,
      subtextColor: 'text-blue-600 dark:text-cyan-400 font-medium',
      icon: Route,
      iconColor: 'text-indigo-600 dark:text-blue-400',
      borderColor: 'border-slate-200 dark:border-slate-800'
    },
    {
      id: 'ai_events',
      title: 'AI EVENTS TODAY',
      value: kpis?.ai_events_today ? kpis.ai_events_today.toLocaleString() : '1,845',
      subtext: 'YOLOv11n + ANPR edge scans',
      subtextColor: 'text-purple-600 dark:text-purple-400 font-medium',
      icon: Sparkles,
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-slate-200 dark:border-slate-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border ${card.borderColor} shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 dark:text-slate-400 uppercase">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {card.value}
            </div>
            <div className={`text-[11px] font-mono mt-1 ${card.subtextColor} truncate`}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
