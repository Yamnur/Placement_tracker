import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format, isPast, differenceInDays } from 'date-fns';

export default function DriveDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/drives/${id}`),
      api.get('/applications/my'),
    ]).then(([d, a]) => {
      setDrive(d.data);
      setApplied(a.data.some(app => app.drive?._id === id));
    }).catch(() => navigate('/student/drives'))
      .finally(() => setLoading(false));
  }, [id]);

  const apply = async () => {
    if (!user?.isProfileComplete) {
      toast.error('Complete your profile before applying');
      return;
    }
    setApplying(true);
    try {
      await api.post('/applications', { driveId: id });
      setApplied(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;
  if (!drive) return null;

  const job = drive.job;
  const company = job?.company;
  const deadline = new Date(drive.deadline);
  const driveDate = new Date(drive.driveDate);
  const expired = isPast(deadline);
  const daysLeft = differenceInDays(deadline, new Date());
  const eligible = user?.cgpa >= job?.minCGPA && job?.eligibleBranches?.includes(user?.branch);

  return (
    <div style={{ maxWidth: '820px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: '1rem', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
            🏢
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{company?.name}</h1>
            <div style={{ fontSize: '1rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>{job?.role} · {job?.type}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-applied">{drive.title}</span>
              {company?.industry && <span className="badge" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>{company.industry}</span>}
              {company?.location && <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>📍 {company.location}</span>}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {expired ? (
              <div>
                <span className="badge badge-completed" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Drive Closed</span>
              </div>
            ) : applied ? (
              <div>
                <span className="badge badge-selected" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>✓ Applied</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '6px' }}>Application submitted</div>
              </div>
            ) : (
              <div>
                <button
                  className="btn btn-primary"
                  onClick={apply}
                  disabled={applying || !eligible}
                  style={{ padding: '0.7rem 1.75rem', fontSize: '0.95rem' }}
                >
                  {applying ? 'Applying…' : eligible ? 'Apply Now' : 'Not Eligible'}
                </button>
                {!eligible && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--red)', marginTop: '6px' }}>
                    {user?.cgpa < job?.minCGPA ? `CGPA ${user?.cgpa} < ${job?.minCGPA} required` : 'Branch not eligible'}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: daysLeft <= 3 ? 'var(--red)' : 'var(--text3)', marginTop: '6px', fontWeight: daysLeft <= 3 ? 600 : 400 }}>
                  {daysLeft === 0 ? 'Closes today!' : `${daysLeft} days left`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '1rem', alignItems: 'flex-start' }}>
        {/* Left: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Job Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Salary', value: `₹ ${job?.salary} ${job?.salaryUnit}`, highlight: true },
                { label: 'Role', value: job?.role },
                { label: 'Type', value: job?.type },
                { label: 'Company', value: company?.name },
                { label: 'Website', value: company?.website },
              ].map(row => row.value && (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)' }}>{row.label}</span>
                  <span style={{ color: row.highlight ? 'var(--green)' : 'var(--text)', fontWeight: row.highlight ? 600 : 400 }}>
                    {row.label === 'Website'
                      ? <a href={row.value} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>{row.value}</a>
                      : row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {job?.description && (
            <div className="card">
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.7 }}>{job.description}</p>
            </div>
          )}

          {job?.skills?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Required Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.skills.map(s => (
                  <span key={s} className="badge" style={{ background: 'var(--surface2)', color: 'var(--text2)', fontSize: '0.78rem' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Eligibility + Drive Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Eligibility Criteria</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--bg2)', border: `1px solid ${user?.cgpa >= job?.minCGPA ? 'rgba(34,201,122,0.25)' : 'rgba(255,77,109,0.25)'}` }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '4px' }}>MINIMUM CGPA</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>{job?.minCGPA}</span>
                  <span style={{ fontSize: '0.8rem', color: user?.cgpa >= job?.minCGPA ? 'var(--green)' : 'var(--red)' }}>
                    Your CGPA: {user?.cgpa ?? '—'} {user?.cgpa >= job?.minCGPA ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--bg2)', border: `1px solid ${job?.eligibleBranches?.includes(user?.branch) ? 'rgba(34,201,122,0.25)' : 'rgba(255,77,109,0.25)'}` }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '6px' }}>ELIGIBLE BRANCHES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(job?.eligibleBranches || []).map(b => (
                    <span key={b} className="badge" style={{
                      background: b === user?.branch ? 'var(--green-dim)' : 'var(--surface2)',
                      color: b === user?.branch ? 'var(--green)' : 'var(--text3)',
                      border: b === user?.branch ? '1px solid rgba(34,201,122,0.3)' : 'none',
                    }}>{b}</span>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '6px', color: job?.eligibleBranches?.includes(user?.branch) ? 'var(--green)' : 'var(--red)' }}>
                  Your branch: {user?.branch ?? '—'} {job?.eligibleBranches?.includes(user?.branch) ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Drive Schedule</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Drive Date', value: format(driveDate, 'dd MMMM yyyy') },
                { label: 'Application Deadline', value: format(deadline, 'dd MMMM yyyy') },
                { label: 'Venue', value: drive.venue || 'TBA' },
                { label: 'Status', value: drive.status },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)' }}>{row.label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {drive.rounds?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Selection Rounds</h2>
              {drive.rounds.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.name}</div>
                    {r.description && <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{r.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
