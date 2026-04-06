import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const statusColor = {
  upcoming: { bg: 'var(--accent-dim)', color: 'var(--accent2)', label: 'Upcoming' },
  active: { bg: 'var(--green-dim)', color: 'var(--green)', label: 'Active' },
  completed: { bg: 'var(--surface2)', color: 'var(--text3)', label: 'Completed' },
  cancelled: { bg: 'var(--red-dim)', color: 'var(--red)', label: 'Cancelled' },
};

export default function StudentCalendar() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    api.get('/drives').then(r => setDrives(r.data)).finally(() => setLoading(false));
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDrivesForDay = (day) => {
    const date = new Date(year, month, day);
    return drives.filter(d => {
      const dd = new Date(d.driveDate);
      return dd.getFullYear() === year && dd.getMonth() === month && dd.getDate() === day;
    });
  };

  const getDeadlinesForDay = (day) => {
    return drives.filter(d => {
      const dd = new Date(d.deadline);
      return dd.getFullYear() === year && dd.getMonth() === month && dd.getDate() === day;
    });
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Upcoming drives list
  const upcoming = drives
    .filter(d => new Date(d.driveDate) >= today)
    .sort((a, b) => new Date(a.driveDate) - new Date(b.driveDate))
    .slice(0, 8);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>📅 Drive Calendar</h1>
        <p>Upcoming placement drives and deadlines</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Calendar */}
        <div className="card">
          {/* Month navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button className="btn btn-outline btn-sm" onClick={prevMonth}>‹ Prev</button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
            <button className="btn btn-outline btn-sm" onClick={nextMonth}>Next ›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text3)', padding: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '70px' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const dayDrives = getDrivesForDay(day);
              const dayDeadlines = getDeadlinesForDay(day);

              return (
                <div key={day} style={{
                  minHeight: '70px', padding: '4px',
                  background: isToday ? 'var(--accent-dim)' : 'var(--surface2)',
                  borderRadius: '6px',
                  border: isToday ? '1px solid var(--accent)' : '1px solid transparent',
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent2)' : 'var(--text2)', marginBottom: '2px' }}>{day}</div>
                  {dayDrives.map(d => (
                    <Link key={d._id} to={`/student/drives/${d._id}`}
                      style={{ display: 'block', fontSize: '0.62rem', background: 'var(--accent)', color: '#fff', borderRadius: '3px', padding: '1px 4px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}
                      title={`Drive: ${d.title}`}>
                      🚀 {d.title}
                    </Link>
                  ))}
                  {dayDeadlines.map(d => (
                    <div key={`dl-${d._id}`}
                      style={{ display: 'block', fontSize: '0.62rem', background: 'var(--red-dim)', color: 'var(--red)', borderRadius: '3px', padding: '1px 4px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={`Deadline: ${d.title}`}>
                      ⏰ {d.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text3)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent)' }} />Drive Date
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text3)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--red-dim)', border: '1px solid var(--red)' }} />Deadline
            </div>
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>🔜 Upcoming Drives</h3>
            {upcoming.length === 0
              ? <div style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>No upcoming drives</div>
              : upcoming.map(d => {
                  const sc = statusColor[d.status] || statusColor.upcoming;
                  const dDate = new Date(d.driveDate);
                  const deadline = new Date(d.deadline);
                  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                  return (
                    <Link key={d._id} to={`/student/drives/${d._id}`}
                      style={{ display: 'block', padding: '0.75rem', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '0.5rem', textDecoration: 'none', borderLeft: `3px solid ${sc.color}` }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{d.job?.company?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{d.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '4px' }}>
                        📅 {dDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        {daysLeft > 0 && <span style={{ marginLeft: '8px', color: daysLeft <= 3 ? 'var(--red)' : 'var(--amber)' }}>⏰ {daysLeft}d left</span>}
                      </div>
                    </Link>
                  );
                })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
