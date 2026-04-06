import { useState, useRef, useEffect } from 'react';
import OfferLetterSection from '../../components/student/OfferLetterSection';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'CHEM', 'OTHER'];

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cgpa: user?.cgpa || '',
    branch: user?.branch || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
    graduationYear: user?.graduationYear || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    portfolio: user?.portfolio || '',
    isPlaced: user?.isPlaced || false,
    placedCompany: user?.placedCompany || '',
    placedPackage: user?.placedPackage || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileRef = useRef();

  // Sync form whenever user data changes (after login or data refresh)
  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      cgpa: user?.cgpa || '',
      branch: user?.branch || '',
      skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
      graduationYear: user?.graduationYear || '',
      linkedin: user?.linkedin || '',
      github: user?.github || '',
      portfolio: user?.portfolio || '',
      isPlaced: user?.isPlaced || false,
      placedCompany: user?.placedCompany || '',
      placedPackage: user?.placedPackage || '',
    });
    setHasChanges(false);
  }, [user]);

  const handle = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setHasChanges(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Phone validation - 10 digits
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    
    // CGPA validation - 0 to 10
    if (form.cgpa) {
      const cgpa = parseFloat(form.cgpa);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        newErrors.cgpa = 'CGPA must be between 0 and 10';
      }
    }
    
    // Graduation year validation - 1950 to 2030
    if (form.graduationYear) {
      const year = parseInt(form.graduationYear);
      if (isNaN(year) || year < 1950 || year > 2030) {
        newErrors.graduationYear = 'Enter a valid graduation year';
      }
    }
    
    // Package validation - positive number
    if (form.placedPackage && form.isPlaced) {
      const pkg = parseFloat(form.placedPackage);
      if (isNaN(pkg) || pkg < 0) {
        newErrors.placedPackage = 'Package must be a positive number';
      }
    }
    
    // Placement company required if placed
    if (form.isPlaced && !form.placedCompany.trim()) {
      newErrors.placedCompany = 'Company name is required if placed';
    }

    return newErrors;
  };

  const saveProfile = async e => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        phone: form.phone.replace(/\D/g, ''),
      };
      const { data } = await api.put('/students/profile', payload);
      updateUser(data);
      setHasChanges(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async e => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size - max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Only PDF and Word files are allowed');
      return;
    }
    
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post('/students/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ resumeUrl: data.resumeUrl });
      toast.success('Resume uploaded successfully!');
      fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const completionFields = ['name', 'phone', 'cgpa', 'branch', 'graduationYear', 'skills'];
  const filled = completionFields.filter(f => form[f] && form[f].toString().trim()).length;
  const pct = Math.round((filled / completionFields.length) * 100);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>My Profile</h1>
            <p>Keep your profile updated to receive relevant drive notifications</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {!isEditMode && <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>✏️ Edit Profile</button>}
            {isEditMode && hasChanges && <span style={{ color: 'var(--orange)', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ Unsaved changes</span>}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Profile Card - View or Edit Mode */}
        {!isEditMode ? (
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📋 Personal Details</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Personal Info */}
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent2)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Basic Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text2)' }}>📝 Full Name</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.name || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text2)' }}>✉️ Email</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.email || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text2)' }}>📞 Phone</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.phone || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text2)' }}>🎓 Branch</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.branch || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text2)' }}>📊 CGPA</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.cgpa || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text2)' }}>📅 Graduation Year</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.graduationYear || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent2)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Skills</h3>
                {form.skills ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {form.skills.split(',').map((skill, idx) => (
                      <span key={idx} style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>—</span>
                )}
              </div>

              {/* Online Profiles */}
              {(form.linkedin || form.github || form.portfolio) && (
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent2)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>🔗 Online Profiles</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {form.linkedin && (
                      <a href={form.linkedin.startsWith('http') ? form.linkedin : `https://${form.linkedin}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.88rem', textDecoration: 'none' }}>
                        💼 LinkedIn
                      </a>
                    )}
                    {form.github && (
                      <a href={form.github.startsWith('http') ? form.github : `https://${form.github}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.88rem', textDecoration: 'none' }}>
                        💻 GitHub
                      </a>
                    )}
                    {form.portfolio && (
                      <a href={form.portfolio.startsWith('http') ? form.portfolio : `https://${form.portfolio}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.88rem', textDecoration: 'none' }}>
                        🌐 Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Placement Status */}
              {form.isPlaced && (
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent2)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>🎓 Placement Status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0.75rem', background: 'var(--green-dim)', borderRadius: '6px', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Company</span>
                      <span style={{ fontWeight: 600, color: 'var(--green)' }}>{form.placedCompany}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.5rem 0.75rem', background: 'var(--green-dim)', borderRadius: '6px', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Package</span>
                      <span style={{ fontWeight: 600, color: 'var(--green)' }}>{form.placedPackage} LPA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // EDIT MODE
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>📋 Edit Personal Details</h2>
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Basic Info */}
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handle} required />
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label>Email *</label>
                  <input className="form-control" type="email" name="email" value={form.email} onChange={handle} disabled style={{ backgroundColor: 'var(--surface2)', cursor: 'not-allowed' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.25rem' }}>Cannot be changed</p>
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input className="form-control" name="phone" type="tel" value={form.phone} onChange={handle} placeholder="10-digit number" maxLength="10" />
                  {errors.phone && <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.25rem' }}>⚠️ {errors.phone}</p>}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>CGPA *</label>
                  <input className="form-control" type="number" step="0.01" min="0" max="10" name="cgpa" value={form.cgpa} onChange={handle} placeholder="0.00 - 10.00" />
                  {errors.cgpa && <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.25rem' }}>⚠️ {errors.cgpa}</p>}
                </div>
                <div className="form-group">
                  <label>Graduation Year *</label>
                  <input className="form-control" type="number" name="graduationYear" value={form.graduationYear} onChange={handle} placeholder="2025" min="1950" max="2030" />
                  {errors.graduationYear && <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.25rem' }}>⚠️ {errors.graduationYear}</p>}
                </div>
              </div>

              <div className="form-group">
                <label>Branch *</label>
                <select className="form-control" name="branch" value={form.branch} onChange={handle}>
                  <option value="">Select branch</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Skills */}
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input className="form-control" name="skills" value={form.skills} onChange={handle} placeholder="Python, React, SQL, Communication..." />
                <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.25rem' }}>Separate skills with commas</p>
              </div>

              {/* Social Links */}
              <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text2)' }}>🔗 Online Profile (Optional)</h3>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input className="form-control" name="linkedin" value={form.linkedin} onChange={handle} placeholder="linkedin.com/in/yourprofile" />
                </div>
                <div className="form-group">
                  <label>GitHub</label>
                  <input className="form-control" name="github" value={form.github} onChange={handle} placeholder="github.com/yourprofile" />
                </div>
                <div className="form-group">
                  <label>Portfolio Website</label>
                  <input className="form-control" name="portfolio" value={form.portfolio} onChange={handle} placeholder="https://yourportfolio.com" />
                </div>
              </div>

              {/* Placement Status */}
              <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text2)' }}>🎓 Placement Status (Optional)</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    checked={form.isPlaced} 
                    onChange={e => {
                      setForm(f => ({ ...f, isPlaced: e.target.checked }));
                      setHasChanges(true);
                    }} 
                  />
                  <span>I have been placed</span>
                </label>
                {form.isPlaced && (
                  <>
                    <div className="form-group">
                      <label>Company Name *</label>
                      <input 
                        className="form-control" 
                        value={form.placedCompany} 
                        onChange={e => {
                          setForm(f => ({ ...f, placedCompany: e.target.value }));
                          setHasChanges(true);
                        }} 
                        placeholder="Company name where placed" 
                      />
                      {errors.placedCompany && <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.25rem' }}>⚠️ {errors.placedCompany}</p>}
                    </div>
                    <div className="form-group">
                      <label>Package (LPA) *</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control" 
                        value={form.placedPackage} 
                        onChange={e => {
                          setForm(f => ({ ...f, placedPackage: e.target.value }));
                          setHasChanges(true);
                        }} 
                        placeholder="e.g. 8.5" 
                      />
                      {errors.placedPackage && <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.25rem' }}>⚠️ {errors.placedPackage}</p>}
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" type="submit" disabled={saving || !hasChanges}>
                  {saving ? '💾 Saving…' : '💾 Save Changes'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => {
                  setIsEditMode(false);
                  setHasChanges(false);
                  // Reset form to current user data
                  setForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    cgpa: user?.cgpa || '',
                    branch: user?.branch || '',
                    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
                    graduationYear: user?.graduationYear || '',
                    linkedin: user?.linkedin || '',
                    github: user?.github || '',
                    portfolio: user?.portfolio || '',
                    isPlaced: user?.isPlaced || false,
                    placedCompany: user?.placedCompany || '',
                    placedPackage: user?.placedPackage || '',
                  });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Completion card */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>📊 Profile Completion</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                {pct === 100 ? '✅ Profile complete' : `${filled}/${completionFields.length} fields filled`}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: pct === 100 ? 'var(--green)' : 'var(--accent2)' }}>{pct}%</span>
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)', borderRadius: '6px', transition: 'width 0.4s ease' }} />
            </div>
            {!user?.isProfileComplete && pct < 100 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', background: 'var(--bg2)', padding: '0.5rem 0.75rem', borderRadius: '6px', margin: '0.5rem 0 0' }}>
                📝 Complete your profile to appear in eligibility checks and receive drive notifications.
              </div>
            )}
            {pct === 100 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--green)', background: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '6px', margin: '0.5rem 0 0' }}>
                ✨ Your profile is complete and visible to recruiters!
              </div>
            )}
          </div>

          {/* Resume card */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>📄 Resume</h2>
            {user?.resumeUrl ? (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid var(--green)', fontSize: '0.82rem', color: 'var(--green)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span> Resume uploaded
                </div>
                <a href={`${(process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace("/api", "")}${user.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  👁️ View Current Resume
                </a>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: 'var(--bg2)', borderRadius: '8px', border: '1px dashed var(--border2)', textAlign: 'center', marginBottom: '1rem', color: 'var(--text3)', fontSize: '0.82rem' }}>
                📄 No resume uploaded yet
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} style={{ display: 'none' }} />
            <button className="btn btn-outline" onClick={() => fileRef.current.click()} disabled={uploading} style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }}>
              {uploading ? '⏳ Uploading…' : user?.resumeUrl ? '🔄 Replace Resume' : '📤 Upload Resume'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text3)', textAlign: 'center' }}>PDF or Word, max 5MB</p>
          </div>

          {/* Account info */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>👤 Account Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: '✉️ Email', value: user?.email },
                { label: '🆔 Roll Number', value: user?.rollNumber },
                { label: '🎫 Role', value: user?.role },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)' }}>{row.label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <OfferLetterSection />
    </div>
  );
}
