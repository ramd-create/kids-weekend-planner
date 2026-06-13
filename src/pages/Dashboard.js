import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { getCurrentOrNextFathersWeekend, getFathersWeekends, formatDate } from '../utils/custodyCalc';

export default function Dashboard({ navigate }) {
  const [plans, setPlans] = useState({});
  const currentWeekend = getCurrentOrNextFathersWeekend();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all father's weekends for this year and next that haven't ended yet
  const thisYear = getFathersWeekends(today.getFullYear());
  const nextYear = getFathersWeekends(today.getFullYear() + 1);
  const allWeekends = [...thisYear, ...nextYear];
  const futureWeekends = allWeekends
    .filter(w => new Date(w.end) >= today)
    .slice(0, 10);

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
        {currentWeekend && (
          <>
            <div className="section-label">
              {currentWeekend.isCurrent ? '🎉 This Weekend — You\'re On!' : 'Next Weekend With You'}
            </div>
            <div className="card" style={{ borderLeft: '4px solid #7B61FF' }}>
              {currentWeekend.isCurrent && (
                <div style={{ 
                  display: 'inline-block', fontSize: 11, fontWeight: 800, 
                  background: '#E8F5E9', color: '#2E7D32', borderRadius: 10,
                  padding: '2px 10px', marginBottom: 8
                }}>● HAPPENING NOW</div>
              )}
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>
                {currentWeekend.isCurrent ? 'CURRENT WEEKEND' : 'COMING UP'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>
                {formatDate(currentWeekend.start)} → {formatDate(currentWeekend.end)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {plans[currentWeekend.id] ? (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('planner', currentWeekend)}>
                      ✏️ Edit Plan
                    </button>
                    <button className="btn btn-teal btn-sm" onClick={() => navigate('share', currentWeekend)}>
                      📤 Share View
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => navigate('planner', currentWeekend)}>
                    ✨ Start Planning
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <div className="section-label">Your Weekends</div>
        {futureWeekends.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>No upcoming weekends found.</p>
        )}
        {futureWeekends.map(w => {
          const hasPlan = !!plans[w.id];
          const isCurrent = currentWeekend && w.id === currentWeekend.id;
          return (
            <div key={w.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
              borderLeft: isCurrent ? '4px solid #7B61FF' : '4px solid transparent'
            }}
            onClick={() => navigate('planner', w)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>
                  {formatDate(w.start)} → {formatDate(w.end)}
                </div>
                {isCurrent && (
                  <div style={{ fontSize: 11, color: '#2E7D32', fontWeight: 800, marginTop: 2 }}>● Now</div>
                )}
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
