import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { buildUrl } from './utils/api';

export default function App() {
  // Estado inicial: verifica se tem token salvo
  const [currentView, setCurrentView] = useState(() => (
    localStorage.getItem('token') ? 'dashboard' : 'landing'
  ));

  // Pré-aquecimento do backend (silencioso)
  useEffect(() => {
    fetch(buildUrl('/api/health')).catch(() => {});
  }, []);

  // 🔴 NOVO: Escuta o evento de logout disparado pelo api.js (token expirado)
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentView('login');
      window.history.replaceState({}, '', '/login');
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const navigateTo = useCallback((view) => {
    if (view === 'landing' || view === 'login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    if (view === 'dashboard' && !window.location.pathname.startsWith('/dashboard')) {
      window.history.replaceState({}, '', '/dashboard/guerra');
    }
    
    setCurrentView(view);
  }, []);

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 font-sans">
      {currentView === 'landing' && <LandingPage onNavigate={navigateTo} />}
      {currentView === 'login' && <LoginPage onNavigate={navigateTo} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
    </div>
  );
}
