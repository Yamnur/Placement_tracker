import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const catColor = {
  aptitude: { bg: 'var(--accent-dim)', color: 'var(--accent2)' },
  coding: { bg: 'var(--green-dim)', color: 'var(--green)' },
  verbal: { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  technical: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  hr: { bg: 'var(--red-dim)', color: 'var(--red)' },
  general: { bg: 'var(--surface2)', color: 'var(--text2)' },
};

function TestCard({ test, onStart }) {
  const c = catColor[test.category] || catColor.general;
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: c.bg, color: c.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{test.category}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>⏱ {test.duration} min</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{test.title}</div>
      {test.description && <div style={{ fontSize: '0.8rem', color: 'var(--text3)', lineHeight: 1.5 }}>{test.description}</div>}
      <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>📝 {test.questions?.length || 0} Questions</div>
      <button className="btn btn-primary btn-sm" style={{ marginTop: 'auto' ,width:100}} onClick={() => onStart(test)}>Start Test</button>
    </div>
  );
}

function TestAttempt({ test, onFinish }) {
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSubmit = async (auto = false) => {
    if (submitted) return;
    if (!auto && !window.confirm('Submit the test?')) return;
    clearInterval(timerRef.current);
    setSubmitted(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const answersArr = test.questions.map((_, i) => answers[i] ?? -1);
    try {
      const r = await api.post(`/tests/${test._id}/submit`, { answers: answersArr, timeTaken });
      setResult(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const q = test.questions[current];
  const answered = Object.keys(answers).length;

  if (result) {
    return (
      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{result.percentage >= 70 ? '🎉' : result.percentage >= 50 ? '👍' : '📚'}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{result.percentage}%</h2>
          <p style={{ color: 'var(--text3)' }}>{result.score} / {result.total} correct</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--green-dim)', color: 'var(--green)', padding: '8px 20px', borderRadius: '20px', fontWeight: 600 }}>✓ {result.score} Correct</div>
            <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 20px', borderRadius: '20px', fontWeight: 600 }}>✗ {result.total - result.score} Wrong</div>
          </div>
        </div>

        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Review Answers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result.results.map((r, i) => (
            <div key={i} style={{ padding: '1rem', background: r.correct ? 'var(--green-dim)' : 'var(--red-dim)', borderRadius: '10px', border: `1px solid ${r.correct ? 'rgba(34,201,122,0.2)' : 'rgba(255,77,109,0.2)'}` }}>
              <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Q{i + 1}. {r.question}</div>
              <div style={{ fontSize: '0.82rem' }}>
                <div style={{ color: r.correct ? 'var(--green)' : 'var(--red)' }}>Your answer: {r.yourAnswer}</div>
                {!r.correct && <div style={{ color: 'var(--green)' }}>Correct: {r.correctAnswer}</div>}
                {r.explanation && <div style={{ color: 'var(--text3)', marginTop: '4px', fontStyle: 'italic' }}>💡 {r.explanation}</div>}
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={onFinish}>Back to Tests</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{test.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{answered}/{test.questions.length} answered</div>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: timeLeft < 60 ? 'var(--red)' : 'var(--accent2)', fontFamily: 'monospace' }}>⏱ {fmt(timeLeft)}</div>
        <button className="btn btn-danger btn-sm" onClick={() => handleSubmit(false)}>Submit</button>
      </div>

      {/* Question */}
      <div className="card">
        <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.5rem' }}>Question {current + 1} of {test.questions.length}</div>
        <div style={{ fontWeight: 500, fontSize: '1rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>{q.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setAnswers({ ...answers, [current]: i })}
              style={{
                padding: '0.75rem 1rem', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                border: answers[current] === i ? '2px solid var(--accent)' : '1px solid var(--border2)',
                background: answers[current] === i ? 'var(--accent-dim)' : 'var(--surface2)',
                color: answers[current] === i ? 'var(--accent2)' : 'var(--text2)',
                fontSize: '0.875rem', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}>
              <span style={{ fontWeight: 600, marginRight: '8px' }}>{String.fromCharCode(65 + i)}.</span> {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', gap: '0.75rem' }}>
        <button className="btn btn-outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>‹ Previous</button>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
          {test.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{
                width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                background: answers[i] !== undefined ? 'var(--accent)' : i === current ? 'var(--surface2)' : 'var(--border)',
                color: answers[i] !== undefined ? '#fff' : 'var(--text2)',
                outline: i === current ? '2px solid var(--accent2)' : 'none',
              }}>{i + 1}</button>
          ))}
        </div>
        <button className="btn btn-outline" onClick={() => setCurrent(c => Math.min(test.questions.length - 1, c + 1))} disabled={current === test.questions.length - 1}>Next ›</button>
      </div>
    </div>
  );
}

export default function StudentTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'aptitude', 'coding', 'verbal', 'technical', 'hr', 'general'];

  useEffect(() => { api.get('/tests').then(r => setTests(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  if (active) return <div><div style={{ marginBottom: '1rem' }}><button className="btn btn-outline btn-sm" onClick={() => setActive(null)}>‹ Back to Tests</button></div><TestAttempt test={active} onFinish={() => setActive(null)} /></div>;

  const filtered = filter === 'all' ? tests : tests.filter(t => t.category === filter);

  return (
    <div>
      <div className="page-header">
        <h1>🧠 Mock Tests</h1>
        <p>Practice aptitude, coding, and HR questions to prepare for placements</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} className={filter === c ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setFilter(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="empty-state card"><div className="empty-icon">🧠</div><p>No tests available in this category</p></div>
        : <div className="grid-3">{filtered.map(t => <TestCard key={t._id} test={t} onStart={setActive} />)}</div>
      }
    </div>
  );
}
