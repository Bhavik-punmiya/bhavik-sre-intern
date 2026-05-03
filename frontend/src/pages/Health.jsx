import React from 'react';
import { ingesterApi, workflowApi, alertApi, mockApi } from '../api/client';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { Activity, ShieldCheck, ShieldAlert, Cpu, Database, Network } from 'lucide-react';

const SystemComponent = ({ name, client, icon: Icon }) => {
  const { data, error, loading } = useAutoRefresh(() => client.get('/health'), 30000);
  const isHealthy = !error && !loading;

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)'
          }}>
            <Icon size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{name}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Microservice Node</div>
          </div>
        </div>
        <div style={{
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: isHealthy ? '#dcfce7' : '#fee2e2',
          color: isHealthy ? '#166534' : '#991b1b',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {isHealthy ? 'Operational' : 'Critical'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>UPTIME</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{data?.uptime ? `${Math.floor(data.uptime / 3600)}h ${Math.floor((data.uptime % 3600) / 60)}m` : '--'}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>THROUGHPUT</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{data?.queueDepth !== undefined ? `${data.queueDepth} jobs` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

const Health = () => {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>IMS System Health</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Global operational status of the Incident Management System infrastructure.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        <SystemComponent name="Ingester Service" client={ingesterApi} icon={Activity} />
        <SystemComponent name="Workflow Engine" client={workflowApi} icon={Cpu} />
        <SystemComponent name="Alert Service" client={alertApi} icon={Network} />
        <SystemComponent name="Mock Traffic Gen" client={mockApi} icon={Database} />
      </div>
    </div>
  );
};

export default Health;
