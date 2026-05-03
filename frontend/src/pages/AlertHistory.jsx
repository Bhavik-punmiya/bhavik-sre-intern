import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertApi } from '../api/client';
import { SeverityBadge } from '../components/Badges';
import { Mail, Webhook, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const AlertHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await alertApi.get('/alerts/history');
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Notification History</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Log of all alert delivery attempts and their status.</p>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Timestamp</th>
              <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Component</th>
              <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Severity</th>
              <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Channel</th>
              <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Incident / Logs</th>
              <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status / Reason</th>
            </tr>
          </thead>
          <tbody>
            {history.map((alert, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(alert.sent_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                </td>
                <td style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 'bold' }}>
                  <Link 
                    to={alert.component_type ? `/logs/${alert.component_type}` : '/logs'} 
                    style={{ color: '#3b82f6', textDecoration: 'none' }}
                  >
                    {alert.component_type || 'SYSTEM'}
                  </Link>
                </td>
                <td style={{ padding: '8px 12px' }}><SeverityBadge severity={alert.severity} /></td>
                <td style={{ padding: '8px 12px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {alert.channel === 'email' ? <Mail size={12} /> : <Webhook size={12} />}
                    {alert.channel}
                  </div>
                </td>
                <td style={{ padding: '8px 12px', fontSize: '11px' }}>
                  <Link 
                    to={`/incidents/${alert.incident_id}`} 
                    style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    View Logs <ChevronRight size={12} />
                  </Link>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 'bold', color: alert.status === 'sent' ? '#10b981' : '#ef4444' }}>
                      {alert.status === 'sent' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {alert.status.toUpperCase()}
                    </div>
                    {alert.error && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={alert.error}>
                        {alert.error}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertHistory;
