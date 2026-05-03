import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '20px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{title}</span>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          backgroundColor: `${color}15`, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        {value !== null ? value : '...'}
      </div>
    </div>
  );
};

export const LoadingSkeleton = ({ rows = 5, height = '40px' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height,
          width: '100%',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '4px',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}></div>
      ))}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
