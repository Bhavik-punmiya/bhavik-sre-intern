import React, { useState, useEffect } from 'react';
import { workflowApi } from '../api/client';
import { ShieldCheck, ShieldAlert, Clock, Activity, Database, Server } from 'lucide-react';

const Infrastructure = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await workflowApi.get('/incidents');
        const grouped = res.data.reduce((acc, inc) => {
          if (!acc[inc.component_id]) {
            acc[inc.component_id] = {
              id: inc.component_id,
              type: inc.component_type,
              status: 'Healthy',
              activeIncidents: 0,
              lastSignal: inc.created_at
            };
          }
          if (inc.status !== 'CLOSED') {
            acc[inc.component_id].status = 'Degraded';
            acc[inc.component_id].activeIncidents++;
          }
          return acc;
        }, {});
        setResources(Object.values(grouped));
      } catch (err) {
        console.error(err);
      }
    };
    fetchHealth();
  }, []);

  const getIcon = (type) => {
    if (type === 'RDBMS' || type === 'NOSQL') return <Database size={20} />;
    return <Server size={20} />;
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Infrastructure Resource Health</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Real-time health status of monitored cloud resources and service components.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {resources.map(res => (
          <div key={res.id} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '4px',
              height: '100%',
              backgroundColor: res.status === 'Healthy' ? '#10b981' : '#ef4444'
            }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                padding: '8px', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: '8px',
                color: 'var(--text-secondary)'
              }}>
                {getIcon(res.type)}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{res.id}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{res.type}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              {res.status === 'Healthy' ? (
                <ShieldCheck size={16} style={{ color: '#10b981' }} />
              ) : (
                <ShieldAlert size={16} style={{ color: '#ef4444' }} />
              )}
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: res.status === 'Healthy' ? '#10b981' : '#ef4444' 
              }}>
                {res.status}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Incidents</span>
                <span style={{ fontWeight: 'bold' }}>{res.activeIncidents}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Pulse</span>
                <span style={{ fontWeight: 'bold' }}>{new Date(res.lastSignal).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Infrastructure;
