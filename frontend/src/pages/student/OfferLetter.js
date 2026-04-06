import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function OfferLetter() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [company, setCompany] = useState(user?.placedCompany || '');
  const [pkg, setPkg] = useState(user?.placedPackage || '');
  const fileRef = useRef();

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!company.trim()) { toast.error('Please enter company name first'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('offerLetter', file);
    fd.append('company', company);
    if (pkg) fd.append('package', pkg);
    try {
      const { data } = await api.post('/students/offer-letter', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ offerLetterUrl: data.offerLetterUrl, isPlaced: true, placedCompany: company, placedPackage: parseFloat(pkg) || undefined });
      toast.success('Offer letter uploaded! Congratulations! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div>
      <div className="page-header"><h1>🎉 Offer Letter</h1><p>Upload your offer letter to update your placement status</p></div>

      {user?.isPlaced && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,201,122,0.2)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1rem' }}>Placed at {user.placedCompany}</div>
            {user.placedPackage && <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '2px' }}>Package: {user.placedPackage} LPA</div>}
            {user.offerLetterUrl && (
              <a href={`${apiBase}${user.offerLetterUrl}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>View Offer Letter</a>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '520px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          {user?.isPlaced ? 'Update Offer Letter' : 'Upload Offer Letter'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Company Name *</label>
            <input className="form-control" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, TCS, Infosys" />
          </div>
          <div className="form-group">
            <label>Package (LPA)</label>
            <input className="form-control" type="number" value={pkg} onChange={e => setPkg(e.target.value)} placeholder="e.g. 8.5" step="0.1" />
          </div>
          <div className="form-group">
            <label>Offer Letter File *</label>
            <div style={{ border: '2px dashed var(--border2)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'var(--surface2)' }} onClick={() => fileRef.current?.click()}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{uploading ? 'Uploading...' : 'Click to upload PDF or image'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>PDF, JPG, PNG up to 10MB</div>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={upload} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
