import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('loading');

  useEffect(() => {
   
    const token = localStorage.getItem('token');
    if (token) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('landing');
    }
  }, []);

  const navigateTo = (view) => {
    if (view === 'landing' || view === 'login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setCurrentView(view);
  };

  if (currentView === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080B14] text-slate-100 font-black uppercase tracking-[0.35em]">
        <div className="wt-card wt-border-glow rounded-3xl px-8 py-6 text-sm text-slate-300 animate-pulse">
          Carregando sessão estratégica...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 font-sans">
      {currentView === 'landing' && <LandingPage onNavigate={navigateTo} />}
      {currentView === 'login' && <LoginPage onNavigate={navigateTo} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
    </div>
  );
}
