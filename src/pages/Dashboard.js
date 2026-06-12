import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { getNextFathersWeekend, getFathersWeekends, formatDate } from '../utils/custodyCalc';

export default function Dashboard({ navigate }) {
  const [plans, setPlans] = useState({});
  const nextWeekend = getNextFathersWeekend();
  const upcomingWeekends = getFathersWeekends(new Date().getFullYear());
  const today = new Date();
  const futureWeekends = upcomingWeekends.filter(w => new Date(w.end) >= today).slice(0, 8);

  useEffect(() => {
    const plansRef = ref(db, 'kidsPlans');
    return onValue(plansRef, snap => {
      setPlans(snap.val() || {});
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <p>WEEKEND PLANNER</p>
        <h1>Appa + Girls 🌟</h1>
        <p>Shanvi · Nithara</p>
      </div>

      <div className="content">
        {nextWeekend && (
          <>
            <div className="section-label">Next Weekend With You</div>
            <div className="card" style={{ borderLeft: '4px solid #7B61FF' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>
                COMING UP
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>
                {formatDate(nextWeekend.start)} → {formatDate(nextWeekend.end)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {plans[nextWeekend.id] ? (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('planner', nextWeekend)}>
                      ✏️ Edit Plan
                    </button>
                    <button className="btn btn-teal btn-sm" onClick={() => navigate('share', nextWeekend)}>
                      📤 Share View
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => navigate('planner', nextWeekend)}>
                    ✨ Start Planning
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <div className="section-label">Your Weekends This Year</div>
        {futureWeekends.map(w => {
          const hasPlan = !!plans[w.id];
          const isNext = nextWeekend && w.id === nextWeekend.id;
          return (
            <div key={w.id} className="card" style={{ 
              display: 'flex', alignItems: 'center', gap: 12, 
              opacity: isNext ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onClick={() => navigate('planner', w)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>
                  {formatDate(w.start)} → {formatDate(w.end)}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 800, padding: '4px 10px',
                borderRadius: 20, 
                background: hasPlan ? '#E8F5E9' : '#F3F0FF',
                color: hasPlan ? '#2E7D32' : '#7B61FF'
              }}>
                {hasPlan ? '✓ Planned' : 'Plan it'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
