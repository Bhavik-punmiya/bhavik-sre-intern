import React, { useState, useEffect } from 'react';
import { workflowApi } from '../api/client';
import { SeverityBadge } from '../components/Badges';
import { Database, ChevronDown, ChevronUp, Clock, AlertTriangle } from 'lucide-react';

const RCAVault = () => {
  const [incidents, setIncidents] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchClosed = async () => {
      try {
        const res = await workflowApi.get('/incidents');
        setIncidents(res.data.filter(i => i.status === 'CLOSED'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchClosed();
  }, []);

  const toggleExpand = async (id) => {
    if (!expanded[id]) {
      try {
        const res = await workflowApi.get(`/incidents/${id}`);
        setExpanded(prev => ({ ...prev, [id]: res.data.rca }));
      } catch (err) {
        console.error(err);
      }
    } else {
      setExpanded(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>RCA Vault</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Historical record of closed incidents and their root cause analyses.</p>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '12px 20px', fontSize: '12px' }}>Component</th>
              <th style={{ padding: '12px 20px', fontSize: '12px' }}>Severity</th>
              <th style={{ padding: '12px 20px', fontSize: '12px' }}>Resolution (MTTR)</th>
              <th style={{ padding: '12px 20px', fontSize: '12px' }}>Closed At</th>
              <th style={{ padding: '12px 20px', fontSize: '12px' }}></th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <React.Fragment key={inc.id}>
                <tr 
                  onClick={() => toggleExpand(inc.id)}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 'bold' }}>{inc.component_id}</td>
                  <td style={{ padding: '16px 20px' }}><SeverityBadge severity={inc.severity} /></td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>{inc.mttr_minutes}m</td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(inc.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    {expanded[inc.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                </tr>
                {expanded[inc.id] && (
                  <tr>
                    <td colSpan="5" style={{ padding: '0', backgroundColor: 'var(--bg-tertiary)' }}>
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Root Cause Category</div>
                            <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: '600' }}>{expanded[inc.id].root_cause_category}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prevention Steps</div>
                            <div style={{ marginTop: '4px', fontSize: '14px' }}>{expanded[inc.id].prevention_steps}</div>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fix Applied</div>
                          <div style={{ marginTop: '4px', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{expanded[inc.id].fix_applied}"</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RCAVault;
