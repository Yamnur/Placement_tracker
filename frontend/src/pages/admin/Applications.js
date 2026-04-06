import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusColor = { applied: 'badge-applied', shortlisted: 'badge-shortlisted', selected: 'badge-selected', rejected: 'badge-rejected' };

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    const [a, d] = await Promise.all([
      selectedDrive ? api.get(`/applications/drive/${selectedDrive}`) : api.get('/applications'),
      api.get('/drives'),
    ]);
    setApps(a.data); setDrives(d.data); setLoading(false);
  };

  useEffect(() => { setLoading(true); load(); }, [selectedDrive]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.patch(`/applications/${id}/status`, { status });
      setApps(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const counts = {
    applied: apps.filter(a => a.status === 'applied').length,
    shortlisted: apps.filter(a => a.status === 'shortlisted').length,
    selected: apps.filter(a => a.status === 'selected').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  const filtered = apps.filter(app => {
    const q = search.toLowerCase();
    return !q ||
      app.student?.name?.toLowerCase().includes(q) ||
      app.student?.rollNumber?.toLowerCase().includes(q) ||
      app.student?.branch?.toLowerCase().includes(q) ||
      app.drive?.job?.company?.name?.toLowerCase().includes(q) ||
      app.drive?.job?.role?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <h1>Applications</h1>
        <p>Review and update student application statuses</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {Object.entries(counts).map(([s, n]) => (
          <div key={s} className="stat-card">
            <div className="stat-label">{s}</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{n}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input className="form-control" style={{ flex: '1', minWidth: '200px', maxWidth: '320px' }} placeholder="Search student, company, role..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ maxWidth: '320px' }} value={selectedDrive} onChange={e => setSelectedDrive(e.target.value)}>
            <option value="">All drives</option>
            {drives.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
          </select>
        </div>

        {loading ? <div className="loading"><div className="spinner" />Loading...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Roll No</th><th>Branch</th><th>CGPA</th><th>Drive</th><th>Applied</th><th>Status</th><th>Update</th></tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app._id}>
                    <td data-label="Student" style={{ fontWeight: 500, color: 'var(--text)' }}>{app.student?.name}</td>
                    <td data-label="Roll No">{app.student?.rollNumber}</td>
                    <td data-label="Branch">{app.student?.branch}</td>
                    <td data-label="CGPA">{app.student?.cgpa}</td>
                    <td data-label="Drive" style={{ fontSize: '0.8rem' }}>{app.drive?.job?.company?.name} — {app.drive?.job?.role}</td>
                    <td data-label="Applied" style={{ fontSize: '0.8rem' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td data-label="Status"><span className={`badge ${statusColor[app.status]}`}>{app.status}</span></td>
                    <td data-label="Update">
                      <select
                        value={app.status}
                        disabled={updating === app._id}
                        onChange={e => updateStatus(app._id, e.target.value)}
                        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>{search ? 'No applications match your search' : 'No applications found'}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
