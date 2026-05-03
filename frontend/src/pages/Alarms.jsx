import React, { useState } from 'react';
import { workflowApi } from '../api/client';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { SeverityBadge, StatusChip } from '../components/Badges';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';

const Alarms = () => {
  const navigate = useNavigate();
  const { data: incidents, loading } = useAutoRefresh(() => workflowApi.get('/incidents'), 10000);
  const [sevFilter, setSevFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const filteredIncidents = incidents?.filter(i => {
    const matchSev = sevFilter === 'ALL' || i.severity === sevFilter;
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchSev && matchStatus;
  }) || [];

  const handleCopy = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRelativeTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Alarms & Incidents</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{filteredIncidents.length} incidents found in current view</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/alarms/create')}
            style={{ 
              backgroundColor: 'var(--brand-primary)', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              fontWeight: 'bold' 
            }}
          >
            Create Alarm
          </button>
          <select 
            value={sevFilter} 
            onChange={(e) => setSevFilter(e.target.value)}
            style={{ 
              padding: '6px 10px', 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '12px'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Warning</option>
            <option value="P3">P3 - Info</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ 
              padding: '6px 10px', 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '12px'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incident ID</th>
              <th style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Severity</th>
              <th style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Component</th>
              <th style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Signals</th>
              <th style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Started</th>
              <th style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MTTR</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((inc) => (
              <tr 
                key={inc.id} 
                onClick={() => navigate(`/incidents/${inc.id}`)}
                style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.1s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ fontSize: '11px', color: 'var(--brand-primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {inc.id.slice(0, 8)}
                    </code>
                    <button 
                      onClick={(e) => handleCopy(e, inc.id)}
                      style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                      title="Copy ID"
                    >
                      {copiedId === inc.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  </div>
                </td>
                <td style={{ padding: '10px 16px' }}><SeverityBadge severity={inc.severity} /></td>
                <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: '600' }}>{inc.component_id}</td>
                <td style={{ padding: '10px 16px' }}><StatusChip status={inc.status} /></td>
                <td style={{ padding: '10px 16px', fontSize: '12px' }}>{inc.signal_count || 0}</td>
                <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-secondary)' }} title={new Date(inc.created_at).toLocaleString()}>
                  {getRelativeTime(inc.created_at)}
                </td>
                <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--brand-primary)' }}>
                  {inc.status === 'CLOSED' ? `${inc.mttr_minutes}m` : '--'}
                </td>
              </tr>
            ))}
            {filteredIncidents.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No incidents match filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alarms;
