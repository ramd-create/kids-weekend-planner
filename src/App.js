import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Planner from './pages/Planner';
import ShareView from './pages/ShareView';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedWeekend, setSelectedWeekend] = useState(null);

  function navigate(p, weekend = null) {
    setPage(p);
    if (weekend) setSelectedWeekend(weekend);
  }

  return (
    <div className="app">
      {page === 'dashboard' && <Dashboard navigate={navigate} />}
      {page === 'activities' && <Activities navigate={navigate} />}
      {page === 'planner' && <Planner navigate={navigate} weekend={selectedWeekend} />}
      {page === 'share' && <ShareView navigate={navigate} weekend={selectedWeekend} />}
      <BottomNav page={page} navigate={navigate} />
    </div>
  );
}

function BottomNav({ page, navigate }) {
  return (
    <nav className="bottom-nav">
      <button className={page === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}>
        <span>🏠</span><span>Home</span>
      </button>
      <button className={page === 'activities' ? 'active' : ''} onClick={() => navigate('activities')}>
        <span>⚡</span><span>Activities</span>
      </button>
      <button className={page === 'planner' ? 'active' : ''} onClick={() => navigate('planner')}>
        <span>📋</span><span>Plan</span>
      </button>
    </nav>
  );
}
