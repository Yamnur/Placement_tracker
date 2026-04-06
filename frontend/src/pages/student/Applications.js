import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { format } from 'date-fns';

const statusColor = {
  applied: 'badge-applied',
  shortlisted: 'badge-shortlisted',
  selected: 'badge-selected',
  rejected: 'badge-rejected',
};

const statusMsg = {
  applied: 'Your application is under review.',
  shortlisted: '🎉 You have been shortlisted! Watch for further updates.',
  selected: '🏆 Congratulations! You have been selected.',
  rejected: 'Unfortunately, you were not selected for this drive.',
};

export default function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/applications/my').then(r => setApps(r.data)).finally(() => setLoading(false));
  }, []);

  const counts = {
    all: apps.length,
    applied: apps.filter(a => a.status === 'applied').length,
    shortlisted: apps.filter(a => a.status === 'shortlisted').length,
    selected: apps.filter(a => a.status === 'selected').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <style>{`
        @media (max-width: 480px) {
          .app-card-row {
            flex-wrap: wrap !important;
          }
          .app-timeline {
            gap: 0 !important;
          }
          .timeline-step {
            flex: 1 !important;
            min-width: 80px !important;
          }
        }
      `}</style>
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track the status of all your placement applications</p>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: counts.all, color: 'var(--text)' },
          { label: 'Shortlisted', value: counts.shortlisted, color: 'var(--amber)' },
          { label: 'Selected', value: counts.selected, color: 'var(--green)' },
          { label: 'Rejected', value: counts.rejected, color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={filter === key ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📋</div>
          <p>No applications in this category</p>
          <Link to="/student/drives" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse drives</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(app => (
            <div key={app._id} className="card" style={{
              borderLeft: `3px solid ${
                app.status === 'selected' ? 'var(--green)' :
                app.status === 'shortlisted' ? 'var(--amber)' :
                app.status === 'rejected' ? 'var(--red)' : 'var(--border2)'
              }`,
              padding: '1.25rem 1.5rem',
            }}>
              <div className="app-card-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>
                      {app.drive?.job?.company?.name}
                    </span>
                    <span className={`badge ${statusColor[app.status]}`}>{app.status}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '4px' }}>
                    {app.drive?.job?.role} · {app.drive?.job?.type}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                    Applied on {format(new Date(app.appliedAt), 'dd MMM yyyy')} ·
                    Drive: {app.drive?.driveDate ? format(new Date(app.drive.driveDate), 'dd MMM yyyy') : 'TBA'}
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '8px', color:
                    app.status === 'selected' ? 'var(--green)' :
                    app.status === 'shortlisted' ? 'var(--amber)' :
                    app.status === 'rejected' ? 'var(--red)' : 'var(--text3)'
                  }}>
                    {statusMsg[app.status]}
                  </div>
                  {app.adminRemarks && (
                    <div style={{ marginTop: '8px', padding: '0.5rem 0.75rem', background: 'var(--bg2)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                      <strong>Remark:</strong> {app.adminRemarks}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--green)', fontWeight: 600 }}>
                    ₹ {app.drive?.job?.salary} LPA
                  </div>
                  <Link to={`/student/drives/${app.drive?._id}`} style={{ fontSize: '0.78rem', color: 'var(--accent2)', marginTop: '4px', display: 'block' }}>
                    View drive →
                  </Link>
                </div>
              </div>

              {/* Status timeline */}
              <div className="app-timeline" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0', alignItems: 'center' }}>
                {['applied', 'shortlisted', 'selected'].map((s, i) => {
                  const reached = ['applied', 'shortlisted', 'selected'].indexOf(app.status) >= i;
                  const isCurrent = app.status === s;
                  const isRejected = app.status === 'rejected';
                  return (
                    <div key={s} className="timeline-step" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem', fontWeight: 600,
                          background: isRejected && isCurrent ? 'var(--red-dim)' : reached ? 'var(--accent-dim)' : 'var(--surface2)',
                          color: isRejected && isCurrent ? 'var(--red)' : reached ? 'var(--accent2)' : 'var(--text3)',
                          border: `1px solid ${reached ? 'var(--accent)' : 'var(--border)'}`,
                        }}>
                          {reached ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: reached ? 'var(--text2)' : 'var(--text3)', marginTop: '4px', textTransform: 'capitalize' }}>{s}</div>
                      </div>
                      {i < 2 && (
                        <div style={{ height: '2px', flex: 1, background: ['applied', 'shortlisted', 'selected'].indexOf(app.status) > i ? 'var(--accent)' : 'var(--border)', margin: '0 -4px', marginBottom: '18px' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
