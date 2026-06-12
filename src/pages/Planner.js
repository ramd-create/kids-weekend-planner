import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { formatDate, getDaysOfWeekend } from '../utils/custodyCalc';

const DAY_COLORS = { 4: '#FF7043', 5: '#7B61FF', 6: '#00BFA5', 0: '#F9A825' }; // Thu-Mon
const DAY_NAMES = { 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday', 1: 'Monday' };
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner'];

const EMPTY_ITEM = { title: '', emoji: '✨', note: '', time: '', type: 'activity' };

export default function Planner({ navigate, weekend }) {
  const [plan, setPlan] = useState(null);
  const [activities, setActivities] = useState({});
  const [addingTo, setAddingTo] = useState(null); // { dayKey, type }
  const [form, setForm] = useState(EMPTY_ITEM);
  const [loaded, setLoaded] = useState(false);

  const days = weekend ? getDaysOfWeekend(weekend.start, weekend.end) : [];

  useEffect(() => {
    if (!weekend) return;
    const plansRef = ref(db, `kidsPlans/${weekend.id}`);
    const actsRef = ref(db, 'kidsActivities');

    onValue(actsRef, snap => setActivities(snap.val() || {}));

    onValue(plansRef, snap => {
      const existing = snap.val();
      if (existing) {
        setPlan(existing);
      } else {
        // Bootstrap with active scheduled activities
        const newPlan = { weekendId: weekend.id, days: {}, meals: {}, notes: '' };
        days.forEach(d => {
          const key = d.toISOString().split('T')[0];
          newPlan.days[key] = { items: [] };
          newPlan.meals[key] = {};
        });
        setPlan(newPlan);
      }
      setLoaded(true);
    }, { onlyOnce: true });
  }, [weekend?.id]);

  // Auto-inject scheduled activities into plan days
  useEffect(() => {
    if (!plan || !loaded) return;
    const activeActs = Object.values(activities).filter(a => a.active);
    if (!activeActs.length) return;

    const updated = { ...plan, days: { ...plan.days } };
    let changed = false;

    days.forEach(d => {
      const key = d.toISOString().split('T')[0];
      const dayName = DAY_NAMES[d.getDay()];
      const dayActs = activeActs.filter(a => a.day === dayName || a.day === 'Flexible');
      const existing = updated.days[key]?.items || [];
      const existingTitles = existing.map(i => i.title);

      dayActs.forEach(a => {
        if (!existingTitles.includes(a.name)) {
          if (!updated.days[key]) updated.days[key] = { items: [] };
          updated.days[key].items = [...(updated.days[key].items || []), {
            title: a.name, emoji: a.emoji, time: a.time,
            note: a.location || '', type: 'scheduled', who: a.who
          }];
          changed = true;
        }
      });
    });

    if (changed) setPlan(updated);
  }, [activities, loaded]);

  function savePlan(updatedPlan) {
    const p = updatedPlan || plan;
    setPlan(p);
    set(ref(db, `kidsPlans/${weekend.id}`), p);
  }

  function addItem(dayKey) {
    if (!form.title.trim()) return;
    const updated = { ...plan };
    if (!updated.days[dayKey]) updated.days[dayKey] = { items: [] };
    updated.days[dayKey].items = [...(updated.days[dayKey].items || []), { ...form }];
    savePlan(updated);
    setForm(EMPTY_ITEM);
    setAddingTo(null);
  }

  function removeItem(dayKey, idx) {
    const updated = { ...plan };
    updated.days[dayKey].items = updated.days[dayKey].items.filter((_, i) => i !== idx);
    savePlan(updated);
  }

  function setMeal(dayKey, slot, value) {
    const updated = { ...plan };
    if (!updated.meals) updated.meals = {};
    if (!updated.meals[dayKey]) updated.meals[dayKey] = {};
    updated.meals[dayKey][slot] = value;
    savePlan(updated);
  }

  if (!weekend) return <div className="content"><p style={{color:'var(--muted)', marginTop:40, textAlign:'center'}}>Select a weekend from Home to start planning.</p></div>;
  if (!loaded) return <div className="content"><p style={{color:'var(--muted)', marginTop:40, textAlign:'center'}}>Loading...</p></div>;

  return (
    <div>
      <div className="page-header">
        <p>PLANNING</p>
        <h1>Weekend 📋</h1>
        <p>{formatDate(weekend.start)} → {formatDate(weekend.end)}</p>
      </div>

      <div className="content">
        {days.map(d => {
          const key = d.toISOString().split('T')[0];
          const dayNum = d.getDay();
          const color = DAY_COLORS[dayNum] || '#7B61FF';
          const dayName = DAY_NAMES[dayNum];
          const items = plan?.days?.[key]?.items || [];
          const meals = plan?.meals?.[key] || {};
          const isAdding = addingTo === key;

          return (
            <div key={key} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ background: color, color: 'white', borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {dayName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Activities */}
              {items.map((item, idx) => (
                <div key={idx} className="card" style={{ borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 18 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
                    {item.time && <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{item.time}</div>}
                    {item.note && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.note}</div>}
                    {item.type === 'scheduled' && (
                      <span style={{ fontSize: 10, background: color+'22', color, borderRadius: 8, padding: '1px 7px', fontWeight: 800 }}>Scheduled</span>
                    )}
                  </div>
                  <button onClick={() => removeItem(key, idx)} style={{ background: 'none', border: 'none', fontSize: 16, color: '#CCC', padding: 4 }}>✕</button>
                </div>
              ))}

              {/* Add item form */}
              {isAdding ? (
                <div className="card">
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={form.emoji} onChange={e => setForm(f => ({...f, emoji: e.target.value}))}
                      style={{ width: 44, padding: '8px', borderRadius: 10, border: '1.5px solid #EEE', fontSize: 16, textAlign: 'center' }} />
                    <input value={form.title} placeholder="Activity name" onChange={e => setForm(f => ({...f, title: e.target.value}))}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #EEE', fontSize: 14, fontWeight: 600 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={form.time} placeholder="Time (e.g. 9:00 AM)" onChange={e => setForm(f => ({...f, time: e.target.value}))}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #EEE', fontSize: 13 }} />
                    <input value={form.note} placeholder="Note / location" onChange={e => setForm(f => ({...f, note: e.target.value}))}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #EEE', fontSize: 13 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => addItem(key)}>Add</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAddingTo(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTo(key)} style={{ width: '100%', padding: '9px', borderRadius: 12, border: '1.5px dashed #DDD', background: 'none', color: 'var(--muted)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Add activity
                </button>
              )}

              {/* Meals */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>🍽️ Meals</div>
                {MEAL_SLOTS.map(slot => (
                  <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, width: 70, color: 'var(--muted)' }}>{slot}</div>
                    <input value={meals[slot] || ''} placeholder={`What's for ${slot.toLowerCase()}?`}
                      onChange={e => setMeal(key, slot, e.target.value)}
                      style={{ flex: 1, padding: '7px 12px', borderRadius: 10, border: '1.5px solid #EEE', fontSize: 13, fontWeight: 600 }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button className="btn btn-teal btn-full" style={{ marginTop: 8 }} onClick={() => navigate('share', weekend)}>
          📤 Generate Share View for Shanvi
        </button>
      </div>
    </div>
  );
}
