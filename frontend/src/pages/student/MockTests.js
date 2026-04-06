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

export default function StudentMockTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/tests').then(r => setTests(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeTest) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeTest]);

  const startTest = async (test) => {
    try {
      const r = await api.get(`/tests/${test._id}`);
      setTestData(r.data);
      setAnswers(new Array(r.data.questions.length).fill(-1));
      setCurrent(0);
      setResult(null);
      setActiveTest(test);
      setTimeLeft(test.duration * 60);
      setStartTime(Date.now());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot start test');
    }
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    if (!auto && !window.confirm('Submit the test? You cannot change answers after submitting.')) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const r = await api.post(`/tests/${activeTest._id}/submit`, { answers, timeTaken });
      setResult(r.data);
      setActiveTest(null);
      setTestData(null);
      api.get('/tests').then(res => setTests(res.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  if (result) {
    const pct = result.percentage;
    const color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)';
    return (
      <div>
        <div className="page-header"><h1>🎯 Test Result</h1></div>
        <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{pct}%</div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text2)', marginTop: '0.5rem' }}>{result.score} / {result.total} correct</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text3)', marginTop: '4px' }}>{pct >= 70 ? '🎉 Excellent!' : pct >= 40 ? '👍 Good effort!' : '💪 Keep practicing!'}</div>
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Detailed Results</h3>
          {result.results.map((r, i) => (
            <div key={i} style={{ padding: '0.85rem', background: r.correct ? 'var(--green-dim)' : 'var(--red-dim)', borderRadius: '10px', marginBottom: '0.6rem', borderLeft: `3px solid ${r.correct ? 'var(--green)' : 'var(--red)'}` }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>Q{i + 1}. {r.question}</div>
              <div style={{ fontSize: '0.8rem', color: r.correct ? 'var(--green)' : 'var(--red)' }}>Your answer: {r.yourAnswer}</div>
              {!r.correct && <div style={{ fontSize: '0.8rem', color: 'var(--green)' }}>Correct: {r.correctAnswer}</div>}
              {r.explanation && <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '4px', fontStyle: 'italic' }}>💡 {r.explanation}</div>}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={() => setResult(null)}>Back to Tests</button>
        </div>
      </div>
    );
  }

  if (activeTest && testData) {
    const q = testData.questions[current];
    const answered = answers.filter(a => a !== -1).length;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem' }}>{testData.title}</h1>
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{answered}/{testData.questions.length} answered</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: timeLeft < 60 ? 'var(--red)' : 'var(--text)' }}>⏱ {fmt(timeLeft)}</div>
            <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>Submit Test</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1.5rem' }}>
          {testData.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, background: i === current ? 'var(--accent)' : answers[i] !== -1 ? 'var(--green)' : 'var(--surface2)', color: i === current || answers[i] !== -1 ? '#fff' : 'var(--text2)' }}>{i + 1}</button>
          ))}
        </div>
        <div className="card" style={{ maxWidth: '700px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Question {current + 1} of {testData.questions.length}</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => { const a = [...answers]; a[current] = oi; setAnswers(a); }} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: `2px solid ${answers[current] === oi ? 'var(--accent)' : 'var(--border2)'}`, background: answers[current] === oi ? 'var(--accent-dim)' : 'var(--surface2)', color: answers[current] === oi ? 'var(--accent2)' : 'var(--text2)', cursor: 'pointer', textAlign: 'left', fontSize: '0.88rem', fontWeight: answers[current] === oi ? 600 : 400 }}>
                <span style={{ fontWeight: 700, marginRight: '8px' }}>{String.fromCharCode(65 + oi)}.</span>{opt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="btn btn-outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>‹ Prev</button>
            {current < testData.questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next ›</button>
              : <button className="btn btn-success" onClick={() => handleSubmit(false)}>Submit ✓</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h1>🎯 Mock Tests</h1><p>Practice aptitude, coding, verbal and technical tests</p></div>
      {tests.length === 0
        ? <div className="empty-state card"><div className="empty-icon">📝</div><p>No tests available yet.</p></div>
        : <div className="grid-3">{tests.map(t => { const c = catColor[t.category] || catColor.general; return (
            <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px' }}>{t.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>⏱ {t.duration} min</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.title}</div>
              {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{t.description}</div>}
              <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>📝 {t.questions?.length || 0} questions</div>
              <button className="btn btn-primary btn-sm" style={{ justifyContent: 'center', marginTop: 'auto' }} onClick={() => startTest(t)}>Start Test →</button>
            </div>);
          })}</div>}
    </div>
  );
}
