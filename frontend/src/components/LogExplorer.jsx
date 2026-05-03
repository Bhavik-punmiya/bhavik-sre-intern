import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown, ArrowLeft, Terminal, RefreshCcw, Database, Cpu, Layout, Activity, Loader2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE = 'http://localhost:8002/incidents';

export function LogExplorer() {
  const [view, setView] = useState('groups'); // groups, streams, events
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const logGroups = [
    { name: 'mock-data-service', service: 'API', icon: Layout },
    { name: 'mcp-processor', service: 'MCP', icon: Cpu },
    { name: 'RDBMS', service: 'RDBMS', icon: Database },
    { name: 'CACHE', service: 'CACHE', icon: Activity },
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/logs?${selectedGroup ? `component_id=${selectedGroup.name}` : ''}&search=${search}`;
      const response = await fetch(url);
      const data = await response.json();
      setLogs(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [selectedGroup, search]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Search Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search Log Group / Stream / Keyword..." 
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          {loading ? (
            <div className="flex items-center gap-2 text-blue-600 animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>Live • {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-transparent flex items-center gap-2 text-[11px] font-medium">
        {view !== 'groups' && (
          <button onClick={() => setView('groups')} className="hover:text-blue-600 transition-colors">
            <ArrowLeft size={12} />
          </button>
        )}
        <span className={cn("cursor-pointer", view === 'groups' ? "text-slate-900 dark:text-white" : "text-slate-400")} onClick={() => setView('groups')}>Log groups</span>
        {selectedGroup && (
          <>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 dark:text-white font-bold">{selectedGroup.name}</span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'groups' ? (
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase text-[9px] border-b border-slate-100 dark:border-slate-900">
              <tr>
                <th className="p-4 text-left">Log group name</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
              {logGroups.map((group) => (
                <tr key={group.name} onClick={() => { setSelectedGroup(group); setView('events'); }} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition-colors">
                  <td className="p-4 text-blue-600 font-medium font-mono hover:underline">/aws/lambda/{group.name}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{group.service}</span>
                  </td>
                  <td className="p-4 text-right"><ChevronRight size={14} className="ml-auto opacity-30" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="font-mono text-[11px] bg-white dark:bg-black h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center text-slate-400">
              <span>Displaying 100 most recent events</span>
              <div className="flex gap-4">
                <span>Timestamp</span>
                <span className="w-96">Message</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
              {logs.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-400 italic">No logs found. Run the simulation to populate.</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="group">
                    <div 
                      onClick={() => setExpandedLog(expandedLog === i ? null : i)}
                      className={cn(
                        "flex gap-4 p-2 cursor-pointer transition-colors items-start",
                        expandedLog === i ? "bg-slate-50 dark:bg-slate-900" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      )}
                    >
                      <div className="mt-1 text-slate-400">
                        {expandedLog === i ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                      <span className="text-slate-400 shrink-0 select-none w-24">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={cn(
                        "flex-1 break-all",
                        log.severity === 'P0' ? "text-red-600 font-bold" : 
                        log.severity === 'P1' ? "text-orange-600" : 
                        "text-slate-700 dark:text-slate-300"
                      )}>
                        {log.message}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        {log.severity}
                      </span>
                    </div>

                    {expandedLog === i && (
                      <div className="px-12 py-4 bg-slate-100 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Extended Metadata</span>
                          <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400"><Copy size={12} /></button>
                        </div>
                        <pre className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                          {JSON.stringify({
                            request_id: log.metadata?.request_id || 'N/A',
                            error_code: log.error_code,
                            component: log.component_id,
                            type: log.component_type,
                            env: log.metadata?.environment,
                            region: log.metadata?.region,
                            stack_trace: log.metadata?.stack_trace
                          }, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
