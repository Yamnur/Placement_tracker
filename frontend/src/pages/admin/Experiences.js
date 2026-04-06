import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = () => api.get('/experiences/all').then(r => setExperiences(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const approve = async (id, isApproved) => {
    await api.patch(`/experiences/${id}/approve`, { isApproved });
    toast.success(isApproved ? 'Approved' : 'Revoked');
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    await api.delete(`/experiences/${id}`);
    toast.success('Deleted'); load();
  };

  const filtered = filter === 'all' ? experiences : filter === 'pending' ? experiences.filter(e => !e.isApproved) : experiences.filter(e => e.isApproved);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header"><h1>Interview Experiences</h1><p>Review and approve student interview experiences</p></div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['pending', 'approved', 'all'].map(f => (
          <button key={f} className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0
        ? <div className="empty-state card"><div className="empty-icon">💼</div><p>No experiences in this category</p></div>
        : (
          <div className="grid-2">
            {filtered.map(e => (
              <div key={e._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{e.company} — {e.role}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>By: {e.isAnonymous ? 'Anonymous' : e.student?.name} ({e.student?.branch})</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: e.isApproved ? 'var(--green-dim)' : 'var(--amber-dim)', color: e.isApproved ? 'var(--green)' : 'var(--amber)', height: 'fit-content' }}>
                    {e.isApproved ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5 }}>{e.overallExperience?.slice(0, 150)}{e.overallExperience?.length > 150 ? '...' : ''}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!e.isApproved && <button className="btn btn-success btn-sm" onClick={() => approve(e._id, true)}>✓ Approve</button>}
                  {e.isApproved && <button className="btn btn-outline btn-sm" onClick={() => approve(e._id, false)}>Revoke</button>}
                  <button className="btn btn-danger btn-sm" onClick={() => del(e._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
