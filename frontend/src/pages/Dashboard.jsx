import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { workflowApi } from '../api/client';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { StatCard } from '../components/StatCard';
import { SeverityBadge, StatusChip } from '../components/Badges';
import { AlertCircle, Zap, Clock, Activity, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: incidents, loading: incLoading } = useAutoRefresh(() => workflowApi.get('/incidents'), 10000);
  const { data: throughput, loading: metLoading } = useAutoRefresh(() => workflowApi.get('/metrics/throughput'), 10000);
  const { data: summary } = useAutoRefresh(() => workflowApi.get('/metrics/summary'), 5000);

  // Derived stats
  const activeIncidents = incidents?.filter(i => i.status !== 'CLOSED') || [];
  const p0Count = activeIncidents.filter(i => i.severity === 'P0').length;
  const closedIncidents = incidents?.filter(i => i.status === 'CLOSED') || [];
  const avgMttr = closedIncidents.length > 0 
    ? (closedIncidents.reduce((acc, i) => acc + (i.mttr_minutes || 0), 0) / closedIncidents.length).toFixed(1)
    : 0;

  // Chart data formatting
  const chartData = throughput?.map(m => ({
    time: new Date(m.bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    count: parseInt(m.signal_count)
  })).reverse() || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard title="Active Incidents" value={activeIncidents.length} icon={AlertCircle} color="#3b82f6" />
        <StatCard title="P0 Critical" value={p0Count} icon={Zap} color="#ef4444" />
        <StatCard title="Avg MTTR (min)" value={avgMttr} icon={Clock} color="#8b5cf6" />
        <StatCard title="Signals/sec" value={summary?.signals_per_sec || 0} icon={Activity} color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
        {/* Throughput Chart */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} /> System Throughput (Signals/min)
          </h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '12px' }} 
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Health Summary */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>Active Signal Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['CACHE', 'RDBMS', 'API', 'MCP'].map(type => {
              const typeIncidents = activeIncidents.filter(i => i.component_type === type);
              return (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{type}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: typeIncidents.length > 0 ? '#ef4444' : '#10b981' }}>
                      {typeIncidents.length > 0 ? `${typeIncidents.length} Alerting` : 'Healthy'}
                    </span>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: typeIncidents.length > 0 ? '#ef4444' : '#10b981' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Denser Incident Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Critical Active Incidents</h3>
          <button onClick={() => navigate('/alarms')} style={{ fontSize: '12px', color: 'var(--brand-primary)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ExternalLink size={12} />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Severity</th>
              <th style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Component</th>
              <th style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Signals</th>
              <th style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Age</th>
              <th style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {activeIncidents.slice(0, 8).map((inc) => {
              const age = Math.floor((new Date() - new Date(inc.created_at)) / 60000);
              return (
                <tr 
                  key={inc.id} 
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '8px 20px' }}><SeverityBadge severity={inc.severity} /></td>
                  <td style={{ padding: '8px 20px', fontWeight: 'bold' }}>{inc.component_id}</td>
                  <td style={{ padding: '8px 20px' }}><StatusChip status={inc.status} /></td>
                  <td style={{ padding: '8px 20px', color: 'var(--brand-primary)', fontWeight: 'bold' }}>{inc.signal_count || 0}</td>
                  <td style={{ padding: '8px 20px', color: 'var(--text-muted)' }}>{age < 1 ? 'just now' : `${age}m`}</td>
                  <td style={{ padding: '8px 20px', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inc.message}
                  </td>
                </tr>
              );
            })}
            {activeIncidents.length === 0 && !incLoading && (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  System operating within normal parameters. No active incidents.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
