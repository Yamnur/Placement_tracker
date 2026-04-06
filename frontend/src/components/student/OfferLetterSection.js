import { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function OfferLetterSection() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ company: user?.placedCompany || '', package: user?.placedPackage || '' });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('offerLetter', file);
    fd.append('company', form.company);
    fd.append('package', form.package);
    try {
      const { data } = await api.post('/students/offer-letter', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ offerLetterUrl: data.offerLetterUrl, isPlaced: true, placedCompany: form.company, placedPackage: parseFloat(form.package) });
      toast.success('Offer letter uploaded! Congratulations! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🎉 Offer Letter</h3>

      {user?.isPlaced && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--green-dim)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--green)', fontWeight: 500 }}>
          ✓ You are marked as placed at <strong>{user.placedCompany || 'a company'}</strong>
          {user.placedPackage && ` — ${user.placedPackage} LPA`}
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Company Name</label>
          <input className="form-control" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. TCS, Infosys..." />
        </div>
        <div className="form-group">
          <label>Package (LPA)</label>
          <input className="form-control" type="number" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} placeholder="e.g. 8.5" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '0.55rem 1.2rem', borderRadius: 'var(--radius)',
          background: 'var(--accent)', color: '#fff', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: 500,
        }}>
          {uploading ? 'Uploading...' : '📎 Upload Offer Letter'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
        {user?.offerLetterUrl && (
          <a href={`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.offerLetterUrl}`}
            target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            View Uploaded Letter
          </a>
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.5rem' }}>Accepted: PDF, JPG, PNG (max 10MB)</div>
    </div>
  );
}
