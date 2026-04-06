import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { format, isPast, differenceInDays } from 'date-fns';

export default function StudentDrives() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | eligible | applied
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/drives/active'), api.get('/applications/my')])
      .then(([d, a]) => {
        setDrives(d.data);
        setApplications(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const appliedDriveIds = new Set(applications.map(a => a.drive?._id));

  const isEligible = (drive) => {
    const job = drive.job;
    return user?.cgpa >= job?.minCGPA && job?.eligibleBranches?.includes(user?.branch);
  };

  const daysLeft = (deadline) => differenceInDays(new Date(deadline), new Date());

  const filtered = drives.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.job?.company?.name?.toLowerCase().includes(q) ||
      d.job?.role?.toLowerCase().includes(q) ||
      d.title?.toLowerCase().includes(q);
    if (filter === 'eligible') return matchSearch && isEligible(d);
    if (filter === 'applied') return matchSearch && appliedDriveIds.has(d._id);
    return matchSearch;
  });

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <style>{`
        @media (max-width: 480px) {
          .drive-card {
            gap: 0.75rem !important;
          }
          .drive-card-logo {
            width: 40px !important;
            height: 40px !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
      <div className="page-header">
        <h1>Placement Drives</h1>
        <p>{drives.length} active drives open for applications</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="form-control"
          style={{ maxWidth: '280px' }}
          placeholder="Search company, role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[['all', 'All'], ['eligible', 'Eligible for me'], ['applied', 'Applied']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={filter === val ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🚀</div>
          <p>No drives match your filter</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(d => {
            const eligible = isEligible(d);
            const applied = appliedDriveIds.has(d._id);
            const days = daysLeft(d.deadline);
            const urgent = days <= 3;

            return (
              <Link
                key={d._id}
                to={`/student/drives/${d._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card drive-card" style={{
                  display: 'flex', alignItems: 'center', gap: '1.5rem',
                  padding: '1.25rem 1.5rem', cursor: 'pointer',
                  borderColor: applied ? 'rgba(34,201,122,0.3)' : eligible ? 'rgba(79,124,255,0.25)' : 'var(--border)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}>
                  {/* Company logo placeholder */}
                  <div className="drive-card-logo" style={{
                    width: '48px', height: '48px', borderRadius: '10px',
                    background: 'var(--bg3)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                    border: '1px solid var(--border)',
                  }}>
                    🏢
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)', fontSize: '1rem' }}>
                        {d.job?.company?.name}
                      </span>
                      <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>—</span>
                      <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{d.job?.role}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text3)', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--green)', fontWeight: 500 }}>₹ {d.job?.salary} LPA</span>
                      <span>CGPA ≥ {d.job?.minCGPA}</span>
                      <span>{(d.job?.eligibleBranches || []).join(', ')}</span>
                      {d.venue && <span>📍 {d.venue}</span>}
                    </div>
                  </div>

                  {/* Right badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    {applied
                      ? <span className="badge badge-selected">✓ Applied</span>
                      : eligible
                        ? <span className="badge badge-upcoming">Eligible</span>
                        : <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>Not eligible</span>}
                    <span style={{
                      fontSize: '0.75rem',
                      color: urgent ? 'var(--red)' : 'var(--text3)',
                      fontWeight: urgent ? 600 : 400,
                    }}>
                      {days === 0 ? 'Closes today!' : days < 0 ? 'Closed' : `${days}d left`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
