import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, AlertTriangle, FileText, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE = 'http://localhost:8002/incidents';

export function IncidentManager() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE);
      const data = await response.json();
      setIncidents(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = incidents.filter(i => i.severity === 'P0' && i.status !== 'CLOSED').length;
  const warningCount = incidents.filter(i => i.severity !== 'P0' && i.status !== 'CLOSED').length;

  return (
    <div className="space-y-6 overflow-y-auto pr-2 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-blue-600 dark:text-blue-500" />
            Active Work Items
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
            {loading ? "Syncing..." : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-200 uppercase animate-pulse">{criticalCount} Critical</span>}
          {warningCount > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200 uppercase">{warningCount} Warnings</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No incidents detected in the system.
          </div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:border-blue-300 transition-all shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded flex items-center justify-center",
                    inc.severity === 'P0' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  )}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                      {inc.component_id}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">{inc.id}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase",
                    inc.status === 'OPEN' ? "bg-red-500" :
                    inc.status === 'INVESTIGATING' ? "bg-blue-500" :
                    inc.status === 'RESOLVED' ? "bg-green-500" : "bg-slate-500"
                  )}>
                    {inc.status}
                  </span>
                  {inc.mttr_minutes && <p className="text-[10px] text-slate-500">MTTR: {inc.mttr_minutes}m</p>}
                </div>
              </div>

              <div className="flex items-center gap-6 mb-4 text-[11px] font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>Start: {new Date(inc.start_time).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                  <Activity size={14} className="text-blue-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">{inc.signal_count} Signals</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 py-2 rounded text-xs font-bold transition-colors">
                  View Audit Trail
                </button>
                {inc.status === 'RESOLVED' && (
                  <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2">
                    <FileText size={14} />
                    Submit RCA
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
