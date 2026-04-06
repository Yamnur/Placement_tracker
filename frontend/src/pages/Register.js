import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'CHEM', 'OTHER'];

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '', branch: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role: 'student' });
      toast.success('Account created! Complete your profile to start applying.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>PlaceTrack</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Create your student account</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Register</h2>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" name="name" placeholder="Rahul Sharma" value={form.name} onChange={handle} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Roll Number</label>
                <input className="form-control" name="rollNumber" placeholder="20CS001" value={form.rollNumber} onChange={handle} required />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <select className="form-control" name="branch" value={form.branch} onChange={handle} required>
                  <option value="">Select</option>
                  {branches.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>College Email</label>
              <input className="form-control" type="email" name="email" placeholder="roll@college.edu" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handle} minLength={6} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.5rem' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text3)', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
