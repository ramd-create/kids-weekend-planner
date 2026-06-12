// Father has every other weekend: Thu (school dismissal) to Mon (school start)
// First weekend started April 10, 2025 (Thursday)
const FIRST_THURSDAY = new Date('2025-04-10T00:00:00');

export function isFathersWeekend(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const daysSinceThursday = (dayOfWeek + 3) % 7;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - daysSinceThursday);
  thursday.setHours(0,0,0,0);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksDiff = Math.round((thursday - FIRST_THURSDAY) / msPerWeek);
  return weeksDiff >= 0 && weeksDiff % 2 === 0;
}

export function getFathersWeekends(year) {
  const weekends = [];
  const d = new Date(`${year}-01-01`);
  while (d.getFullYear() === year) {
    if (d.getDay() === 4 && isFathersWeekend(d)) {
      const thu = new Date(d);
      const mon = new Date(d);
      mon.setDate(mon.getDate() + 4);
      weekends.push({ start: thu, end: mon, id: thu.toISOString().split('T')[0] });
    }
    d.setDate(d.getDate() + 1);
  }
  return weekends;
}

export function getNextFathersWeekend() {
  const today = new Date();
  const d = new Date(today);
  for (let i = 0; i < 60; i++) {
    if (d.getDay() === 4 && isFathersWeekend(d)) {
      const mon = new Date(d);
      mon.setDate(mon.getDate() + 4);
      return { start: new Date(d), end: mon, id: new Date(d).toISOString().split('T')[0] };
    }
    d.setDate(d.getDate() + 1);
  }
  return null;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });
}

export function getDaysOfWeekend(start, end) {
  const days = [];
  const d = new Date(start);
  while (d <= new Date(end)) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}
