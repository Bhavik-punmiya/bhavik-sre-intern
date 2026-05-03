import React from 'react';
import { 
  Layers, 
  Activity,
  Terminal,
  Cpu,
  ShieldCheck,
  Database,
  ChevronRight,
  Lock
} from 'lucide-react';

const ArchitectureDiagram = () => (
  <div style={{ 
    backgroundColor: '#0f172a', 
    borderRadius: '12px', 
    padding: '24px', 
    marginBottom: '40px', 
    border: '1px solid #1e293b',
    maxWidth: '850px'
  }}>
    <svg viewBox="0 0 800 600" width="100%" height="auto">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="1" dy="1" result="offsetblur" />
          <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>

      {/* Signal Sources */}
      <rect x="20" y="20" width="760" height="80" rx="8" fill="none" stroke="#ff4444" strokeDasharray="5,5" />
      <text x="32" y="36" fill="#ff4444" fontSize="11" fontWeight="bold">SIGNAL SOURCES</text>
      <g filter="url(#shadow)">
        <rect x="40" y="45" width="160" height="40" rx="4" fill="#1a1a2e" stroke="#ff6b6b" />
        <text x="120" y="70" fill="white" fontSize="11" textAnchor="middle">Mock Generator</text>
        <rect x="220" y="45" width="160" height="40" rx="4" fill="#1a1a2e" stroke="#ff6b6b" />
        <text x="300" y="70" fill="white" fontSize="11" textAnchor="middle">RDBMS Service</text>
        <rect x="400" y="45" width="160" height="40" rx="4" fill="#1a1a2e" stroke="#ff6b6b" />
        <text x="480" y="70" fill="white" fontSize="11" textAnchor="middle">Cache Service</text>
        <rect x="580" y="45" width="160" height="40" rx="4" fill="#1a1a2e" stroke="#ff6b6b" />
        <text x="660" y="70" fill="white" fontSize="11" textAnchor="middle">API Gateway</text>
      </g>

      <line x1="400" y1="100" x2="400" y2="130" stroke="#64748b" markerEnd="url(#arrowhead)" />

      {/* Ingester */}
      <rect x="20" y="130" width="760" height="80" rx="8" fill="none" stroke="#4488ff" strokeDasharray="5,5" />
      <text x="32" y="146" fill="#4488ff" fontSize="11" fontWeight="bold">SECURITY LAYER</text>
      <g filter="url(#shadow)">
        <rect x="40" y="155" width="720" height="40" rx="4" fill="#1a1a2e" stroke="#5599ff" />
        <text x="400" y="180" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Ingester Service (:8001)</text>
      </g>

      <line x1="400" y1="210" x2="400" y2="230" stroke="#64748b" markerEnd="url(#arrowhead)" />

      {/* Queue */}
      <rect x="250" y="230" width="300" height="40" rx="20" fill="#1e1b4b" stroke="#8855ff" />
      <text x="400" y="255" fill="white" fontSize="11" textAnchor="middle">BullMQ (Redis)</text>

      <line x1="400" y1="270" x2="400" y2="300" stroke="#64748b" markerEnd="url(#arrowhead)" />

      {/* Workflow */}
      <rect x="20" y="300" width="760" height="100" rx="8" fill="none" stroke="#22cc88" strokeDasharray="5,5" />
      <text x="32" y="316" fill="#22cc88" fontSize="11" fontWeight="bold">WORKFLOW ENGINE — PORT 8002</text>
      <g filter="url(#shadow)">
        <rect x="40" y="330" width="160" height="50" rx="4" fill="#16213e" stroke="#33ddaa" />
        <text x="120" y="360" fill="white" fontSize="11" textAnchor="middle">Debounce</text>
        <rect x="220" y="330" width="160" height="50" rx="4" fill="#16213e" stroke="#33ddaa" />
        <text x="300" y="360" fill="white" fontSize="11" textAnchor="middle">Alert Strategy</text>
        <rect x="400" y="330" width="160" height="50" rx="4" fill="#16213e" stroke="#33ddaa" />
        <text x="480" y="360" fill="white" fontSize="11" textAnchor="middle">State Machine</text>
        <rect x="580" y="330" width="160" height="50" rx="4" fill="#16213e" stroke="#33ddaa" />
        <text x="660" y="360" fill="white" fontSize="11" textAnchor="middle">MTTR Calc</text>
      </g>

      <line x1="400" y1="400" x2="400" y2="440" stroke="#64748b" markerEnd="url(#arrowhead)" />

      {/* Databases */}
      <g filter="url(#shadow)">
        <rect x="50" y="450" width="120" height="60" rx="4" fill="#1a1a2e" stroke="#ffaa22" />
        <text x="110" y="485" fill="white" fontSize="11" textAnchor="middle">MongoDB</text>
        <rect x="190" y="450" width="120" height="60" rx="4" fill="#1a1a2e" stroke="#ffaa22" />
        <text x="250" y="485" fill="white" fontSize="11" textAnchor="middle">PostgreSQL</text>
        <rect x="330" y="450" width="120" height="60" rx="4" fill="#1a1a2e" stroke="#ffaa22" />
        <text x="390" y="485" fill="white" fontSize="11" textAnchor="middle">TimescaleDB</text>
        <rect x="470" y="450" width="120" height="60" rx="4" fill="#1a1a2e" stroke="#ffaa22" />
        <text x="530" y="485" fill="white" fontSize="11" textAnchor="middle">Redis Cache</text>
        <rect x="610" y="450" width="120" height="60" rx="4" fill="#1a1a2e" stroke="#ff4444" />
        <text x="670" y="485" fill="white" fontSize="11" textAnchor="middle">Alert Svc</text>
      </g>

      <line x1="400" y1="510" x2="400" y2="540" stroke="#64748b" markerEnd="url(#arrowhead)" />
      <rect x="250" y="545" width="300" height="35" rx="4" fill="#1e3a8a" stroke="#3b82f6" />
      <text x="400" y="567" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">React UI Console</text>
    </svg>
  </div>
);

const NavLink = ({ href, label }) => (
  <a href={href} style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    textDecoration: 'none', 
    color: 'var(--text-secondary)', 
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s'
  }}
  onMouseEnter={e => { e.target.style.backgroundColor = 'var(--bg-tertiary)'; e.target.style.color = 'var(--text-primary)'; }}
  onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}
  >
    <ChevronRight size={14} />
    {label}
  </a>
);

const ApiEndpoint = ({ method, url, auth, desc }) => {
  const methodColor = {
    GET: '#3b82f6',
    POST: '#10b981',
    PATCH: '#f59e0b',
    PUT: '#8b5cf6',
    DELETE: '#ef4444'
  }[method];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '8px 12px', 
      borderBottom: '1px solid var(--border-color)', 
      fontSize: '13px', 
      fontFamily: 'monospace',
      gap: '16px'
    }}>
      <span style={{ 
        color: 'white', 
        backgroundColor: methodColor, 
        padding: '2px 6px', 
        borderRadius: '4px', 
        fontSize: '10px', 
        fontWeight: 'bold',
        minWidth: '45px',
        textAlign: 'center'
      }}>{method}</span>
      <span style={{ flex: 1, color: 'var(--text-primary)' }}>{url}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>auth: {auth}</span>
      <span style={{ flex: 1.5, color: 'var(--text-secondary)', textAlign: 'right' }}>{desc}</span>
    </div>
  );
};

const Docs = () => {
  return (
    <div style={{ display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <aside style={{ width: '240px', position: 'sticky', top: '40px', height: 'fit-content' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documentation</h4>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink href="#arch" label="System Architecture" />
          <NavLink href="#patterns" label="Design Patterns" />
          <NavLink href="#backpressure" label="Backpressure" />
          <NavLink href="#storage" label="Polyglot Storage" />
          <NavLink href="#security" label="Security Layer" />
          <NavLink href="#api" label="API Reference" />
        </nav>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }} className="animate-fade-in">
        <header style={{ marginBottom: '60px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>System Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.5' }}>
            Comprehensive documentation for the Incident Management System (IMS). 
            Designed for high-durability telemetry ingestion and real-time response orchestration.
          </p>
        </header>

        <section id="arch" style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={24} color="var(--brand-primary)" /> Technical Architecture
          </h2>
          <ArchitectureDiagram />
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
            The IMS architecture is built on a **Durability-First** principle. Every signal is acknowledged by the Ingester within 5ms and immediately buffered into a Redis-backed queue. This prevents data loss during upstream processing spikes or downstream database maintenance.
          </p>
        </section>

        <section id="patterns" style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={24} color="var(--brand-primary)" /> Design Patterns
          </h2>
          
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>1. State Pattern: Incident Lifecycle</h3>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
            To avoid complex conditional logic, the incident lifecycle is managed via class-based states. Each state enforces its own business rules.
          </p>
          <pre style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
{`OpenState        → can only call investigate()
InvestigatingState → can only call resolve()
ResolvedState    → can only call close() — requires RCA
ClosedState      → terminal state`}
          </pre>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>2. Strategy Pattern: Alert Routing</h3>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
            The <code>AlertStrategyFactory</code> selects the routing logic at runtime based on the service type.
          </p>
          <pre style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '24px', border: '1px solid var(--border-color)', lineHeight: '1.5' }}>
{`RDBMS  → RDBMSAlertStrategy  → P0 → emails zachariah.ledner8@ethereal.email immediately
API    → APIAlertStrategy    → P1 → emails zachariah.ledner8@ethereal.email
QUEUE  → QueueAlertStrategy  → P1 → emails devops@ims.local
CACHE  → CacheAlertStrategy  → P2 → emails zachariah.ledner8@ethereal.email
MCP    → MCPAlertStrategy    → P2 → emails zachariah.ledner8@ethereal.email
NOSQL  → NoSQLAlertStrategy  → P1 → emails zachariah.ledner8@ethereal.email

AlertStrategyFactory.create(componentType, config)
→ zero if/else chains → Open/Closed Principle
→ configurable via UI at /settings/alerts without restart`}
          </pre>
        </section>

        <section id="backpressure" style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} color="var(--brand-primary)" /> Backpressure Strategy
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            The system monitors the BullMQ depth in real-time to prevent memory exhaustion during 10,000+ signals/sec bursts.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#10b98122', color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>0-5k</div>
              <span style={{ fontSize: '14px' }}><strong>Normal</strong>: Full ingestion, instant 202 response.</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f59e0b22', color: '#f59e0b', fontSize: '12px', fontWeight: 'bold' }}>5-8k</div>
              <span style={{ fontSize: '14px' }}><strong>Warning</strong>: Ops team notified, signals accepted.</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#ef444422', color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>8k+</div>
              <span style={{ fontSize: '14px' }}><strong>Degraded</strong>: 429 Too Many Requests, low-priority shedding.</span>
            </div>
          </div>
        </section>

        <section id="storage" style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={24} color="var(--brand-primary)" /> Polyglot Storage
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', lineHeight: '1.6' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12px' }}>
                <th style={{ textAlign: 'left', padding: '12px 0' }}>STORE</th>
                <th style={{ textAlign: 'left', padding: '12px 0' }}>ROLE</th>
                <th style={{ textAlign: 'left', padding: '12px 0' }}>RATIONALE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px 0', fontWeight: 'bold' }}>PostgreSQL</td>
                <td style={{ padding: '16px 0' }}>Incidents & RCA</td>
                <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>Relational integrity for state transitions.</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px 0', fontWeight: 'bold' }}>MongoDB</td>
                <td style={{ padding: '16px 0' }}>Signal Audit</td>
                <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>Scalable schemaless storage for high-volume logs.</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px 0', fontWeight: 'bold' }}>TimescaleDB</td>
                <td style={{ padding: '16px 0' }}>Metrics</td>
                <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>Specialized hypertables for time-series aggregation.</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px 0', fontWeight: 'bold' }}>Redis</td>
                <td style={{ padding: '16px 0' }}>Queue + Cache</td>
                <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>In-memory microsecond reads, TTL support, BullMQ queue.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="security" style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={24} color="var(--brand-primary)" /> Security Layer
          </h2>
          <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <li style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Helmet.js Compliance</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>11 Security headers applied globally.</div>
            </li>
            <li style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Hook-Based Auth</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>X-API-Key verified pre-parsing to prevent enumeration.</div>
            </li>
          </ul>
        </section>

        <section id="api" style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Terminal size={24} color="var(--brand-primary)" /> API Reference
          </h2>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>INGESTER SERVICE — PORT 8001</div>
            <ApiEndpoint method="POST" url="/api/v1/signals" auth="required" desc="Ingest a signal" />
            <ApiEndpoint method="GET" url="/health" auth="none" desc="Health + live metrics" />
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>WORKFLOW ENGINE — PORT 8002</div>
            <ApiEndpoint method="GET" url="/incidents" auth="required" desc="List all incidents (Redis cache)" />
            <ApiEndpoint method="GET" url="/incidents/:id" auth="required" desc="Full incident detail" />
            <ApiEndpoint method="GET" url="/incidents/:id/signals" auth="required" desc="Raw signals from MongoDB" />
            <ApiEndpoint method="PATCH" url="/incidents/:id/investigate" auth="required" desc="Transition OPEN → INVESTIGATING" />
            <ApiEndpoint method="PATCH" url="/incidents/:id/resolve" auth="required" desc="Transition → RESOLVED" />
            <ApiEndpoint method="POST" url="/incidents/:id/rca" auth="required" desc="Submit RCA record" />
            <ApiEndpoint method="PATCH" url="/incidents/:id/close" auth="required" desc="Transition → CLOSED (requires RCA)" />
            <ApiEndpoint method="GET" url="/metrics/throughput" auth="required" desc="TimescaleDB bucketed metrics" />
            <ApiEndpoint method="GET" url="/health" auth="none" desc="Workflow engine health" />
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>ALERT SERVICE — PORT 8004</div>
            <ApiEndpoint method="POST" url="/alerts/send" auth="required" desc="Internal — fire alert" />
            <ApiEndpoint method="GET" url="/alerts/history" auth="required" desc="Last 50 alerts" />
            <ApiEndpoint method="GET" url="/alerts/config" auth="required" desc="Routing config per component" />
            <ApiEndpoint method="PUT" url="/alerts/config/:component_type" auth="required" desc="Update routing config" />
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>MOCK GENERATOR — PORT 8003</div>
            <ApiEndpoint method="POST" url="/simulate/burst" auth="none" desc="Fire 200 signals in 2 seconds" />
            <ApiEndpoint method="POST" url="/simulate/outage" auth="none" desc="60s RDBMS + MCP outage chain" />
            <ApiEndpoint method="POST" url="/simulate/stop" auth="none" desc="Stop active simulation" />
            <ApiEndpoint method="GET" url="/status" auth="none" desc="Current simulation status" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Docs;
