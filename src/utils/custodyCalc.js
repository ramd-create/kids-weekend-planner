// Father has every other weekend: Thu (school dismissal) to Mon (school start)
// Confirmed father's weekends to anchor the calculation:
// Jun 13-16 2026 = Father's weekend (current)
// Jun 26-30 2026 = skip (mother's)  
// Jul 9-13 2026 = Father's weekend

// Anchor: Thursday June 12, 2025 was a father's weekend Thursday
// Actually anchor to a known Thursday: April 10, 2025
const ANCHOR_THURSDAY = new Date(2025, 3, 17); // April 10, 2025 = Father's weekend

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getMostRecentThursday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  const day = d.getDay();
  let daysBack;
  if (day === 4) daysBack = 0;      // Thursday
  else if (day === 5) daysBack = 1; // Friday
  else if (day === 6) daysBack = 2; // Saturday
  else if (day === 0) daysBack = 3; // Sunday
  else if (day === 1) daysBack = 4; // Monday
  else if (day === 2) daysBack = 5; // Tuesday (between weekends)
  else daysBack = 6;                // Wednesday (between weekends)
  
  const thu = new Date(d);
  thu.setDate(d.getDate() - daysBack);
  return thu;
}

export function isFathersWeekend(date) {
  const thu = getMostRecentThursday(date);
  const anchor = new Date(ANCHOR_THURSDAY);
  anchor.setHours(0, 0, 0, 0);
  const weeksDiff = Math.round((thu - anchor) / MS_PER_WEEK);
  return weeksDiff % 2 === 0;
}

export function getFathersWeekends(year) {
  const weekends = [];
  // Start from Jan 1 of that year
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  // Find first Thursday of the year
  const d = new Date(start);
  while (d.getDay() !== 4) {
    d.setDate(d.getDate() + 1);
  }
  
  // Iterate every Thursday
  while (d <= end) {
    if (isFathersWeekend(d)) {
      const thu = new Date(d);
      const mon = new Date(d);
      mon.setDate(mon.getDate() + 4);
      weekends.push({ 
        start: thu, 
        end: mon, 
        id: thu.toISOString().split('T')[0] 
      });
    }
    d.setDate(d.getDate() + 7);
  }
  return weekends;
}

export function getCurrentOrNextFathersWeekend() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  
  // Are we currently in a father's weekend? (Thu=4, Fri=5, Sat=6, Sun=0, Mon=1)
  const inWeekend = day === 4 || day === 5 || day === 6 || day === 0 || day === 1;
  
  if (inWeekend && isFathersWeekend(today)) {
    const thu = getMostRecentThursday(today);
    const mon = new Date(thu);
    mon.setDate(thu.getDate() + 4);
    return { start: thu, end: mon, id: thu.toISOString().split('T')[0], isCurrent: true };
  }
  
  // Find next father's Thursday
  const d = new Date(today);
  // Move to next Thursday
  while (d.getDay() !== 4) d.setDate(d.getDate() + 1);
  
  for (let i = 0; i < 20; i++) {
    if (isFathersWeekend(d)) {
      const mon = new Date(d);
      mon.setDate(mon.getDate() + 4);
      return { start: new Date(d), end: mon, id: new Date(d).toISOString().split('T')[0], isCurrent: false };
    }
    d.setDate(d.getDate() + 7);
  }
  return null;
}

export const getNextFathersWeekend = getCurrentOrNextFathersWeekend;

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

export function getDaysOfWeekend(start, end) {
  const days = [];
  const d = new Date(start);
  const endDate = new Date(end);
  while (d <= endDate) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}
