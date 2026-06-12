import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, push, update, remove } from 'firebase/database';

const DAYS = ['Thursday','Friday','Saturday','Sunday','Monday','Flexible'];
const KIDS = ['Both','Shanvi','Nithara'];
const COLORS = { Both: '#7B61FF', Shanvi: '#FF7043', Nithara: '#00BFA5' };

const EMPTY = { name: '', emoji: '⚡', who: 'Both', day: 'Saturday', time: '', location: '', active: true, note: '' };

export default function Activities({ navigate }) {
  const [activities, setActivities] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    return onValue(ref(db, 'kidsActivities'), snap => {
      setActivities(snap.val() || {});
    });
  }, []);

  function save() {
    if (!form.name.trim()) return;
    if (editId) {
      update(ref(db, `kidsActivities/${editId}`), form);
    } else {
      push(ref(db, 'kidsActivities'), form);
    }
    setForm(EMPTY); setShowForm(false); setEditId(null);
  }

  function startEdit(id) {
    setEditId(id); setForm(activities[id]); setShowForm(true);
  }

  function toggleActive(id) {
    update(ref(db, `kidsActivities/${id}`), { active: !activities[id].active });
  }

  function deleteActivity(id) {
    if (window.confirm('Delete this activity?')) remove(ref(db, `kidsActivities/${id}`));
  }

  const active = Object.entries(activities).filter(([,a]) => a.active);
  const inactive = Object.entries(activities).filter(([,a]) => !a.active);

  return (
    <div>
      <div className="page-header">
        <p>MANAGE</p>
        <h1>Activities ⚡</h1>
        <p>Scheduled recurring activities for the girls</p>
      </div>

      <div className="content">
        <button className="btn btn-primary btn-full" onClick={() => { setShowForm(true); setForm(EMPTY); setEditId(null); }}>
          + Add Activity
        </button>

        {showForm && (
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 14 }}>
              {editId ? 'Edit Activity' : 'New Activity'}
            </div>
            {[
              ['Name', 'name', 'text', 'e.g. Swimming'],
              ['Emoji', 'emoji', 'text', '🏊'],
              ['Time', 'time', 'text', 'e.g. 12:30 PM'],
              ['Location', 'location', 'text', 'e.g. JEA Abercorn'],
              ['Note', 'note', 'text', 'Optional note'],
            ].map(([label, key, type, placeholder]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                <input
                  type={type}
                  value={form[key]}
                  placeholder={placeholder}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #EEE', fontSize: 14, fontWeight: 600, outline: 'none' }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Who</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {KIDS.map(k => (
                  <button key={k} onClick={() => setForm(f => ({ ...f, who: k }))}
                    style={{ padding: '7px 14px', borderRadius: 20, border: 'none', fontWeight: 800, fontSize: 12,
                      background: form.who === k ? COLORS[k] : '#F0F0F8', color: form.who === k ? 'white' : 'var(--muted)' }}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Day</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DAYS.map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, day: d }))}
                    style={{ padding: '7px 14px', borderRadius: 20, border: 'none', fontWeight: 800, fontSize: 12,
                      background: form.day === d ? 'var(--purple)' : '#F0F0F8', color: form.day === d ? 'white' : 'var(--muted)' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
              <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
          </div>
        )}

        {active.length > 0 && (
          <>
            <div className="section-label">Active Activities</div>
            {active.map(([id, a]) => (
              <ActivityCard key={id} id={id} a={a} onEdit={startEdit} onToggle={toggleActive} onDelete={deleteActivity} />
            ))}
          </>
        )}

        {inactive.length > 0 && (
          <>
            <div className="section-label">Inactive / Ended</div>
            {inactive.map(([id, a]) => (
              <ActivityCard key={id} id={id} a={a} onEdit={startEdit} onToggle={toggleActive} onDelete={deleteActivity} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ id, a, onEdit, onToggle, onDelete }) {
  const color = COLORS[a.who] || '#7B61FF';
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}`, opacity: a.active ? 1 : 0.5 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ fontSize: 22 }}>{a.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 15 }}>{a.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
            {a.day}{a.time ? ` · ${a.time}` : ''}{a.location ? ` · ${a.location}` : ''}
          </div>
          {a.note && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{a.note}</div>}
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 10, background: color + '22', color }}>
              {a.who}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={() => onEdit(id)} style={{ background: '#F0F0F8', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700 }}>Edit</button>
          <button onClick={() => onToggle(id)} style={{ background: a.active ? '#FFF3E0' : '#E8F5E9', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700, color: a.active ? '#E65100' : '#2E7D32' }}>
            {a.active ? 'End' : 'Restore'}
          </button>
        </div>
      </div>
    </div>
  );
}
