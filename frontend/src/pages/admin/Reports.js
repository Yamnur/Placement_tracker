import { useState } from 'react';

const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

function downloadCSV(path, filename) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = user?.token || '';
  fetch(`${BASE}/api${path}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    });
}

export default function AdminReports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState('');

  const reports = [
    { title: 'Placement Report', desc: 'Applications with student details, company, role, package, status', icon: '📊', color: 'var(--accent)', action: () => downloadCSV(`/reports/placements?year=${year}&status=${status}`, 'placement-report.csv') },
    { title: 'Students Report', desc: 'All students with branch, CGPA, placement status, and skills', icon: '👥', color: 'var(--green)', action: () => downloadCSV('/reports/students', 'students-report.csv') },
    { title: 'Drives Report', desc: 'All drives with company, package, eligible branches, and status', icon: '🚀', color: 'var(--amber)', action: () => downloadCSV('/reports/drives', 'drives-report.csv') },
  ];

  return (
    <div>
      <div className="page-header"><h1>Export Reports</h1><p>Download placement data as CSV files</p></div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Filters (Placement Report)</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group"><label>Graduation Year</label><input className="form-control" type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: '120px' }} /></div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '160px' }}>
              <option value="">All</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid-3">
        {reports.map((r, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '2rem' }}>{r.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.5, flex: 1 }}>{r.desc}</div>
            <button className="btn btn-primary btn-sm" onClick={r.action} style={{ background: r.color }}>↓ Download CSV</button>
          </div>
        ))}
      </div>
    </div>
  );
}
