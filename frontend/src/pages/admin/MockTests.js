import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const categories = ['aptitude', 'coding', 'verbal', 'technical', 'hr', 'general'];
const difficulties = ['Easy', 'Medium', 'Hard'];

const emptyQ = { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 'Medium' };
const emptyTest = { title: '', description: '', category: 'aptitude', duration: 30, questions: [{ ...emptyQ, options: ['', '', '', ''] }] };

export default function AdminMockTests() {
  const [tests, setTests] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyTest);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLeaderboard, setActiveLeaderboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const load = () => api.get('/tests').then(r => setTests(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ ...emptyTest, questions: [{ ...emptyQ, options: ['', '', '', ''] }] }); setEditing(null); setModal(true); };
  const openEdit = t => { setForm(t); setEditing(t._id); setModal(true); };

  const addQ = () => setForm(f => ({ ...f, questions: [...f.questions, { ...emptyQ, options: ['', '', '', ''] }] }));
  const removeQ = i => setForm(f => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }));

  const updateQ = (qi, field, val) => {
    const qs = [...form.questions];
    qs[qi] = { ...qs[qi], [field]: val };
    setForm(f => ({ ...f, questions: qs }));
  };
  const updateOpt = (qi, oi, val) => {
    const qs = [...form.questions];
    const opts = [...qs[qi].options];
    opts[oi] = val;
    qs[qi] = { ...qs[qi], options: opts };
    setForm(f => ({ ...f, questions: qs }));
  };

  const submit = async e => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/tests/${editing}`, form);
      else await api.post('/tests', form);
      toast.success(editing ? 'Test updated' : 'Test created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const del = async id => {
    if (!window.confirm('Delete this test?')) return;
    await api.delete(`/tests/${id}`);
    toast.success('Deleted'); load();
  };

  const viewLeaderboard = async t => {
    try {
      const r = await api.get(`/tests/${t._id}/leaderboard`);
      setLeaderboard(r.data);
      setActiveLeaderboard(t);
    } catch { toast.error('Could not load leaderboard'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  // Leaderboard view
  if (activeLeaderboard) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-outline btn-sm" onClick={() => setActiveLeaderboard(null)}>← Back</button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Leaderboard: {activeLeaderboard.title}</h2>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Student</th><th>Branch</th><th>Score</th><th>Percentage</th><th>Time Taken</th></tr></thead>
            <tbody>
              {leaderboard.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: i < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : 'var(--text3)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text)' }}>{a.student?.name}</td>
                  <td>{a.student?.branch}</td>
                  <td>{a.score}/{a.total}</td>
                  <td><span style={{ color: a.percentage >= 70 ? 'var(--green)' : a.percentage >= 40 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>{a.percentage}%</span></td>
                  <td>{Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s</td>
                </tr>
              ))}
              {leaderboard.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)' }}>No attempts yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>🧠 Mock Tests</h1><p>Create and manage aptitude and technical tests</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Create Test</button>
      </div>

      {tests.length === 0
        ? <div className="empty-state card"><div className="empty-icon">🧠</div><p>No tests yet. Create one!</p></div>
        : (
          <div className="grid-3">
            {tests.map(t => (
              <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.title}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent2)', textTransform: 'uppercase' }}>{t.category}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>⏱ {t.duration} min</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>📝 {t.questions?.length} Qs</span>
                </div>
                {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{t.description}</div>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => viewLeaderboard(t)}>📊 Leaderboard</button>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(t._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: '700px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Test' : 'Create Mock Test'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group"><label>Test Title *</label><input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
                <div className="form-group"><label>Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Duration (minutes)</label><input type="number" className="form-control" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))} min={5} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>

              {/* Questions */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Questions ({form.questions.length})</label>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addQ}>+ Add Question</button>
                </div>
                {form.questions.map((q, qi) => (
                  <div key={qi} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text3)' }}>Q{qi + 1}</span>
                      {form.questions.length > 1 && <button type="button" onClick={() => removeQ(qi)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>✕</button>}
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.5rem' }}><label>Question *</label><textarea className="form-control" rows={2} value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)} required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => updateQ(qi, 'correctIndex', oi)} title="Mark as correct" />
                          <input className="form-control" value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} required />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}><label>Explanation</label><input className="form-control" value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} placeholder="Why is this the correct answer?" /></div>
                      <div className="form-group"><label>Difficulty</label>
                        <select className="form-control" value={q.difficulty} onChange={e => updateQ(qi, 'difficulty', e.target.value)}>
                          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create Test'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
