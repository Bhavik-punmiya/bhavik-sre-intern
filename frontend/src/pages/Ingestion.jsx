import React, { useState, useEffect } from 'react';
import { workflowApi, alertApi } from '../api/client';
import { Search, RotateCw, Filter, ToggleLeft, ToggleRight, MoreHorizontal } from 'lucide-react';

const Ingestion = () => {
  const [services, setServices] = useState([]);
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, confRes] = await Promise.all([
          workflowApi.get('/incidents/logs/groups'),
          alertApi.get('/alerts/config')
        ]);

        const configMap = confRes.data.reduce((acc, c) => {
          acc[c.component_type] = c.enabled;
          return acc;
        }, {});

        setServices(groupRes.data);
        setConfigs(configMap);
      } catch (err) {
        console.error('Failed to fetch ingestion data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleService = async (type) => {
    try {
      const current = configs[type] !== false;
      await alertApi.patch(`/alerts/config/${type}`, { enabled: !current });
      setConfigs({ ...configs, [type]: !current });
    } catch (err) {
      alert('Failed to toggle ingestion');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 4px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Ingestion <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>Info</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          View and understand your telemetry collection coverage across IMS data sources.
        </p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '24px', marginBottom: '24px' }}>
        <button style={{ padding: '8px 4px', fontSize: '13px', borderBottom: '2px solid #3b82f6', color: '#3b82f6', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', fontWeight: 'bold' }}>Data sources</button>
        <button style={{ padding: '8px 4px', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none' }}>Enablement rules</button>
        <button style={{ padding: '8px 4px', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none' }}>Pipelines</button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ transform: 'rotate(90deg)' }}><MoreHorizontal size={14} /></div> Getting started
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <select style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontSize: '13px' }}>
            <option>All</option>
          </select>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Find a data source" style={{ width: '100%', padding: '8px 12px 8px 32px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px' }} />
          </div>
          <button style={{ padding: '8px 16px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>Turn on</button>
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
            <button style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', fontSize: '12px' }}>List view</button>
            <button style={{ padding: '8px 12px', background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-secondary)' }}>Card view</button>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '10px 12px', width: '24px' }}><input type="checkbox" /></th>
                <th style={{ padding: '10px 12px', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '10px 12px', fontWeight: '600' }}>Telemetry type</th>
                <th style={{ padding: '10px 12px', fontWeight: '600' }}>Pipelines</th>
                <th style={{ padding: '10px 12px', fontWeight: '600' }}>Enablement rules</th>
                <th style={{ padding: '10px 12px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {services.map(svc => (
                <tr key={svc.type} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px' }}><input type="checkbox" /></td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#f97316' }}></div>
                      <span style={{ fontWeight: '600', color: '#3b82f6' }}>{svc.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>Logs</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>No enablement rules</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: configs[svc.type] !== false ? '#10b981' : '#ef4444' }}>
                        {configs[svc.type] !== false ? 'ACTIVE' : 'DISABLED'}
                      </span>
                      <button 
                        onClick={() => toggleService(svc.type)} 
                        style={{ background: 'none', border: 'none', padding: 0, color: configs[svc.type] !== false ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                      >
                        {configs[svc.type] !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ingestion;
