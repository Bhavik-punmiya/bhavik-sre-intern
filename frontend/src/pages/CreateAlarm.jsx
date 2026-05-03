import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Info, 
  Search, 
  X, 
  Layers, 
  Database, 
  Activity, 
  Globe, 
  Cpu, 
  BarChart2, 
  Bell 
} from 'lucide-react';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    'Specify metric and conditions',
    'Configure actions',
    'Add alarm details',
    'Preview and create'
  ];

  return (
    <div style={{ width: '280px', flexShrink: 0, paddingRight: '40px', borderRight: '1px solid var(--border-color)' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '32px', position: 'relative' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: `2px solid ${i <= currentStep ? '#3b82f6' : 'var(--text-muted)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: i === currentStep ? '#3b82f6' : 'transparent',
            zIndex: 2
          }}>
            {i === currentStep ? (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />
            ) : (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: i < currentStep ? '#3b82f6' : 'transparent' }} />
            )}
          </div>
          {i < steps.length - 1 && (
            <div style={{
              position: 'absolute',
              left: '11px',
              top: '24px',
              width: '2px',
              height: '32px',
              backgroundColor: i < currentStep ? '#3b82f6' : 'var(--border-color)',
              zIndex: 1
            }} />
          )}
          <div style={{ 
            fontSize: '12px', 
            fontWeight: i === currentStep ? 'bold' : 'normal', 
            color: i === currentStep ? 'var(--text-primary)' : 'var(--text-muted)',
            marginTop: '4px'
          }}>
            <div style={{ fontSize: '10px', marginBottom: '2px' }}>Step {i + 1}</div>
            {step}
          </div>
        </div>
      ))}
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, count }) => (
  <div style={{
    padding: '12px 16px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }}
  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Icon size={16} color="var(--brand-primary)" />
      <span style={{ fontSize: '13px', fontWeight: '500' }}>{label}</span>
    </div>
    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{count}</span>
  </div>
);

const CreateAlarm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showMetricBrowser, setShowMetricBrowser] = useState(false);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        <span>CloudWatch</span> <ChevronRight size={12} /> 
        <span>Alarms</span> <ChevronRight size={12} /> 
        <span style={{ color: 'var(--text-primary)' }}>Create alarm</span>
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        <StepIndicator currentStep={step} />

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Specify metric and conditions</h1>

          {/* Metric Selection Card */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px', 
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Metric</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Preview of the metric or metric expression and the alarm threshold.
            </p>

            <div style={{ 
              height: '300px', 
              backgroundColor: '#0f172a', 
              borderRadius: '8px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px dashed #334155',
              marginBottom: '24px'
            }}>
              <BarChart2 size={48} color="#334155" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Your graph is empty. Select a metric to appear here.</p>
              <button 
                onClick={() => setShowMetricBrowser(true)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: '1px solid #3b82f6',
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Select metric
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px' }}>
            <button 
              onClick={() => navigate('/alarms')}
              style={{ color: '#3b82f6', background: 'none', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => setStep(prev => Math.min(3, prev + 1))}
              style={{ 
                backgroundColor: '#f59e0b', 
                color: 'white', 
                padding: '8px 24px', 
                borderRadius: '4px', 
                border: 'none', 
                fontWeight: 'bold', 
                fontSize: '14px', 
                cursor: 'pointer' 
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Metric Browser Modal (AWS Style) */}
      {showMetricBrowser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '90%',
            maxWidth: '1100px',
            height: '85vh',
            backgroundColor: '#0f172a',
            borderRadius: '12px',
            border: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Select metric</h2>
              <button onClick={() => setShowMetricBrowser(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  placeholder="Search for any metric, dimension, resource id..." 
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #334155', marginBottom: '24px' }}>
                {['Browse (532)', 'Multi source query', 'Graphed metrics', 'Options', 'Source'].map((tab, i) => (
                  <div key={i} style={{ 
                    paddingBottom: '12px', 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    color: i === 0 ? '#3b82f6' : '#94a3b8',
                    borderBottom: i === 0 ? '2px solid #3b82f6' : 'none',
                    cursor: 'pointer'
                  }}>{tab}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <MetricCard icon={Globe} label="AmplifyHosting" count="12" />
                <MetricCard icon={Activity} label="ApiGateway" count="31" />
                <MetricCard icon={Shield} label="Cognito" count="2" />
                <MetricCard icon={Database} label="DynamoDB" count="159" />
                <MetricCard icon={Lock} label="KMS" count="1" />
                <MetricCard icon={Cpu} label="Lambda" count="56" />
                <MetricCard icon={Layers} label="Logs" count="26" />
                <MetricCard icon={Settings} label="Observability Admin" count="4" />
                <MetricCard icon={Database} label="S3" count="18" />
                <MetricCard icon={Mail} label="SES" count="9" />
                <MetricCard icon={BarChart2} label="Usage" count="214" />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #334155', backgroundColor: '#1a1a2e', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button 
                onClick={() => setShowMetricBrowser(false)}
                style={{ color: '#3b82f6', background: 'none', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                disabled
                style={{ 
                  backgroundColor: '#334155', 
                  color: '#94a3b8', 
                  padding: '8px 20px', 
                  borderRadius: '4px', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  fontSize: '13px', 
                  cursor: 'not-allowed'
                }}
              >
                Select metric
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        body { background-color: #0f172a; }
      `}</style>
    </div>
  );
};

// Mock Lucide components for missing icons
const Shield = (props) => <ShieldCheck {...props} />;
const Settings = (props) => <Cpu {...props} />;

export default CreateAlarm;
