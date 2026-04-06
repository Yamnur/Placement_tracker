import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ companies: 0, jobs: 0, drives: 0, students: 0, applications: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/companies'),
      api.get('/jobs'),
      api.get('/drives'),
      api.get('/students'),
      api.get('/applications'),
    ]).then(([co, jo, dr, st, ap]) => {
      setStats({ companies: co.data.length, jobs: jo.data.length, drives: dr.data.length, students: st.data.length, applications: ap.data.length });
      setRecentApps(ap.data.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  const statusColor = { applied: 'badge-applied', shortlisted: 'badge-shortlisted', selected: 'badge-selected', rejected: 'badge-rejected' };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your placement system</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Companies', value: stats.companies, icon: '🏢', color: 'var(--accent2)' },
          { label: 'Active Jobs', value: stats.jobs, icon: '💼', color: 'var(--green)' },
          { label: 'Drives', value: stats.drives, icon: '🚀', color: 'var(--amber)' },
          { label: 'Students', value: stats.students, icon: '👥', color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.icon} {s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Recent Applications</h2>
        {recentApps.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><p>No applications yet</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Branch</th><th>CGPA</th><th>Drive</th><th>Status</th><th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map(app => (
                  <tr key={app._id}>
                    <td data-label="Student" style={{ color: 'var(--text)', fontWeight: 500 }}>{app.student?.name}</td>
                    <td data-label="Branch">{app.student?.branch}</td>
                    <td data-label="CGPA">{app.student?.cgpa}</td>
                    <td data-label="Drive">{app.drive?.job?.company?.name} – {app.drive?.job?.role}</td>
                    <td data-label="Status"><span className={`badge ${statusColor[app.status]}`}>{app.status}</span></td>
                    <td data-label="Applied">{new Date(app.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
