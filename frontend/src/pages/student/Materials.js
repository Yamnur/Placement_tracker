import { useState, useEffect } from 'react';
import api from '../../utils/api';

const categories = ['all', 'aptitude', 'coding', 'hr', 'technical', 'resume', 'other'];

const catIcon = {
  aptitude: '🧠', coding: '💻', hr: '🤝', technical: '⚙️', resume: '📄', other: '📁'
};

const catColor = {
  aptitude: { bg: 'var(--accent-dim)', color: 'var(--accent2)' },
  coding: { bg: 'var(--green-dim)', color: 'var(--green)' },
  hr: { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  technical: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  resume: { bg: 'var(--red-dim)', color: 'var(--red)' },
  other: { bg: 'var(--surface2)', color: 'var(--text2)' },
};

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/materials').then(r => setMaterials(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter(m => {
    const matchCat = filter === 'all' || m.category === filter;
    const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const fmtSize = b => !b ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Study Materials</h1>
        <p>Resources uploaded by the placement team to help you prepare</p>
      </div>

      {/* Category quick counts */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const count = cat === 'all' ? materials.length : materials.filter(m => m.category === cat).length;
          if (cat !== 'all' && count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={filter === cat ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            >
              {cat !== 'all' && catIcon[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      <input
        className="form-control"
        style={{ maxWidth: '280px', marginBottom: '1.25rem' }}
        placeholder="Search materials..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📚</div>
          <p>No materials available in this category</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(m => {
            const c = catColor[m.category] || catColor.other;
            return (
              <div key={m._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: c.bg, color: c.color, fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {catIcon[m.category]} {m.category}
                  </span>
                  {m.fileSize && <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{fmtSize(m.fileSize)}</span>}
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.3 }}>{m.title}</div>

                {m.description && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', lineHeight: 1.5 }}>
                    {m.description.slice(0, 80)}{m.description.length > 80 ? '…' : ''}
                  </div>
                )}

                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 'auto' }}>
                  📎 {m.fileName}
                </div>

                <a
                  href={`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '')}${m.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  download={m.fileName}
                  className="btn btn-outline btn-sm"
                  style={{ justifyContent: 'center', marginTop: '0.25rem' }}
                >
                  ↓ Download
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
