import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const difficulties = ['Easy', 'Medium', 'Hard'];
const outcomes = ['selected', 'rejected', 'pending'];
const diffColor = { Easy: 'var(--green)', Medium: 'var(--amber)', Hard: 'var(--red)' };

const emptyForm = {
  company: '', role: '', outcome: 'pending', difficulty: 'Medium',
  overallExperience: '', tips: '', isAnonymous: false,
  package: '', interviewDate: '',
  rounds: [{ name: '', description: '', difficulty: 'Medium' }],
};

export default function StudentExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [myExps, setMyExps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const [all, my] = await Promise.all([
      api.get('/experiences').catch(() => ({ data: [] })),
      api.get('/experiences/my').catch(() => ({ data: [] })),
    ]);
    setExperiences(all.data);
    setMyExps(my.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const addRound = () => setForm({ ...form, rounds: [...form.rounds, { name: '', description: '', difficulty: 'Medium' }] });
  const removeRound = (i) => setForm({ ...form, rounds: form.rounds.filter((_, j) => j !== i) });
  const updateRound = (i, field, val) => {
    const rounds = [...form.rounds];
    rounds[i] = { ...rounds[i], [field]: val };
    setForm({ ...form, rounds });
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/experiences', { ...form, package: form.package ? parseFloat(form.package) : undefined });
      toast.success('Experience submitted! Admin will review and approve it.');
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting');
    } finally { setSaving(false); }
  };

  const filtered = experiences.filter(e => {
    const matchSearch = !search || e.company?.toLowerCase().includes(search.toLowerCase()) || e.role?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || e.outcome === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>💼 Interview Experiences</h1>
          <p>Learn from peers' interview experiences and share your own</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Share Experience</button>
      </div>

      {/* My experiences */}
      {myExps.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>My Submissions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {myExps.map(e => (
              <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'var(--surface2)', borderRadius: '8px', fontSize: '0.83rem' }}>
                <span style={{ fontWeight: 500 }}>{e.company} — {e.role}</span>
                <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, background: e.isApproved ? 'var(--green-dim)' : 'var(--amber-dim)', color: e.isApproved ? 'var(--green)' : 'var(--amber)' }}>
                  {e.isApproved ? '✓ Approved' : '⏳ Pending Review'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" style={{ maxWidth: '220px' }} placeholder="Search company / role..." value={search} onChange={e => setSearch(e.target.value)} />
        {['all', 'selected', 'rejected', 'pending'].map(f => (
          <button key={f} className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Experience cards */}
      {filtered.length === 0
        ? <div className="empty-state card"><div className="empty-icon">💼</div><p>No experiences yet. Be the first to share!</p></div>
        : (
          <div className="grid-2">
            {filtered.map(e => (
              <div key={e._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{e.company}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{e.role}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: e.outcome === 'selected' ? 'var(--green)' : e.outcome === 'rejected' ? 'var(--red)' : 'var(--amber)', background: e.outcome === 'selected' ? 'var(--green-dim)' : e.outcome === 'rejected' ? 'var(--red-dim)' : 'var(--amber-dim)', padding: '2px 8px', borderRadius: '10px' }}>
                      {e.outcome === 'selected' ? '✓ Selected' : e.outcome === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: diffColor[e.difficulty] }}>{e.difficulty}</span>
                  </div>
                </div>

                {e.package && <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>💰 {e.package} LPA</div>}

                {e.rounds?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text3)', marginBottom: '4px' }}>ROUNDS</div>
                    {e.rounds.map((r, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text2)', padding: '4px 8px', background: 'var(--surface2)', borderRadius: '6px', marginBottom: '3px' }}>
                        <strong>{r.name}</strong>{r.description ? ` — ${r.description}` : ''}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                  {e.overallExperience}
                </div>

                {e.tips && (
                  <div style={{ fontSize: '0.78rem', background: 'var(--amber-dim)', color: 'var(--amber)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                    💡 <strong>Tips:</strong> {e.tips}
                  </div>
                )}

                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>By {e.student?.name} {e.student?.branch && `• ${e.student.branch}`}</span>
                  <span>{new Date(e.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Submit form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Interview Experience</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group"><label>Company *</label><input className="form-control" name="company" value={form.company} onChange={handle} required /></div>
                <div className="form-group"><label>Role *</label><input className="form-control" name="role" value={form.role} onChange={handle} required /></div>
              </div>
              <div className="grid-3">
                <div className="form-group"><label>Outcome</label>
                  <select className="form-control" name="outcome" value={form.outcome} onChange={handle}>
                    {outcomes.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Difficulty</label>
                  <select className="form-control" name="difficulty" value={form.difficulty} onChange={handle}>
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Package (LPA)</label><input className="form-control" type="number" name="package" value={form.package} onChange={handle} placeholder="e.g. 8.5" /></div>
              </div>

              {/* Rounds */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text2)', fontWeight: 500 }}>INTERVIEW ROUNDS</label>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addRound}>+ Add Round</button>
                </div>
                {form.rounds.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                    <input className="form-control" style={{ flex: '0 0 120px' }} placeholder="Round name" value={r.name} onChange={e => updateRound(i, 'name', e.target.value)} />
                    <input className="form-control" placeholder="Description" value={r.description} onChange={e => updateRound(i, 'description', e.target.value)} />
                    <select className="form-control" style={{ flex: '0 0 90px' }} value={r.difficulty} onChange={e => updateRound(i, 'difficulty', e.target.value)}>
                      {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {form.rounds.length > 1 && <button type="button" onClick={() => removeRound(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>}
                  </div>
                ))}
              </div>

              <div className="form-group"><label>Overall Experience *</label><textarea className="form-control" name="overallExperience" value={form.overallExperience} onChange={handle} rows={4} required placeholder="Describe your overall interview experience..." /></div>
              <div className="form-group"><label>Tips for Others</label><textarea className="form-control" name="tips" value={form.tips} onChange={handle} rows={2} placeholder="Any tips for students preparing for this company..." /></div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text2)', cursor: 'pointer' }}>
                <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handle} />
                Post anonymously (your name won't be shown)
              </label>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
