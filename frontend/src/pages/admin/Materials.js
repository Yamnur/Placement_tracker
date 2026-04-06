import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const categories = ['aptitude', 'coding', 'hr', 'technical', 'resume', 'other'];

export default function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  const load = () => api.get('/materials').then(r => setMaterials(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category', form.category);
    try {
      await api.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Material uploaded');
      setModal(false); setFile(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete this material?')) return;
    await api.delete(`/materials/${id}`);
    toast.success('Deleted'); load();
  };

  const catColor = { aptitude: 'badge-applied', coding: 'badge-shortlisted', hr: 'badge-selected', technical: 'badge-upcoming', resume: 'badge-shortlisted', other: 'badge-completed' };
  const fmtSize = b => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Study Materials</h1><p>Upload resources for students</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Upload Material</button>
      </div>

      <div className="grid-3">
        {materials.map(m => (
          <div key={m._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className={`badge ${catColor[m.category]}`}>{m.category}</span>
              <button className="btn btn-danger btn-sm" onClick={() => del(m._id)}>Del</button>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>{m.title}</div>
            {m.description && <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{m.description}</div>}
            <div style={{ fontSize: '0.76rem', color: 'var(--text3)', marginTop: 'auto' }}>
              {m.fileName} {m.fileSize && `· ${fmtSize(m.fileSize)}`}
            </div>
            <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
              ↓ Download
            </a>
          </div>
        ))}
        {materials.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-icon">📚</div><p>No materials uploaded yet</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Study Material</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label>Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="form-group">
                <label>File (PDF, Word, PPT, ZIP)</label>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                <button type="button" className="btn btn-outline" onClick={() => fileRef.current.click()}>
                  {file ? `✓ ${file.name}` : 'Choose file'}
                </button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
