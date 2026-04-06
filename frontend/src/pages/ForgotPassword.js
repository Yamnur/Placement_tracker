import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (r.data.resetLink) setResetLink(r.data.resetLink);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset link');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--accent2)', marginBottom: '6px' }}>PlaceTrack</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Forgot Password</h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.88rem', marginTop: '4px' }}>Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Reset link generated!</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>In production this would be emailed. For local dev, use the link below:</p>
            {resetLink && <Link to={resetLink.replace('http://localhost:3000', '')} className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>→ Click to Reset Password</Link>}
            <Link to="/login" style={{ display: 'block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text3)' }}>← Back to Login</Link>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label>Email Address</label><input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" /></div>
              {error && <div style={{ color: 'var(--red)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}><Link to="/login" style={{ color: 'var(--accent2)' }}>← Back to Login</Link></div>
          </div>
        )}
      </div>
    </div>
  );
}
