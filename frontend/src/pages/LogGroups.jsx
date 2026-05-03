import React, { useState, useEffect } from 'react';
import { workflowApi } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCw, Filter, ChevronRight } from 'lucide-react';

const LogGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await workflowApi.get('/incidents/logs/groups');
        const formatted = res.data.map(g => ({
          name: `/ims/service/${g.type.toLowerCase()}`,
          type: g.type,
          count: g.count,
          lastSeen: g.lastSeen
        }));
        setGroups(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Log groups ({groups.length})</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '6px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
            <RotateCw size={16} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <Filter size={14} /> Filters
          </button>
          <button style={{ padding: '6px 12px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
            Create log group
          </button>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        By default, we only load up to 10,000 log groups.
      </p>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Filter log groups or try pattern search" 
          style={{ width: '100%', padding: '8px 12px 8px 40px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '10px 12px', width: '24px' }}><input type="checkbox" /></th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Log group</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Log class</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Retention</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Metric filters</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr 
                key={group.name}
                style={{ borderBottom: '1px solid var(--border-color)', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '10px 12px' }}><input type="checkbox" /></td>
                <td style={{ padding: '10px 12px' }}>
                  <button 
                    onClick={() => navigate(`/logs/${group.type}`)}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: '12px', textAlign: 'left', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {group.name}
                  </button>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Standard</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Never expire</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{group.count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogGroups;
