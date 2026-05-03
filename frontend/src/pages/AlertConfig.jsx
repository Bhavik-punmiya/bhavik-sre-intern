import React, { useState, useEffect } from 'react';
import { alertApi } from '../api/client';
import { 
  Settings, 
  Save, 
  X, 
  Edit2, 
  CheckCircle, 
  AlertTriangle, 
  Bell, 
  Shield, 
  Mail, 
  Globe,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const AlertConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await alertApi.get('/alerts/config');
      setConfigs(res.data);
    } catch (err) {
      console.error('Failed to fetch alert configs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (config) => {
    setEditing(config.component_type);
    setEditForm({ ...config });
  };

  const handleSave = async () => {
    try {
      await alertApi.put(`/alerts/config/${editing}`, editForm);
      showToast('Configuration updated successfully', 'success');
      setEditing(null);
      fetchConfigs();
    } catch (err) {
      showToast('Failed to update configuration', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={24} color="var(--brand-primary)" /> Alert Configuration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Define routing strategies and delivery endpoints for infrastructure.
        </p>
      </div>

      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Routing Strategy</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channel (Email)</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Webhook</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map(config => (
              <tr key={config.component_type} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.1s' }}>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '6px', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--brand-primary)'
                    }}>
                      <Shield size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{config.component_type}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} color="var(--text-muted)" />
                    {editing === config.component_type ? (
                      <input 
                        value={editForm.email} 
                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px', width: '100%' }}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{config.email}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={12} color="var(--text-muted)" />
                    {editing === config.component_type ? (
                      <input 
                        value={editForm.webhook_url} 
                        onChange={e => setEditForm({...editForm, webhook_url: e.target.value})}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px', width: '100%' }}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{config.webhook_url || '--'}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  {editing === config.component_type ? (
                    <div 
                      onClick={() => setEditForm({...editForm, enabled: !editForm.enabled})}
                      style={{ cursor: 'pointer', color: editForm.enabled ? '#10b981' : 'var(--text-muted)' }}
                    >
                      {editForm.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: config.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: config.enabled ? '#10b981' : 'var(--text-muted)',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {config.enabled ? 'ACTIVE' : 'DISABLED'}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                  {editing === config.component_type ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={handleSave} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}><Save size={16} /></button>
                      <button onClick={() => setEditing(null)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(config)} style={{ color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading configuration strategies...
          </div>
        )}
        
        {!loading && configs.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>No Routing Configurations Found</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Ensure the alert-service has been correctly initialized.</p>
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '16px 24px',
          borderRadius: '12px',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          zIndex: 10000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AlertConfig;
