import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowApi } from '../api/client';
import { 
  Search, 
  Filter, 
  Info, 
  Database, 
  Zap, 
  Globe, 
  Layers, 
  Network, 
  Server,
  Settings,
  ChevronDown,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

const KNOWN_SERVICES = {
  RDBMS: { name: 'Amazon RDS (PostgreSQL)', icon: Database, color: '#ef4444' },
  CACHE: { name: 'Amazon ElastiCache (Redis)', icon: Zap, color: '#f59e0b' },
  API:   { name: 'Amazon API Gateway', icon: Globe, color: '#3b82f6' },
  QUEUE: { name: 'Amazon SQS / BullMQ', icon: Layers, color: '#8b5cf6' },
  MCP:   { name: 'MCP Node Clusters', icon: Network, color: '#10b981' },
  NOSQL: { name: 'Amazon DynamoDB', icon: Server, color: '#06b6d4' }
};

const Services = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await workflowApi.get('/incidents/logs/groups');
        const formatted = res.data.map(g => {
          const type = g.type.toUpperCase();
          const info = KNOWN_SERVICES[type] || { name: `${type} Service`, icon: Server, color: '#94a3b8' };
          return {
            id: g.type.toLowerCase(),
            name: info.name,
            fullName: `/ims/service/${g.type.toLowerCase()}`,
            icon: info.icon,
            color: info.color,
            type: 'Metrics, Logs',
            pipelines: 1,
            status: 'Active',
            resources: g.count,
            coverage: '100%'
          };
        });
        setServices(formatted);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Ingestion <Info size={14} color="var(--text-muted)" />
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          View and understand your telemetry collection coverage across IMS data sources.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        {['Data sources', 'Enablement rules', 'Pipelines'].map((tab, i) => (
          <div key={tab} style={{ 
            padding: '12px 4px', 
            fontSize: '14px', 
            fontWeight: i === 0 ? 'bold' : 'normal',
            color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: i === 0 ? '2px solid var(--brand-primary)' : 'none',
            cursor: 'pointer'
          }}>{tab}</div>
        ))}
      </div>

      {/* Info Card */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px', 
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px'
      }}>
        <ChevronDown size={18} />
        <span style={{ fontWeight: 'bold' }}>Getting started</span>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 12px', 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            All <ChevronDown size={14} />
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              placeholder="Find a data source"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 40px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                width: '300px'
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            Turn on <ChevronDown size={14} />
          </button>
          <div style={{ display: 'flex', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--brand-primary)', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>List view</div>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '12px' }}>Card view</div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '8px', marginTop: '6px' }}>Quick filters</span>
        {['IMS managed', 'Third party', 'Logs', 'Detailed metrics', 'Traces'].map((f, i) => (
          <div key={f} style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            border: '1px solid var(--border-color)', 
            fontSize: '12px',
            backgroundColor: i === 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: i === 0 ? 'var(--brand-primary)' : 'var(--text-secondary)'
          }}>{f}</div>
        ))}
      </div>

      {/* Data Sources Table */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px', 
        overflow: 'hidden'
      }}>
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Data sources ({services.length})</h3>
          <button style={{ padding: '6px 12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }}>
            Configure <ChevronDown size={12} />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '12px 24px', width: '40px' }}><input type="checkbox" /></th>
              <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Telemetry type</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pipelines</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Enablement rules</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total resources</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Coverage percentage</th>
            </tr>
          </thead>
          <tbody>
            {services.map(svc => (
              <tr 
                key={svc.id}
                onClick={() => navigate(`/services/${svc.id}`)}
                style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '16px 24px' }} onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: svc.color }}><svc.icon size={18} /></div>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--brand-primary)' }}>{svc.fullName}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px' }}>{svc.type}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px' }}>{svc.pipelines}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>No enablement rules</td>
                <td style={{ padding: '16px 24px', fontSize: '13px' }}>{svc.resources}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px' }}>{svc.coverage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Services;
