import { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';

const CURRENT_YEAR = new Date().getFullYear();

// ── Colour map per status ────────────────────────────────────────────────────
const STATUS_COLORS = {
  applied:     '#4f7cff',
  shortlisted: '#f5a623',
  selected:    '#22c97a',
  rejected:    '#ff4d6d',
};

const DEPT_COLORS = [
  '#4f7cff','#22c97a','#f5a623','#ff4d6d',
  '#a78bfa','#38bdf8','#fb923c','#34d399',
  '#f472b6','#facc15','#6ee7b7','#93c5fd',
];

// ── Donut / Pie chart ────────────────────────────────────────────────────────
function PieChart({ data, title }) {
  const size = 220, cx = 110, cy = 110, r = 85, inner = 48;
  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = total ? (d.value / total) * 2 * Math.PI : 0;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep), y2 = cy + r * Math.sin(angle + sweep);
    const xi1 = cx + inner * Math.cos(angle), yi1 = cy + inner * Math.sin(angle);
    const xi2 = cx + inner * Math.cos(angle + sweep), yi2 = cy + inner * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path = sweep === 0 ? '' :
      `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    angle += sweep;
    const color = d.color || DEPT_COLORS[i % DEPT_COLORS.length];
    return { ...d, path, color };
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{title}</h3>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width={size} height={size} style={{ flexShrink: 0 }}>
          {total === 0
            ? <circle cx={cx} cy={cy} r={r} fill="var(--surface2)" />
            : slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.92} />)
          }
          <circle cx={cx} cy={cy} r={inner - 2} fill="var(--surface)" />
          <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text3)" fontSize="11">Total</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: '130px' }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text2)', flex: 1 }}>{s.label}</span>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.value}</span>
              <span style={{ color: 'var(--text3)' }}>({total ? Math.round(s.value / total * 100) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Grouped Bar Chart (like the campus visits image) ─────────────────────────
function GroupedBarChart({ data, title, year }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>
        <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '3rem', fontSize: '0.88rem' }}>
          No placement data for {year}
        </div>
      </div>
    );
  }

  const statuses = ['applied', 'shortlisted', 'selected', 'rejected'];
  const maxVal = Math.max(...data.flatMap(d => statuses.map(s => d[s] || 0)), 1);

  const BAR_W = 12;
  const GROUP_GAP = 28;
  const BAR_GAP = 2;
  const groupWidth = statuses.length * (BAR_W + BAR_GAP) + GROUP_GAP;
  const chartH = 180;
  const leftPad = 36;
  const topPad = 16;
  const bottomPad = 48;
  const totalW = leftPad + data.length * groupWidth + 16;
  const svgH = chartH + topPad + bottomPad;

  // Y gridlines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: topPad + chartH - f * chartH,
    label: Math.round(f * maxVal),
  }));

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{title}</h3>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text2)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: STATUS_COLORS[s] }} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={Math.max(totalW, 400)} height={svgH} style={{ display: 'block' }}>
          {/* Grid lines */}
          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={leftPad} y1={g.y} x2={totalW} y2={g.y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
              <text x={leftPad - 4} y={g.y + 4} textAnchor="end" fill="var(--text3)" fontSize="10">{g.label}</text>
            </g>
          ))}

          {/* Bars */}
          {data.map((dept, di) => {
            const groupX = leftPad + di * groupWidth + GROUP_GAP / 2;
            return (
              <g key={di}>
                {statuses.map((s, si) => {
                  const val = dept[s] || 0;
                  const barH = (val / maxVal) * chartH;
                  const x = groupX + si * (BAR_W + BAR_GAP);
                  const y = topPad + chartH - barH;
                  return (
                    <g key={si}>
                      <rect x={x} y={y} width={BAR_W} height={barH}
                        fill={STATUS_COLORS[s]} rx="2" opacity={0.88} />
                      {val > 0 && barH > 14 && (
                        <text x={x + BAR_W / 2} y={y + 11} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600">{val}</text>
                      )}
                    </g>
                  );
                })}
                {/* Department label */}
                <text
                  x={groupX + (statuses.length * (BAR_W + BAR_GAP)) / 2}
                  y={topPad + chartH + 16}
                  textAnchor="middle" fill="var(--text2)" fontSize="11" fontWeight="500"
                >{dept.branch}</text>
              </g>
            );
          })}

          {/* X axis line */}
          <line x1={leftPad} y1={topPad + chartH} x2={totalW} y2={topPad + chartH} stroke="var(--border2)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

// ── Horizontal bar chart (for top companies) ─────────────────────────────────
function HBarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="card">
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>{title}</h3>
      {data.length === 0
        ? <div style={{ color: 'var(--text3)', fontSize: '0.82rem', textAlign: 'center', padding: '2rem' }}>No data yet</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {data.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '100px', fontSize: '0.78rem', color: 'var(--text2)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.label}>{d.label}</div>
                <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: '6px', height: '26px', overflow: 'hidden' }}>
                  <div style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? '4px' : '0', height: '100%', background: DEPT_COLORS[i % DEPT_COLORS.length], borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '8px', transition: 'width 0.4s' }}>
                    {d.value > 0 && <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>{d.value}</span>}
                  </div>
                </div>
                <div style={{ width: '28px', fontSize: '0.78rem', color: 'var(--text3)', textAlign: 'right' }}>{d.value}</div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── Main analytics view ───────────────────────────────────────────────────────
export default function AnalyticsView({ isStudent = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [inputYear, setInputYear] = useState(String(CURRENT_YEAR));
  const [error, setError] = useState('');

  const fetchData = useCallback((yr) => {
    setLoading(true);
    setError('');
    api.get(`/analytics?year=${yr}`)
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(year); }, [year, fetchData]);

  const handleYearSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(inputYear);
    if (!parsed || parsed < 2000 || parsed > 2100) {
      setError('Please enter a valid year (e.g. 2025)');
      return;
    }
    setYear(parsed);
  };

  const statusWithColors = data?.statusBreakdown?.map(s => ({
    ...s,
    color: STATUS_COLORS[s.label.toLowerCase()] || '#4f7cff',
  }));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Placement Analytics</h1>
          <p>{isStudent ? 'Overall placement statistics for your batch' : 'Visual breakdown of placements by status, department & year'}</p>
        </div>

        {/* Year selector */}
        <form onSubmit={handleYearSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>View year:</div>
          <input
            type="number"
            value={inputYear}
            onChange={e => setInputYear(e.target.value)}
            style={{
              width: '90px', padding: '0.45rem 0.6rem', borderRadius: '8px',
              background: 'var(--surface)', border: '1px solid var(--border2)',
              color: 'var(--text)', fontSize: '0.88rem', outline: 'none',
            }}
            placeholder="Year"
            min="2000" max="2100"
          />
          <button type="submit" className="btn btn-primary btn-sm">Go</button>
          {year !== CURRENT_YEAR && (
            <button type="button" className="btn btn-outline btn-sm"
              onClick={() => { setYear(CURRENT_YEAR); setInputYear(String(CURRENT_YEAR)); }}>
              Current
            </button>
          )}
        </form>
      </div>

      {error && <div style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

      {/* Year badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ background: 'var(--accent-dim)', color: 'var(--accent2)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.82rem', fontWeight: 600 }}>
          {year === CURRENT_YEAR ? `${year} (Current Year)` : `Year: ${year}`}
        </span>
        {data?.availableYears?.length > 0 && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
            Data available: {data.availableYears.join(', ')}
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading analytics…</div>
      ) : !data ? null : (
        <>
          {/* Summary stat cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Students', value: data.summary.totalStudents, icon: '👥', color: 'var(--purple)' },
              { label: 'Placed Students', value: data.summary.placedCount, icon: '✅', color: 'var(--green)' },
              { label: 'Placement Rate', value: `${data.summary.placementRate}%`, icon: '📈', color: 'var(--accent2)' },
              { label: 'Total Applications', value: data.summary.totalApplications, icon: '📋', color: 'var(--amber)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.icon} {s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Grouped bar chart — department wise (shown to everyone) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <GroupedBarChart
              data={data.deptGrouped}
              title={`🏛️ Department-wise Placement Status — ${year}`}
              year={year}
            />
          </div>

          {/* Pie charts — admin sees both, student sees both too */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <PieChart data={data.placementPie} title="🎓 Placed vs Not Placed" />
            <PieChart data={statusWithColors || []} title="📋 Application Status Breakdown" />
          </div>

          {/* Top companies */}
          <HBarChart data={data.topCompanies} title="🏢 Top Companies by Placements" />
        </>
      )}
    </div>
  );
}
