import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { formatDate, getDaysOfWeekend } from '../utils/custodyCalc';

const DAY_COLORS = { 4: '#FF7043', 5: '#7B61FF', 6: '#00BFA5', 0: '#F9A825', 1: '#E91E8C' };
const DAY_NAMES = { 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday', 1: 'Monday' };
const DAY_EMOJIS = { 4: '🌅', 5: '🎉', 6: '⭐', 0: '🌊', 1: '💛' };

export default function ShareView({ navigate, weekend }) {
  const [plan, setPlan] = useState(null);
  const shareRef = useRef(null);

  const days = weekend ? getDaysOfWeekend(weekend.start, weekend.end) : [];

  useEffect(() => {
    if (!weekend) return;
    return onValue(ref(db, `kidsPlans/${weekend.id}`), snap => {
      setPlan(snap.val());
    });
  }, [weekend?.id]);

  if (!weekend || !plan) return (
    <div className="content" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <p style={{ color: 'var(--muted)', fontWeight: 700 }}>No plan yet for this weekend.</p>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('planner', weekend)}>
        Start Planning
      </button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <p>SHARE VIEW</p>
        <h1>Send to Shanvi 📤</h1>
        <p>Screenshot the card below and send it!</p>
      </div>

      <div className="content">
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
          📸 Screenshot everything below this line
        </div>
        <div style={{ borderTop: '2px dashed #DDD', marginBottom: 16 }} />

        {/* THE SHAREABLE CARD */}
        <div ref={shareRef} style={{
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          fontFamily: "'Nunito', sans-serif"
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7B61FF 0%, #FF7043 100%)',
            color: 'white', padding: '20px 20px 18px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: 0.85, marginBottom: 4 }}>
              {formatDate(weekend.start).toUpperCase()} → {formatDate(weekend.end).toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              Our Weekend ✨
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>
              Appa + Shanvi + Nithara
            </div>
          </div>

          {/* Days */}
          <div style={{ padding: '16px 16px 20px' }}>
            {days.map(d => {
              const key = d.toISOString().split('T')[0];
              const dayNum = d.getDay();
              const color = DAY_COLORS[dayNum] || '#7B61FF';
              const dayName = DAY_NAMES[dayNum];
              const emoji = DAY_EMOJIS[dayNum];
              const items = plan?.days?.[key]?.items || [];
              const meals = plan?.meals?.[key] || {};
              const hasMeals = Object.values(meals).some(m => m);

              return (
                <div key={key} style={{ marginBottom: 18 }}>
                  {/* Day header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ background: color, color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
                      {emoji} {dayName.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: '#AAAAAA', fontWeight: 600 }}>
                      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Activities */}
                  {items.length === 0 && !hasMeals ? (
                    <div style={{ fontSize: 13, color: '#CCC', fontWeight: 600, padding: '6px 4px' }}>Free day — we'll figure it out! 😊</div>
                  ) : (
                    <>
                      {items.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          background: '#FAFAFA', borderRadius: 12, padding: '9px 12px',
                          marginBottom: 6, borderLeft: `3px solid ${color}`
                        }}>
                          <div style={{ fontSize: 18 }}>{item.emoji}</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
                            {item.time && <div style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 700 }}>{item.time}</div>}
                            {item.note && <div style={{ fontSize: 12, color: '#AAAAAA' }}>{item.note}</div>}
                          </div>
                        </div>
                      ))}

                      {hasMeals && (
                        <div style={{ background: '#FFF8F0', borderRadius: 12, padding: '9px 12px', marginTop: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#AAAAAA', marginBottom: 6 }}>🍽️ MEALS</div>
                          {['Breakfast','Lunch','Dinner'].filter(s => meals[s]).map(slot => (
                            <div key={slot} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 3 }}>
                              <span style={{ fontWeight: 800, color: '#AAAAAA', minWidth: 64 }}>{slot}</span>
                              <span style={{ fontWeight: 700 }}>{meals[slot]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid #F0F0F0' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>💛</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#AAAAAA' }}>Can't wait to see you!</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '2px dashed #DDD', margin: '16px 0' }} />

        <button className="btn btn-ghost btn-full" onClick={() => navigate('planner', weekend)}>
          ← Back to Edit Plan
        </button>
      </div>
    </div>
  );
}
