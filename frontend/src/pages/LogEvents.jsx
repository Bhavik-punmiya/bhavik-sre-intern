import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workflowApi } from '../api/client';
import { ChevronRight, ChevronDown, RotateCw, Search, X, Play, Clock } from 'lucide-react';

const LogEvents = () => {
  const { groupName, streamId } = useParams();
  const [events, setEvents] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [isLive, setIsLive] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await workflowApi.get(`/incidents/logs?component_id=${streamId}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [streamId]);

  useEffect(() => {
    let timer;
    if (isLive) {
      timer = setInterval(fetchEvents, 3000);
    }
    return () => clearInterval(timer);
  }, [isLive, streamId]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const groupPath = `/ims/service/${groupName.toLowerCase()}`;
  const streamName = `${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}/[$LATEST]${streamId.slice(0, 8)}`;

  return (
    <div className="animate-fade-in" style={{ padding: '0 4px', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <Link to="/logs" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>CloudWatch</Link>
        <ChevronRight size={14} />
        <Link to="/logs" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>Log management</Link>
        <ChevronRight size={14} />
        <Link to={`/logs/${groupName}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>{groupPath}</Link>
        <ChevronRight size={14} />
        <span>{streamName}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Log events</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '6px', border: '1px solid var(--border-color)', background: 'none', borderRadius: '4px' }}><RotateCw size={14} /></button>
          <button style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: 'none', borderRadius: '4px', fontSize: '13px' }}>Actions</button>
          <button 
            onClick={() => setIsLive(!isLive)}
            style={{ padding: '6px 12px', backgroundColor: isLive ? '#3b82f6' : 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', color: isLive ? 'white' : 'var(--text-primary)', fontWeight: 'bold' }}
          >
            {isLive ? 'Stop tailing' : 'Start tailing'}
          </button>
          <button style={{ padding: '6px 16px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>Create metric filter</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            placeholder="Filter events - press enter to search" 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', outline: 'none' }} 
          />
          {filter && <X size={14} onClick={() => setFilter('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />}
        </div>
        <button style={{ padding: '8px 12px', background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }}>Clear</button>
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
          {['1m', '30m', '1h', '12h', 'Custom'].map(t => (
            <button key={t} style={{ padding: '8px 12px', background: t === 'Custom' ? 'var(--bg-tertiary)' : 'none', border: 'none', borderRight: '1px solid var(--border-color)', fontSize: '12px', cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }}>
          <Clock size={14} /> UTC timezone
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          Display
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, overflowY: 'auto', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          <div style={{ width: '30px' }}></div>
          <div style={{ width: '250px' }}>Timestamp</div>
          <div style={{ flex: 1 }}>Message</div>
        </div>
        
        {events.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            There are no log events to load.
          </div>
        )}

        {events.map((event, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div 
              onClick={() => toggleExpand(i)}
              style={{ 
                padding: '4px 12px', 
                display: 'flex', 
                gap: '8px', 
                cursor: 'pointer',
                fontSize: '11px',
                color: 'var(--text-primary)',
                lineHeight: '1.4'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '20px', display: 'flex', alignItems: 'center' }}>
                {expanded[i] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              <div style={{ width: '250px', color: 'var(--text-muted)', flexShrink: 0 }}>
                {new Date(event.timestamp).toISOString().replace('T', ' ').slice(0, 23)}
              </div>
              <div style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {event.message}
              </div>
            </div>
            {expanded[i] && (
              <div style={{ 
                padding: '8px 40px', 
                backgroundColor: 'var(--bg-primary)', 
                fontSize: '11px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogEvents;
