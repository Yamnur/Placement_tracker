import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api.get('/students').then(r => setStudents(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (studentId, studentName) => {
    const confirmed = window.confirm(`Delete student ${studentName}? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(studentId);
    try {
      await api.delete(`/students/${studentId}`);
      setStudents(prev => prev.filter(student => student._id !== studentId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.rollNumber?.toLowerCase().includes(q);
    const matchBranch = !branchFilter || s.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  const branches = [...new Set(students.map(s => s.branch).filter(Boolean))];

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <p>{students.length} registered students</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input className="form-control" style={{ flex: '1', minWidth: '200px', maxWidth: '280px' }} placeholder="Search by name, email, roll no..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ flex: '0 1 160px', minWidth: '140px' }} value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="">All branches</option>
            {branches.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Roll No</th><th>Branch</th><th>CGPA</th><th>Email</th><th>Phone</th><th>Profile</th><th>Resume</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td data-label="Name" style={{ fontWeight: 500, color: 'var(--text)' }}>{s.name}</td>
                  <td data-label="Roll No">{s.rollNumber}</td>
                  <td data-label="Branch">{s.branch}</td>
                  <td data-label="CGPA">{s.cgpa ?? '—'}</td>
                  <td data-label="Email" style={{ fontSize: '0.82rem' }}>{s.email}</td>
                  <td data-label="Phone">{s.phone || '—'}</td>
                  <td data-label="Profile">
                    <span className={`badge ${s.isProfileComplete ? 'badge-selected' : 'badge-rejected'}`}>
                      {s.isProfileComplete ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                  <td data-label="Resume">
                    {s.resumeUrl
                      ? <a href={`http://localhost:5000${s.resumeUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)', fontSize: '0.82rem' }}>View</a>
                      : <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>—</span>}
                  </td>
                  <td data-label="Action">
                    <button
                      className="btn"
                      onClick={() => handleDelete(s._id, s.name)}
                      disabled={deletingId === s._id}
                      style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '0.45rem 0.7rem', borderRadius: '6px', cursor: deletingId === s._id ? 'not-allowed' : 'pointer' }}
                    >
                      {deletingId === s._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
