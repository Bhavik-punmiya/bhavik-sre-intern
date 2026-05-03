import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi, ingesterApi } from '../api/client';
import { 
  ChevronLeft, 
  Database, 
  Zap, 
  Globe, 
  Layers, 
  Network, 
  Server,
  StopCircle,
  Play,
  Activity,
  Terminal,
  Trash2,
  ShieldCheck,
  BarChart3,
  Send,
  Info
} from 'lucide-react';
import { SeverityBadge } from '../components/Badges';

const KNOWN_SERVICES = {
  rdbms: { name: 'Amazon RDS (PostgreSQL)', icon: Database, color: '#ef4444', desc: 'Relational database service for persistent state.' },
  cache: { id: 'cache', name: 'Amazon ElastiCache (Redis)', icon: Zap, color: '#f59e0b', desc: 'Distributed in-memory caching layer.' },
  api: { id: 'api', name: 'Amazon API Gateway', icon: Globe, color: '#3b82f6', desc: 'Managed API edge gateway for public traffic.' },
  queue: { id: 'queue', name: 'Amazon SQS / BullMQ', icon: Layers, color: '#8b5cf6', desc: 'Asynchronous message queue for job processing.' },
  mcp: { id: 'mcp', name: 'MCP Node Clusters', icon: Network, color: '#10b981', desc: 'Model Context Protocol processing nodes.' },
  nosql: { id: 'nosql', name: 'Amazon DynamoDB', icon: Server, color: '#06b6d4', desc: 'High-performance NoSQL document store.' }
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = KNOWN_SERVICES[serviceId] || {
    name: `${serviceId.toUpperCase()} Service`,
    icon: Server,
    color: '#94a3b8',
    desc: `Internal telemetry source for ${serviceId.toUpperCase()} infrastructure.`
  };
  
  const [status, setStatus] = useState({ running: false, signals_sent: 0, scenario: 'idle' });
  const [feed, setFeed] = useState([]);
  const [customForm, setCustomForm] = useState({ error_code: 'CONNECTION_TIMEOUT', count: 1 });
  const feedEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await mockApi.get('/status');
        setStatus(res.data);
        if (res.data.running && res.data.scenario.toLowerCase().includes(serviceId)) {
          const timestamp = new Date().toLocaleTimeString();
          setFeed(prev => [...prev, `[${timestamp}] ● ${res.data.scenario.toUpperCase()} — ${res.data.signals_sent} signals sent`].slice(-50));
        }
      } catch (err) { console.error(err); }
    }, 2000);
    return () => clearInterval(interval);
  }, [serviceId]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  const handleSimulate = async (type) => {
    try {
      await mockApi.post('/simulate/burst', { 
        scenario: `${serviceId}_${type}`, 
        component_type: serviceId.toUpperCase(),
        count: type === 'outage' ? 200 : 50
      });
      setFeed(prev => [...prev, `[${new Date().toLocaleTimeString()}] ▶ STARTED: ${type.toUpperCase()}`]);
    } catch (err) { console.error(err); }
  };

  const handleStop = async () => {
    try {
      await mockApi.post('/simulate/stop');
      setFeed(prev => [...prev, `[${new Date().toLocaleTimeString()}] ■ STOPPED`]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back Link */}
      <button 
        onClick={() => navigate('/services')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: 'bold' }}
      >
        <ChevronLeft size={16} /> Back to Data sources
      </button>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '12px', 
            backgroundColor: `${service.color}15`, 
            color: service.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <service.icon size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{service.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{service.desc}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '8px 16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>Actions</button>
          <button style={{ padding: '8px 16px', backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>Edit configuration</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Metrics & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Status Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Ingestion Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                <ShieldCheck size={20} /> Healthy
              </div>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Active Pipelines</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>2</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Latency</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>14ms</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Simulation Controls</h2>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => handleSimulate('burst')}
                disabled={status.running}
                style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Activity size={16} color="#f59e0b" /> Run Load Burst
              </button>
              <button 
                onClick={() => handleSimulate('outage')}
                disabled={status.running}
                style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Zap size={16} color="#ef4444" /> Trigger Outage
              </button>
              {status.running && (
                <button 
                  onClick={handleStop}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <StopCircle size={16} /> Stop Simulation
                </button>
              )}
            </div>
          </div>

          {/* Terminal */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', height: '300px' }}>
            <div style={{ padding: '10px 20px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} color="#3b82f6" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase' }}>{serviceId} execution logs</span>
              </div>
              <button onClick={() => setFeed([])} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={12} /></button>
            </div>
            <div style={{ flex: 1, padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8', overflowY: 'auto' }}>
              {feed.map((line, i) => <div key={i} style={{ marginBottom: '4px' }}>{line}</div>)}
              <div ref={feedEndRef} />
              {feed.length === 0 && <div style={{ color: '#475569' }}>No telemetry data received...</div>}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Payload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>Diagnostic Tools</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Error Code</label>
              <input 
                value={customForm.error_code}
                onChange={e => setCustomForm({...customForm, error_code: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Throughput (Signals)</label>
              <input 
                type="number"
                value={customForm.count}
                onChange={e => setCustomForm({...customForm, count: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            <button 
              onClick={() => handleSimulate('custom')}
              style={{ width: '100%', padding: '10px', backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Send size={14} /> Send Diagnostics
            </button>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#3b82f610', borderRadius: '8px', border: '1px solid #3b82f633' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '8px' }}>
              <Info size={16} />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Service Configuration</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              This component is managed via the **Alert Strategy Factory**. Any simulations triggered here will propagate through the Ingester to the Workflow Engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
