import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function StudentCompanies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/companies')
      .then(r => setCompanies(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.name?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q);
  });

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Companies</h1>
        <p>Explore companies hiring on campus</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          className="form-control"
          style={{ maxWidth: '320px' }}
          placeholder="Search company, industry, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid-3">
        {filtered.map(c => (
          <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
              {c.name}
            </div>
            
            {c.industry && (
              <div style={{ fontSize: '0.78rem', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {c.industry}
              </div>
            )}

            {c.location && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                📍 {c.location}
              </div>
            )}

            {c.description && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
                {c.description.slice(0, 120)}{c.description.length > 120 ? '…' : ''}
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {c.website && (
                <a
                  href={c.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flex: '1', minWidth: '100px', textAlign: 'center', textDecoration: 'none' }}
                >
                  🌐 Website
                </a>
              )}
              {c.applicationLink && (
                <a
                  href={c.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ flex: '1', minWidth: '100px', textAlign: 'center', textDecoration: 'none' }}
                >
                  🔗 Apply
                </a>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">🏢</div>
            <p>{search ? 'No companies match your search' : 'No companies found'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
