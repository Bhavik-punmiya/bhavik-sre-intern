import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowApi } from '../api/client';
import { SeverityBadge, StatusChip } from '../components/Badges';
import { LoadingSkeleton } from '../components/StatCard';
import { ChevronLeft, FileText, Activity, Save, CheckCircle } from 'lucide-react';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [signals, setSignals] = useState([]);
  const [rca, setRca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('signals');
  const [transitioning, setTransitioning] = useState(false);

  // RCA Form State
  const [rcaForm, setRcaForm] = useState({
    root_cause_category: 'SOFTWARE_BUG',
    fix_applied: '',
    prevention_steps: '',
    incident_start: '',
    incident_end: ''
  });

  const fetchData = async () => {
    try {
      const [incRes, sigRes] = await Promise.all([
        workflowApi.get(`/incidents/${id}`),
        workflowApi.get(`/incidents/${id}/signals?limit=50`)
      ]);
      setIncident(incRes.data.incident);
      setRca(incRes.data.rca);
      setSignals(sigRes.data.signals);
      
      // Pre-fill RCA form if incident just resolved
      if (!incRes.data.rca) {
        setRcaForm(prev => ({
          ...prev,
          incident_start: new Date(incRes.data.incident.created_at).toISOString().slice(0, 16),
          incident_end: new Date().toISOString().slice(0, 16)
        }));
      }
    } catch (err) {
      console.error('Failed to fetch incident details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleTransition = async (action) => {
    setTransitioning(true);
    try {
      await workflowApi.patch(`/incidents/${id}/${action}`);
      await fetchData();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setTransitioning(false);
    }
  };

  const handleRcaSubmit = async (e) => {
    e.preventDefault();
    try {
      await workflowApi.post(`/incidents/${id}/rca`, rcaForm);
      await workflowApi.patch(`/incidents/${id}/close`);
      await fetchData();
    } catch (err) {
      alert('RCA Submission failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <LoadingSkeleton rows={10} />;

  return (
    <div className="animate-fade-in">
      <button 
        onClick={() => navigate('/alarms')}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}
      >
        <ChevronLeft size={16} /> Back to Alarms
      </button>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{incident.component_id}</h1>
            <SeverityBadge severity={incident.severity} />
            <StatusChip status={incident.status} />
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{incident.message}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Started</div>
              <div style={{ fontSize: '14px' }}>{new Date(incident.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Type</div>
              <div style={{ fontSize: '14px' }}>{incident.component_type}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Signal Count</div>
              <div style={{ fontSize: '14px' }}>{incident.signal_count || 0}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          {incident.status === 'OPEN' && (
            <button 
              disabled={transitioning}
              onClick={() => handleTransition('investigate')}
              style={{ padding: '10px 20px', backgroundColor: 'var(--brand-primary)', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
            >
              Start Investigation
            </button>
          )}
          {incident.status === 'INVESTIGATING' && (
            <button 
              disabled={transitioning}
              onClick={() => handleTransition('resolve')}
              style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
            >
              Mark Resolved
            </button>
          )}
          {incident.status === 'RESOLVED' && (
            <button 
              onClick={() => setActiveTab('rca')}
              style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
            >
              Complete RCA to Close
            </button>
          )}
          {incident.status === 'CLOSED' && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Resolution Time</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{incident.mttr_minutes}m</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('signals')}
          style={{ 
            padding: '12px 4px', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: activeTab === 'signals' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'signals' ? '2px solid var(--brand-primary)' : '2px solid transparent'
          }}
        >
          Raw Signals
        </button>
        <button 
          onClick={() => setActiveTab('rca')}
          style={{ 
            padding: '12px 4px', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: activeTab === 'rca' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'rca' ? '2px solid var(--brand-primary)' : '2px solid transparent'
          }}
        >
          Root Cause Analysis
        </button>
      </div>

      {activeTab === 'signals' ? (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '12px 20px', fontSize: '12px' }}>Timestamp</th>
                <th style={{ padding: '12px 20px', fontSize: '12px' }}>Error Code</th>
                <th style={{ padding: '12px 20px', fontSize: '12px' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((sig, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(sig.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 'bold', color: '#f97316' }}>
                    {sig.error_code}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px' }}>{sig.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
          {rca ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Category</label>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginTop: '4px' }}>{rca.root_cause_category}</div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Time Range</label>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginTop: '4px' }}>
                    {new Date(rca.incident_start).toLocaleString()} - {new Date(rca.incident_end).toLocaleString()}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Fix Applied</label>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{rca.fix_applied}</div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Prevention Steps</label>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{rca.prevention_steps}</div>
              </div>
            </div>
          ) : incident.status === 'RESOLVED' ? (
            <form onSubmit={handleRcaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Incident Start</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={rcaForm.incident_start}
                    onChange={e => setRcaForm({...rcaForm, incident_start: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Incident End</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={rcaForm.incident_end}
                    onChange={e => setRcaForm({...rcaForm, incident_end: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Root Cause Category</label>
                <select 
                  value={rcaForm.root_cause_category}
                  onChange={e => setRcaForm({...rcaForm, root_cause_category: e.target.value})}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                >
                  {['HARDWARE_FAILURE', 'SOFTWARE_BUG', 'CONFIGURATION_ERROR', 'CAPACITY_EXHAUSTION', 'NETWORK_ISSUE', 'HUMAN_ERROR', 'THIRD_PARTY_FAILURE', 'UNKNOWN'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Fix Applied</label>
                <textarea 
                  required
                  minLength={10}
                  value={rcaForm.fix_applied}
                  onChange={e => setRcaForm({...rcaForm, fix_applied: e.target.value})}
                  placeholder="Describe the technical fix applied..."
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', minHeight: '100px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Prevention Steps</label>
                <textarea 
                  required
                  minLength={10}
                  value={rcaForm.prevention_steps}
                  onChange={e => setRcaForm({...rcaForm, prevention_steps: e.target.value})}
                  placeholder="How will we prevent this in the future?"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', minHeight: '100px' }}
                />
              </div>

              <button 
                type="submit"
                style={{ 
                  alignSelf: 'flex-end', 
                  padding: '12px 24px', 
                  backgroundColor: 'var(--brand-primary)', 
                  color: 'white', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={18} /> Submit RCA & Close Incident
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              RCA can only be submitted once the incident is marked as RESOLVED.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncidentDetail;
