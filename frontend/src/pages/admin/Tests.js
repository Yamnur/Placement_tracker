import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const categories = ['aptitude', 'coding', 'verbal', 'technical', 'hr', 'general'];
const difficulties = ['Easy', 'Medium', 'Hard'];

const emptyQ = { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 'Medium' };
const emptyTest = { title: '', description: '', category: 'aptitude', duration: 30, questions: [{ ...emptyQ, options: ['', '', '', ''] }] };

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyTest);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);
  const [lbTest, setLbTest] = useState(null);

  const load = () => api.get('/tests').then(r => setTests(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(JSON.parse(JSON.stringify(emptyTest))); setEditing(null); setModal(true); };
  const openEdit = (t) => {
    const f = { ...t, questions: t.questions?.map(q => ({ ...q, options: [...(q.options || ['','','',''])] })) || [] };
    setForm(f); setEditing(t._id); setModal(true);
  };

  const addQuestion = () => setForm({ ...form, questions: [...form.questions, JSON.parse(JSON.stringify(emptyQ))] });
  const removeQ = (i) => setForm({ ...form, questions: form.questions.filter((_, j) => j !== i) });
  const updateQ = (i, field, val) => {
    const qs = JSON.parse(JSON.stringify(form.questions));
    qs[i][field] = val;
    setForm({ ...form, questions: qs });
  };
  const updateOpt = (qi, oi, val) => {
    const qs = JSON.parse(JSON.stringify(form.questions));
    qs[qi].options[oi] = val;
    setForm({ ...form, questions: qs });
  };

  const submit = async e => {
    e.preventDefault();
    for (const q of form.questions) {
      if (!q.question.trim()) { toast.error('All questions must have text'); return; }
      if (q.options.some(o => !o.trim())) { toast.error('All options must be filled'); return; }
    }
    setSaving(true);
    try {
      if (editing) await api.put(`/tests/${editing}`, form);
      else await api.post('/tests', form);
      toast.success(editing ? 'Test updated' : 'Test created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    await api.delete(`/tests/${id}`);
    toast.success('Deleted'); load();
  };

  const showLeaderboard = async (test) => {
    try {
      const r = await api.get(`/tests/${test._id}/leaderboard`);
      setLeaderboard(r.data); setLbTest(test);
    } catch { toast.error('Failed to load leaderboard'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Mock Tests</h1><p>Create and manage aptitude, coding, and HR tests</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Create Test</button>
      </div>

      {tests.length === 0
        ? <div className="empty-state card"><div className="empty-icon">🧠</div><p>No tests yet. Create one to get started.</p></div>
        : (
          <div className="grid-3">
            {tests.map(t => (
              <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase' }}>{t.category} • {t.duration} min • {t.questions?.length || 0} questions</div>
                {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{t.description.slice(0, 60)}...</div>}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => showLeaderboard(t)}>🏆 Board</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(t._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Leaderboard modal */}
      {lbTest && (
        <div className="modal-overlay" onClick={() => { setLbTest(null); setLeaderboard(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏆 Leaderboard — {lbTest.title}</h2>
              <button className="modal-close" onClick={() => { setLbTest(null); setLeaderboard(null); }}>✕</button>
            </div>
            {!leaderboard || leaderboard.length === 0
              ? <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '2rem' }}>No attempts yet</div>
              : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>#</th><th>Student</th><th>Branch</th><th>Score</th><th>%</th><th>Time</th></tr></thead>
                    <tbody>
                      {leaderboard.map((a, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: i < 3 ? 'var(--amber)' : 'var(--text3)' }}>{i + 1}</td>
                          <td style={{ color: 'var(--text)', fontWeight: 500 }}>{a.student?.name}</td>
                          <td>{a.student?.branch}</td>
                          <td>{a.score}/{a.total}</td>
                          <td><span style={{ color: a.percentage >= 70 ? 'var(--green)' : a.percentage >= 50 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>{a.percentage}%</span></td>
                          <td>{Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: '800px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Test' : 'Create Test'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group"><label>Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                <div className="form-group"><label>Duration (minutes) *</label><input className="form-control" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} required min={5} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Description</label><input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              </div>

              {/* Questions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 600, color: 'var(--text2)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions ({form.questions.length})</label>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addQuestion}>+ Add Question</button>
                </div>
                {form.questions.map((q, qi) => (
                  <div key={qi} style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent2)' }}>Q{qi + 1}</span>
                      {form.questions.length > 1 && <button type="button" onClick={() => removeQ(qi)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>✕ Remove</button>}
                    </div>
                    <input className="form-control" style={{ marginBottom: '0.5rem' }} placeholder="Question text *" value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)} required />
                    <div className="grid-2" style={{ marginBottom: '0.5rem' }}>
                      {q.options.map((opt, oi) => (
                        <input key={oi} className="form-control" placeholder={`Option ${String.fromCharCode(65 + oi)} *`} value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} required />
                      ))}
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label>Correct Answer</label>
                        <select className="form-control" value={q.correctIndex} onChange={e => updateQ(qi, 'correctIndex', parseInt(e.target.value))}>
                          {q.options.map((_, oi) => <option key={oi} value={oi}>Option {String.fromCharCode(65 + oi)}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Difficulty</label>
                        <select className="form-control" value={q.difficulty} onChange={e => updateQ(qi, 'difficulty', e.target.value)}>
                          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <input className="form-control" placeholder="Explanation (optional)" value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
