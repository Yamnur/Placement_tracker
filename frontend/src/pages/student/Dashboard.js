import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { format, isPast } from 'date-fns';

const statusColor = { applied: 'badge-applied', shortlisted: 'badge-shortlisted', selected: 'badge-selected', rejected: 'badge-rejected' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/drives/active'), api.get('/applications/my')])
      .then(([d, a]) => { setDrives(d.data.slice(0, 4)); setApps(a.data.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your placement overview</p>
      </div>

      {!user?.isProfileComplete && (
        <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--amber)', marginBottom: '2px' }}>Complete your profile</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>Add your CGPA, phone, and graduation year to start receiving notifications</div>
          </div>
          <Link to="/student/profile" className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>Complete now →</Link>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'CGPA', value: user?.cgpa || '—', color: 'var(--accent2)' },
          { label: 'Branch', value: user?.branch || '—', color: 'var(--green)' },
          { label: 'Applications', value: apps.length, color: 'var(--amber)' },
          { label: 'Selected', value: apps.filter(a => a.status === 'selected').length, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Open Drives</h2>
            <Link to="/student/drives" style={{ fontSize: '0.8rem', color: 'var(--accent2)' }}>View all →</Link>
          </div>
          {drives.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}><div className="empty-icon">🚀</div><p>No active drives right now</p></div>
          ) : drives.map(d => (
            <Link key={d._id} to={`/student/drives/${d._id}`} style={{ display: 'block', padding: '0.85rem', borderRadius: '8px', background: 'var(--bg2)', marginBottom: '0.5rem', textDecoration: 'none', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.9rem' }}>{d.job?.company?.name} — {d.job?.role}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '2px' }}>
                {d.job?.salary} LPA · Deadline: {format(new Date(d.deadline), 'dd MMM')}
              </div>
            </Link>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>My Applications</h2>
            <Link to="/student/applications" style={{ fontSize: '0.8rem', color: 'var(--accent2)' }}>View all →</Link>
          </div>
          {apps.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}><div className="empty-icon">📋</div><p>No applications yet</p></div>
          ) : apps.map(a => (
            <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg2)', marginBottom: '0.5rem', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--text)' }}>{a.drive?.job?.company?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{a.drive?.job?.role}</div>
              </div>
              <span className={`badge ${statusColor[a.status]}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
