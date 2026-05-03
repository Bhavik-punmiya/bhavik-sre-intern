import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workflowApi } from '../api/client';
import { ChevronRight, RotateCw, Search, Plus, Filter } from 'lucide-react';

const LogStreams = () => {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const type = groupName.split('/').pop().toUpperCase();
        const res = await workflowApi.get(`/incidents/logs/streams/${type}`);
        setStreams(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, [groupName]);

  const groupPath = `/ims/service/${groupName.toLowerCase()}`;

  return (
    <div className="animate-fade-in" style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <Link to="/logs" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>Log management</Link>
        <ChevronRight size={14} />
        <span>{groupPath}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{groupPath}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px' }}>Actions</button>
          <button style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px' }}>View in Logs Insights</button>
          <button style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px' }}>Start tailing</button>
          <button style={{ padding: '6px 16px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>Search log group</button>
        </div>
      </div>

      {/* Log Group Details Card */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '16px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', fontSize: '12px' }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Log group details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Log class: <span style={{ color: 'var(--text-primary)' }}>Standard</span></div>
            <div style={{ color: 'var(--text-muted)' }}>ARN: <span style={{ color: 'var(--text-primary)' }}>arn:ims:logs:region:12345:log-group:{groupPath}</span></div>
            <div style={{ color: 'var(--text-muted)' }}>Retention: <span style={{ color: 'var(--text-primary)' }}>Never expire</span></div>
          </div>
        </div>
        <div style={{ paddingTop: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Subscription filters: <span style={{ color: 'var(--text-primary)' }}>0</span></div>
            <div style={{ color: 'var(--text-muted)' }}>KMS key ID: <span style={{ color: 'var(--text-primary)' }}>-</span></div>
          </div>
        </div>
        <div style={{ paddingTop: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Metric filters: <span style={{ color: 'var(--text-primary)' }}>0</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '20px', marginBottom: '20px' }}>
        <button style={{ padding: '8px 4px', fontSize: '13px', borderBottom: '2px solid #3b82f6', color: '#3b82f6', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}>Log streams</button>
        <button style={{ padding: '8px 4px', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Tags</button>
        <button style={{ padding: '8px 4px', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Data protection</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>Log streams ({streams.length})</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '6px', border: '1px solid var(--border-color)', background: 'none', borderRadius: '4px' }}><RotateCw size={14} /></button>
          <button style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: 'none', borderRadius: '4px', fontSize: '12px' }}>Delete</button>
          <button style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: 'none', borderRadius: '4px', fontSize: '12px' }}>Create log stream</button>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Search all log streams" style={{ padding: '6px 8px 6px 28px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '10px 12px', width: '24px' }}><input type="checkbox" /></th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Log stream</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Last event time</th>
            </tr>
          </thead>
          <tbody>
            {streams.map(stream => (
              <tr 
                key={stream.id} 
                style={{ borderBottom: '1px solid var(--border-color)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '10px 12px' }}><input type="checkbox" /></td>
                <td style={{ padding: '10px 12px' }}>
                  <button 
                    onClick={() => navigate(`/logs/${groupName}/${stream.id}`)}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: '12px' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {new Date(stream.lastEvent).toISOString().slice(0, 10).replace(/-/g, '/')}/[$LATEST]{stream.id.slice(0, 8)}
                  </button>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  {new Date(stream.lastEvent).toISOString().replace('T', ' ').slice(0, 19)} (UTC)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogStreams;
