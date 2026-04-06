import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>PlaceTrack</h1>
          <p style={{ color: 'var(--text3)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Placement Management System</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Sign in</h2>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.5rem' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text3)' }}>
            <span>New student? <Link to="/register">Create account</Link></span>
            <Link to="/forgot-password" style={{ color: 'var(--text3)' }}>Forgot password?</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text3)', fontSize: '0.78rem' }}>
          Admin? Contact your placement office for credentials.
        </p>
      </div>
    </div>
  );
}
