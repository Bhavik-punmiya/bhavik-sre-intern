import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { workflowApi, ingesterApi, alertApi, mockApi } from '../api/client';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { Activity, Globe, Shield, Zap } from 'lucide-react';

const ServiceHealth = ({ name, url, client }) => {
  const { data, error, loading } = useAutoRefresh(() => client.get('/health'), 10000);
  const status = error ? 'DOWN' : loading ? 'PENDING' : 'HEALTHY';
  const color = status === 'HEALTHY' ? '#10b981' : status === 'DOWN' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{
      padding: '12px 20px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1
    }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Service</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{name}</div>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color }}>{status}</div>
    </div>
  );
};

const Metrics = () => {
  const { data: metrics } = useAutoRefresh(() => workflowApi.get('/metrics/throughput'), 30000);
  
  const lineData = metrics?.map(m => ({
    time: new Date(m.bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    count: parseInt(m.signal_count)
  })).reverse() || [];

  // Bar data: signals by component_type
  const componentCounts = metrics?.reduce((acc, m) => {
    acc[m.component_type] = (acc[m.component_type] || 0) + parseInt(m.signal_count);
    return acc;
  }, {}) || {};
  const barData = Object.entries(componentCounts).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>System Metrics</h1>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          flex: 1
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} /> Throughput (Last 60m)
          </h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Line type="monotone" dataKey="count" stroke="var(--brand-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          flex: 1
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} /> Signals by Component
          </h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Infrastructure Health</h3>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <ServiceHealth name="Ingester" client={ingesterApi} />
        <ServiceHealth name="Workflow" client={workflowApi} />
        <ServiceHealth name="Alerting" client={alertApi} />
        <ServiceHealth name="Simulation" client={mockApi} />
      </div>
    </div>
  );
};

export default Metrics;
