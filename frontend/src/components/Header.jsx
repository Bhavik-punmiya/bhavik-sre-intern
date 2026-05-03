import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Bell, Search, User, FileText, Zap, Activity } from 'lucide-react';
import { workflowApi, alertApi } from '../api/client';
import { SeverityBadge } from './Badges';
import { Link, useNavigate } from 'react-router-dom';

export const Header = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await alertApi.get('/alerts/history');
        setAlerts(res.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    };
    fetchAlerts();
    const alertTimer = setInterval(fetchAlerts, 60000);
    return () => clearInterval(alertTimer);
  }, []);

  // Handle outside click for search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time search as user types
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await workflowApi.get(`/search?q=${searchQuery.trim()}`);
          setSearchResults(res.data);
          setShowSearch(true);
        } catch (err) {
          console.error('Search failed', err);
        }
      } else {
        setSearchResults([]);
        setShowSearch(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300); // Debounce
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleResultClick = (result) => {
    if (result.type === 'incident') navigate(`/incidents/${result.id}`);
    else if (result.type === 'service') navigate(`/logs/${result.id}`);
    else if (result.type === 'signal') navigate(`/logs/${result.component_type.toLowerCase()}/${result.id}`);
    
    setSearchQuery('');
    setShowSearch(false);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'incident': return <Zap size={14} color="#ef4444" />;
      case 'service': return <FileText size={14} color="#3b82f6" />;
      case 'signal': return <Activity size={14} color="#10b981" />;
      default: return <Search size={14} />;
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '13px',
          fontWeight: '500',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#10b981',
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
          }}></span>
          LIVE: {time.toLocaleTimeString()}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Global Search with Results Dropdown */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '10px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            zIndex: 10
          }} />
          <input 
            type="text" 
            placeholder="Search signals, incidents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setShowSearch(true)}
            style={{
              padding: '6px 12px 6px 32px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              fontSize: '13px',
              width: '320px',
              outline: 'none',
              transition: 'width 0.2s'
            }}
          />

          {showSearch && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                SEARCH RESULTS
              </div>
              {searchResults.map((result, i) => (
                <div 
                  key={i}
                  onClick={() => handleResultClick(result)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: i === searchResults.length - 1 ? 'none' : '1px solid var(--border-color)',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getResultIcon(result.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {result.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {result.sublabel}
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {result.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)' }}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            style={{ color: 'var(--text-secondary)', position: 'relative' }}
          >
            <Bell size={20} />
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: '9px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-secondary)'
              }}>
                {alerts.length}
              </span>
            )}
          </button>

          {showAlerts && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '320px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '16px',
              zIndex: 1000
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Recent Alerts</span>
                <Link 
                  to="/alarms" 
                  onClick={() => setShowAlerts(false)}
                  style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none' }}
                >
                  View all
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                {alerts.map((alert, i) => (
                  <Link 
                    key={i} 
                    to={`/incidents/${alert.incident_id}`}
                    onClick={() => setShowAlerts(false)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-tertiary)',
                      fontSize: '12px',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <SeverityBadge severity={alert.severity} />
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        {new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-primary)' }}>
                      {alert.component_type || 'SYSTEM'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>via {alert.channel}</span>
                      <span style={{ 
                        fontSize: '9px', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        backgroundColor: alert.status === 'sent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: alert.status === 'sent' ? '#10b981' : '#ef4444'
                      }}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}>
          <User size={18} />
        </div>
      </div>
    </header>
  );
};
