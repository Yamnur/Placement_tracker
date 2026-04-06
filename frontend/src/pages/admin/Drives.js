import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const empty = { title: '', job: '', driveDate: '', deadline: '', venue: '', status: 'upcoming' };

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(null);

  const load = async () => {
    const [d, j] = await Promise.all([api.get('/drives'), api.get('/jobs')]);
    setDrives(d.data); setJobs(j.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = d => {
    setForm({ ...d, job: d.job?._id || d.job, driveDate: d.driveDate?.slice(0, 10), deadline: d.deadline?.slice(0, 10) });
    setEditing(d._id); setModal(true);
  };

  const submit = async e => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/drives/${editing}`, form);
      else await api.post('/drives', form);
      toast.success(editing ? 'Drive updated' : 'Drive created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const notify = async (id) => {
    setNotifying(id);
    try {
      const { data } = await api.post(`/drives/${id}/notify`);
      toast.success(`Sent to ${data.count} eligible students`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setNotifying(null); }
  };

  const del = async id => {
    if (!window.confirm('Delete this drive?')) return;
    await api.delete(`/drives/${id}`);
    toast.success('Deleted'); load();
  };

  const statusBadge = { upcoming: 'badge-upcoming', active: 'badge-active', completed: 'badge-completed', cancelled: 'badge-rejected' };

  const filtered = drives.filter(d => {
    const q = search.toLowerCase();
    return !q ||
      d.title?.toLowerCase().includes(q) ||
      d.job?.company?.name?.toLowerCase().includes(q) ||
      d.job?.role?.toLowerCase().includes(q) ||
      d.venue?.toLowerCase().includes(q);
  });

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Placement Drives</h1><p>Schedule drives and notify eligible students</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Create Drive</button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <input className="form-control" style={{ maxWidth: '320px' }} placeholder="Search drive, company, role, venue..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Drive</th><th>Job / Company</th><th>Drive Date</th><th>Deadline</th><th>Status</th><th>Notified</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id}>
                  <td data-label="Drive" style={{ color: 'var(--text)', fontWeight: 500 }}>{d.title}</td>
                  <td data-label="Job / Company">{d.job?.company?.name} — {d.job?.role}</td>
                  <td data-label="Drive Date">{d.driveDate ? format(new Date(d.driveDate), 'dd MMM yyyy') : '—'}</td>
                  <td data-label="Deadline">{d.deadline ? format(new Date(d.deadline), 'dd MMM yyyy') : '—'}</td>
                  <td data-label="Status"><span className={`badge ${statusBadge[d.status] || ''}`}>{d.status}</span></td>
                  <td data-label="Notified">
                    {d.notificationSent
                      ? <span style={{ color: 'var(--green)', fontSize: '0.8rem' }}>✓ Sent</span>
                      : <button className="btn btn-outline btn-sm" onClick={() => notify(d._id)} disabled={notifying === d._id}>
                          {notifying === d._id ? '...' : '🔔 Notify'}
                        </button>}
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(d._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>{search ? 'No drives match your search' : 'No drives yet'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Drive' : 'Create Drive'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label>Drive Title *</label><input className="form-control" name="title" value={form.title} onChange={handle} required placeholder="e.g. Infosys Campus Drive 2024" /></div>
              <div className="form-group">
                <label>Job *</label>
                <select className="form-control" name="job" value={form.job} onChange={handle} required>
                  <option value="">Select a job</option>
                  {jobs.map(j => <option key={j._id} value={j._id}>{j.company?.name} — {j.role}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Drive Date *</label><input className="form-control" type="date" name="driveDate" value={form.driveDate} onChange={handle} required /></div>
                <div className="form-group"><label>Application Deadline *</label><input className="form-control" type="date" name="deadline" value={form.deadline} onChange={handle} required /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Venue</label><input className="form-control" name="venue" value={form.venue} onChange={handle} /></div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" name="status" value={form.status} onChange={handle}>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
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
