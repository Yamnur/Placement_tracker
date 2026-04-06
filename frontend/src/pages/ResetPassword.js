import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--accent2)', marginBottom: '6px' }}>PlaceTrack</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Reset Password</h2>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <div style={{ fontWeight: 600 }}>Password reset successfully!</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text3)', marginTop: '0.5rem' }}>Redirecting to login...</div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!token && <div style={{ color: 'var(--red)', fontSize: '0.85rem', textAlign: 'center' }}>Invalid reset link. Please request a new one.</div>}
              <div className="form-group"><label>New Password</label><input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" /></div>
              <div className="form-group"><label>Confirm Password</label><input className="form-control" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat new password" /></div>
              <button type="submit" className="btn btn-primary" disabled={loading || !token} style={{ justifyContent: 'center' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
              <div style={{ textAlign: 'center', fontSize: '0.85rem' }}><Link to="/login" style={{ color: 'var(--accent2)' }}>← Back to Login</Link></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
