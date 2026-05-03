import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  BarChart3, 
  Settings, 
  Database,
  ShieldAlert,
  ChevronRight,
  Activity,
  Users
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 12px',
      borderRadius: '6px',
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
      textDecoration: 'none',
      fontSize: '12px',
      fontWeight: isActive ? '600' : '400',
      transition: 'all var(--transition-speed)',
      marginBottom: '2px'
    })}
    className="sidebar-link"
  >
    <Icon size={16} />
    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    <ChevronRight size={12} className="chevron" style={{ opacity: 0 }} />
  </NavLink>
);

const SidebarSection = ({ title, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <h3 style={{ 
      fontSize: '10px', 
      fontWeight: 'bold', 
      color: 'var(--text-muted)', 
      textTransform: 'uppercase', 
      letterSpacing: '0.05em',
      padding: '0 12px 6px 12px'
    }}>
      {title}
    </h3>
    {children}
  </div>
);

export const Sidebar = () => {
  return (
    <aside style={{
      width: '200px',
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '16px 8px',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        padding: '0 12px 24px 12px' 
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          backgroundColor: 'var(--brand-primary)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <ShieldAlert size={16} />
        </div>
        <h1 style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>IMS Console</h1>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
        <SidebarSection title="Ingestion">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboards" />
          <SidebarLink to="/alarms" icon={Bell} label="Alarms" />
          <SidebarLink to="/services" icon={Activity} label="Services" />
        </SidebarSection>

        <SidebarSection title="Logs">
          <SidebarLink to="/logs" icon={FileText} label="Log Management" />
          <SidebarLink to="/alerts/history" icon={Bell} label="Notification History" />
        </SidebarSection>

        <SidebarSection title="Administration">
          <SidebarLink to="/settings/alerts" icon={Settings} label="Alert Config" />
          <SidebarLink to="/rca-vault" icon={Database} label="RCA Vault" />
          <SidebarLink to="/users" icon={Users} label="User Management" />
        </SidebarSection>

        <SidebarSection title="System">
          <SidebarLink to="/health" icon={Activity} label="IMS Health" />
          <SidebarLink to="/docs" icon={FileText} label="IMS Docs" />
        </SidebarSection>
      </nav>

      <div style={{ 
        padding: '16px', 
        backgroundColor: 'var(--bg-tertiary)', 
        borderRadius: '12px',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Deployment: AWS-USE1</div>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>v1.4.2-stable</div>
      </div>
    </aside>
  );
};
