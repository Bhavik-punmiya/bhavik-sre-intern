import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import Dashboard from './pages/Dashboard';
import Alarms from './pages/Alarms';
import IncidentDetail from './pages/IncidentDetail';
import LogGroups from './pages/LogGroups';
import LogStreams from './pages/LogStreams';
import LogEvents from './pages/LogEvents';
import AlertConfig from './pages/AlertConfig';
import RCAVault from './pages/RCAVault';
import AlertHistory from './pages/AlertHistory';
import Services from './pages/Services';
import Health from './pages/Health';
import Docs from './pages/Docs';
import Users from './pages/Users';
import CreateAlarm from './pages/CreateAlarm';
import ServiceDetail from './pages/ServiceDetail';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar />
        
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header theme={theme} toggleTheme={toggleTheme} />
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '32px',
            backgroundColor: 'var(--bg-primary)'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/logs" element={<LogGroups />} />
                <Route path="/logs/:groupName" element={<LogStreams />} />
                <Route path="/logs/:groupName/:streamId" element={<LogEvents />} />
                <Route path="/alarms" element={<Alarms />} />
                <Route path="/alarms/create" element={<CreateAlarm />} />
                <Route path="/alerts/history" element={<AlertHistory />} />
                <Route path="/incidents/:id" element={<IncidentDetail />} />
                <Route path="/rca-vault" element={<RCAVault />} />
                <Route path="/settings/alerts" element={<AlertConfig />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:serviceId" element={<ServiceDetail />} />
                <Route path="/health" element={<Health />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
