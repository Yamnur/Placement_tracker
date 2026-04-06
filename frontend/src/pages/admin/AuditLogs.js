import { useState, useEffect } from 'react';
import api from '../../utils/api';

const methodColor = { GET: 'var(--accent2)', POST: 'var(--green)', PUT: 'var(--amber)', DELETE: 'var(--red)', PATCH: 'var(--purple)' };

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ action: '', entity: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50, ...filter });
      const r = await api.get(`/auditlogs?${params}`);
      setLogs(r.data.logs);
      setTotal(r.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const clearOld = async () => {
    const before = new Date();
    before.setMonth(before.getMonth() - 3);
    if (!window.confirm('Delete all logs older than 3 months?')) return;
    await api.delete(`/auditlogs/clear?before=${before.toISOString()}`);
    load();
  };

  const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>Audit Logs</h1><p>Track all actions in the system</p></div>
        <button className="btn btn-danger btn-sm" onClick={clearOld}>Clear Old Logs</button>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
          <span>Total: {total} logs</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            <span style={{ padding: '0.35rem 0.5rem' }}>Page {page}</span>
            <button className="btn btn-outline btn-sm" disabled={logs.length < 50} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
        {loading ? <div className="loading"><div className="spinner" />Loading...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Method</th><th>Path</th><th>IP</th></tr></thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)' }}>No logs found</td></tr>}
                {logs.map(l => (
                  <tr key={l._id}>
                    <td data-label="Time" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{fmt(l.createdAt)}</td>
                    <td data-label="User" style={{ fontWeight: 500, color: 'var(--text)' }}>{l.userName || '—'}</td>
                    <td data-label="Role"><span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: l.userRole === 'admin' ? 'var(--accent-dim)' : 'var(--green-dim)', color: l.userRole === 'admin' ? 'var(--accent2)' : 'var(--green)' }}>{l.userRole}</span></td>
                    <td data-label="Method"><span style={{ fontSize: '0.72rem', fontWeight: 700, color: methodColor[l.method] || 'var(--text3)' }}>{l.method}</span></td>
                    <td data-label="Path" style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{l.path}</td>
                    <td data-label="IP" style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{l.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
