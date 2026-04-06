import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const empty = { name: '', description: '', website: '', industry: '', location: '', applicationLink: '' };

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/companies').then(r => setCompanies(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (c) => { setForm(c); setEditing(c._id); setModal(true); };

  const submit = async e => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/companies/${editing}`, form);
      else await api.post('/companies', form);
      toast.success(editing ? 'Company updated' : 'Company added');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const del = async id => {
    if (!window.confirm('Delete this company?')) return;
    await api.delete(`/companies/${id}`);
    toast.success('Deleted'); load();
  };

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.name?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q);
  });

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Companies</h1><p>Manage company profiles</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Company</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input className="form-control" style={{ maxWidth: '320px' }} placeholder="Search company, industry, location..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid-3">
        {filtered.map(c => (
          <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{c.name}</div>
            {c.industry && <div style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.industry}</div>}
            {c.location && <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>📍 {c.location}</div>}
            {c.applicationLink && (
              <a href={c.applicationLink} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔗 Application Link
              </a>
            )}
            {c.description && <div style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.5 }}>{c.description.slice(0, 80)}{c.description.length > 80 ? '…' : ''}</div>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => del(c._id)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-icon">🏢</div><p>{search ? 'No companies match your search' : 'No companies yet. Add one to get started.'}</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Company' : 'Add Company'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label>Company Name *</label><input className="form-control" name="name" value={form.name} onChange={handle} required /></div>
              <div className="grid-2">
                <div className="form-group"><label>Industry</label><input className="form-control" name="industry" value={form.industry} onChange={handle} /></div>
                <div className="form-group"><label>Location</label><input className="form-control" name="location" value={form.location} onChange={handle} /></div>
              </div>
              <div className="form-group"><label>Website</label><input className="form-control" name="website" value={form.website} onChange={handle} placeholder="https://..." /></div>
              <div className="form-group"><label>Application Link</label><input className="form-control" name="applicationLink" value={form.applicationLink} onChange={handle} placeholder="https://careers.company.com/apply..." /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={handle} rows={3} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
