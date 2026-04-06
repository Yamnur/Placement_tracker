import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'CHEM', 'OTHER'];
const empty = { title: '', company: '', role: '', salary: '', type: 'Full-time', minCGPA: '', eligibleBranches: [], description: '', skills: '' };

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [j, c] = await Promise.all([api.get('/jobs'), api.get('/companies')]);
    setJobs(j.data); setCompanies(c.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleBranch = b => {
    const arr = form.eligibleBranches.includes(b) ? form.eligibleBranches.filter(x => x !== b) : [...form.eligibleBranches, b];
    setForm({ ...form, eligibleBranches: arr });
  };

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (j) => {
    setForm({ ...j, company: j.company?._id || j.company, skills: (j.skills || []).join(', ') });
    setEditing(j._id); setModal(true);
  };

  const submit = async e => {
    e.preventDefault();
    const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      if (editing) await api.put(`/jobs/${editing}`, payload);
      else await api.post('/jobs', payload);
      toast.success(editing ? 'Job updated' : 'Job created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const del = async id => {
    if (!window.confirm('Delete this job?')) return;
    await api.delete(`/jobs/${id}`);
    toast.success('Deleted'); load();
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Jobs</h1><p>Define roles and eligibility criteria</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Create Job</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Job Title</th><th>Company</th><th>Role</th><th>Salary</th><th>Min CGPA</th><th>Eligible Branches</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j._id}>
                  <td data-label="Job Title" style={{ color: 'var(--text)', fontWeight: 500 }}>{j.title}</td>
                  <td data-label="Company">{j.company?.name}</td>
                  <td data-label="Role">{j.role}</td>
                  <td data-label="Salary" style={{ color: 'var(--green)' }}>{j.salary} {j.salaryUnit}</td>
                  <td data-label="Min CGPA"><span className="badge badge-applied">{j.minCGPA}</span></td>
                  <td data-label="Eligible Branches" style={{ maxWidth: '180px' }}>{(j.eligibleBranches || []).join(', ')}</td>
                  <td data-label="Type">{j.type}</td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(j)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(j._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>No jobs yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Job' : 'Create Job'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group"><label>Job Title *</label><input className="form-control" name="title" value={form.title} onChange={handle} required /></div>
                <div className="form-group">
                  <label>Company *</label>
                  <select className="form-control" name="company" value={form.company} onChange={handle} required>
                    <option value="">Select company</option>
                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Role *</label><input className="form-control" name="role" value={form.role} onChange={handle} required /></div>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" name="type" value={form.type} onChange={handle}>
                    <option>Full-time</option><option>Internship</option><option>Contract</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Salary (LPA) *</label><input className="form-control" type="number" name="salary" value={form.salary} onChange={handle} required /></div>
                <div className="form-group"><label>Min CGPA *</label><input className="form-control" type="number" step="0.1" min="0" max="10" name="minCGPA" value={form.minCGPA} onChange={handle} required /></div>
              </div>
              <div className="form-group">
                <label>Eligible Branches *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {branches.map(b => (
                    <button key={b} type="button" onClick={() => toggleBranch(b)}
                      style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid', fontSize: '0.78rem', cursor: 'pointer',
                        background: form.eligibleBranches.includes(b) ? 'var(--accent)' : 'var(--surface2)',
                        color: form.eligibleBranches.includes(b) ? '#fff' : 'var(--text2)',
                        borderColor: form.eligibleBranches.includes(b) ? 'var(--accent)' : 'var(--border)' }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Skills (comma-separated)</label><input className="form-control" name="skills" value={form.skills} onChange={handle} placeholder="React, Node.js, SQL" /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={handle} rows={3} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
