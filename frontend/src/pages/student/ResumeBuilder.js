import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

// ── Templates ──────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'classic',  label: 'Classic',  desc: 'Clean & professional',   accent: '#2c3e50' },
  { id: 'modern',   label: 'Modern',   desc: 'Blue sidebar layout',    accent: '#1a73e8' },
  { id: 'minimal',  label: 'Minimal',  desc: 'Simple & elegant',       accent: '#333'    },
  { id: 'executive',label: 'Executive',desc: 'Bold & impactful',       accent: '#7b2d8b' },
];

const defaultData = {
  name: '', email: '', phone: '', location: '', linkedin: '', github: '',
  objective: '',
  education: [{ institution: '', degree: '', field: '', year: '', cgpa: '' }],
  skills: { technical: '', soft: '', tools: '' },
  projects: [{ title: '', description: '', tech: '', link: '' }],
  experience: [{ company: '', role: '', duration: '', description: '' }],
  certifications: [{ name: '', issuer: '', year: '' }],
  achievements: '',
};


// ── Extract resume data from uploaded file via Claude API ─────────────────────
async function extractFromResume(fileBase64, mimeType) {
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const response = await fetch(`${apiBase}/ai/extract-resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token}`,
    },
    body: JSON.stringify({ fileBase64, mimeType }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Extraction failed');
  return result;
}

// ── AI Generate via Claude API ─────────────────────────────────────────────────
async function generateWithAI(data, jobRole) {
  const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const response = await fetch(`${apiBase}/ai/enhance-resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token}`,
    },
    body: JSON.stringify({ data, jobRole }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Enhancement failed');
  return result;
}

// ── Template Renderers ─────────────────────────────────────────────────────────
function ClassicResume({ data }) {
  const s = { fontFamily: 'Georgia, serif', color: '#222', fontSize: '12px', lineHeight: 1.3 };
  return (
    <div style={{ ...s, padding: '25px 32px', background: '#fff', minHeight: 'auto' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #2c3e50', paddingBottom: '8px', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#2c3e50', margin: '0 0 2px', fontFamily: 'Georgia, serif' }}>{data.name || 'Your Name'}</h1>
        <div style={{ fontSize: '11px', color: '#555', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>🔗 {data.linkedin}</span>}
          {data.github && <span>💻 {data.github}</span>}
        </div>
      </div>
      {data.objective && <RS title="OBJECTIVE"><p style={{ margin: 0 }}>{data.objective}</p></RS>}
      {data.education.some(e => e.institution) && (
        <RS title="EDUCATION">
          {data.education.filter(e => e.institution).map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div><div style={{ fontWeight: 700 }}>{e.institution}</div><div style={{ color: '#444' }}>{e.degree}{e.field ? ` in ${e.field}` : ''}</div></div>
              <div style={{ textAlign: 'right', color: '#555' }}>{e.year && <div>{e.year}</div>}{e.cgpa && <div>CGPA: {e.cgpa}</div>}</div>
            </div>
          ))}
        </RS>
      )}
      {(data.skills.technical || data.skills.soft || data.skills.tools) && (
        <RS title="SKILLS">
          {data.skills.technical && <div><strong>Technical:</strong> {data.skills.technical}</div>}
          {data.skills.soft && <div><strong>Soft Skills:</strong> {data.skills.soft}</div>}
          {data.skills.tools && <div><strong>Tools:</strong> {data.skills.tools}</div>}
        </RS>
      )}
      {data.projects.some(p => p.title) && (
        <RS title="PROJECTS">
          {data.projects.filter(p => p.title).map((p, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 700 }}>{p.title} {p.tech && <span style={{ fontWeight: 400, color: '#555' }}>| {p.tech}</span>}</div>
              {p.description && <div>{p.description}</div>}
              {p.link && <div style={{ color: '#2980b9', fontSize: '11px' }}>{p.link}</div>}
            </div>
          ))}
        </RS>
      )}
      {data.experience.some(e => e.company) && (
        <RS title="EXPERIENCE">
          {data.experience.filter(e => e.company).map((e, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700 }}>{e.role} — {e.company}</div>
                <div style={{ color: '#555' }}>{e.duration}</div>
              </div>
              {e.description && <div style={{ whiteSpace: 'pre-line' }}>{e.description}</div>}
            </div>
          ))}
        </RS>
      )}
      {data.certifications.some(c => c.name) && (
        <RS title="CERTIFICATIONS">
          {data.certifications.filter(c => c.name).map((c, i) => (
            <div key={i}>• {c.name}{c.issuer ? ` — ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}</div>
          ))}
        </RS>
      )}
      {data.achievements && <RS title="ACHIEVEMENTS"><p style={{ margin: 0, whiteSpace: 'pre-line' }}>{data.achievements}</p></RS>}
    </div>
  );
}

function ModernResume({ data }) {
  const accent = '#1a73e8';
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', minHeight: 'auto', background: '#fff', fontSize: '11.5px' }}>
      {/* Sidebar - Responsive */}
      <div style={{ width: '100%', background: accent, color: '#fff', padding: '20px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, margin: '0 auto 16px' }}>
          {data.name?.[0] || 'A'}
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', margin: '0 0 4px', lineHeight: 1.2 }}>{data.name || 'Your Name'}</h1>
        <div style={{ textAlign: 'center', fontSize: '11px', opacity: 0.8, marginBottom: '24px' }}>Fresher</div>

        <MS title="CONTACT">
          {data.email && <div style={{ marginBottom: '4px' }}>✉ {data.email}</div>}
          {data.phone && <div style={{ marginBottom: '4px' }}>📞 {data.phone}</div>}
          {data.location && <div style={{ marginBottom: '4px' }}>📍 {data.location}</div>}
          {data.linkedin && <div style={{ marginBottom: '4px', wordBreak: 'break-all' }}>🔗 {data.linkedin}</div>}
          {data.github && <div style={{ wordBreak: 'break-all' }}>💻 {data.github}</div>}
        </MS>

        {(data.skills.technical) && (
          <MS title="TECH SKILLS">
            {data.skills.technical.split(',').map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '2px 6px', marginBottom: '3px', fontSize: '11px' }}>{s.trim()}</div>
            ))}
          </MS>
        )}
        {data.skills.tools && <MS title="TOOLS"><div style={{ fontSize: '11px', lineHeight: 1.6 }}>{data.skills.tools}</div></MS>}
        {data.certifications.some(c => c.name) && (
          <MS title="CERTIFICATIONS">
            {data.certifications.filter(c => c.name).map((c, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '3px' }}>• {c.name}</div>)}
          </MS>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '32px 28px' }}>
        {data.objective && (
          <MR title="PROFILE SUMMARY" accent={accent}>
            <p style={{ margin: 0, color: '#444', lineHeight: 1.6 }}>{data.objective}</p>
          </MR>
        )}
        {data.education.some(e => e.institution) && (
          <MR title="EDUCATION" accent={accent}>
            {data.education.filter(e => e.institution).map((e, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, color: '#222' }}>{e.institution}</div>
                <div style={{ color: '#555' }}>{e.degree}{e.field ? ` in ${e.field}` : ''} {e.year ? `| ${e.year}` : ''} {e.cgpa ? `| CGPA: ${e.cgpa}` : ''}</div>
              </div>
            ))}
          </MR>
        )}
        {data.experience.some(e => e.company) && (
          <MR title="EXPERIENCE" accent={accent}>
            {data.experience.filter(e => e.company).map((e, i) => (
              <div key={i} style={{ marginBottom: '10px', paddingLeft: '8px', borderLeft: `3px solid ${accent}` }}>
                <div style={{ fontWeight: 700 }}>{e.role}</div>
                <div style={{ color: accent, fontSize: '11px' }}>{e.company} | {e.duration}</div>
                {e.description && <div style={{ color: '#444', marginTop: '3px', whiteSpace: 'pre-line' }}>{e.description}</div>}
              </div>
            ))}
          </MR>
        )}
        {data.projects.some(p => p.title) && (
          <MR title="PROJECTS" accent={accent}>
            {data.projects.filter(p => p.title).map((p, i) => (
              <div key={i} style={{ marginBottom: '8px', paddingLeft: '8px', borderLeft: `3px solid ${accent}` }}>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                {p.tech && <div style={{ color: accent, fontSize: '11px' }}>Tech: {p.tech}</div>}
                {p.description && <div style={{ color: '#444', marginTop: '2px' }}>{p.description}</div>}
              </div>
            ))}
          </MR>
        )}
        {data.achievements && <MR title="ACHIEVEMENTS" accent={accent}><p style={{ margin: 0, whiteSpace: 'pre-line', color: '#444' }}>{data.achievements}</p></MR>}
      </div>
    </div>
  );
}

function MinimalResume({ data }) {
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", padding: '25px 35px', background: '#fff', minHeight: 'auto', fontSize: '12px', color: '#333' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 300, margin: '0 0 6px', letterSpacing: '-0.5px', color: '#111' }}>{data.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: '#666' }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github && <span>{data.github}</span>}
        </div>
        <div style={{ height: '1px', background: '#ddd', marginTop: '14px' }} />
      </div>
      {data.objective && <MinS title="About"><p style={{ margin: 0, color: '#444', lineHeight: 1.7 }}>{data.objective}</p></MinS>}
      {data.education.some(e => e.institution) && (
        <MinS title="Education">
          {data.education.filter(e => e.institution).map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div><span style={{ fontWeight: 600 }}>{e.institution}</span> — {e.degree}{e.field ? ` in ${e.field}` : ''}</div>
              <div style={{ color: '#888', fontSize: '12px' }}>{e.year}{e.cgpa ? ` · ${e.cgpa}` : ''}</div>
            </div>
          ))}
        </MinS>
      )}
      {(data.skills.technical || data.skills.tools) && (
        <MinS title="Skills">
          {data.skills.technical && <div><span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technical — </span>{data.skills.technical}</div>}
          {data.skills.soft && <div style={{ marginTop: '3px' }}><span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soft — </span>{data.skills.soft}</div>}
          {data.skills.tools && <div style={{ marginTop: '3px' }}><span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tools — </span>{data.skills.tools}</div>}
        </MinS>
      )}
      {data.experience.some(e => e.company) && (
        <MinS title="Experience">
          {data.experience.filter(e => e.company).map((e, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>{e.role}</span><span style={{ color: '#888', fontSize: '12px' }}>{e.duration}</span></div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>{e.company}</div>
              {e.description && <div style={{ whiteSpace: 'pre-line', color: '#444' }}>{e.description}</div>}
            </div>
          ))}
        </MinS>
      )}
      {data.projects.some(p => p.title) && (
        <MinS title="Projects">
          {data.projects.filter(p => p.title).map((p, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>{p.title}</span>{p.tech && <span style={{ color: '#888', fontSize: '12px' }}> · {p.tech}</span>}
              {p.description && <div style={{ color: '#444' }}>{p.description}</div>}
            </div>
          ))}
        </MinS>
      )}
      {data.certifications.some(c => c.name) && (
        <MinS title="Certifications">
          {data.certifications.filter(c => c.name).map((c, i) => <div key={i}>{c.name}{c.issuer ? ` · ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}</div>)}
        </MinS>
      )}
      {data.achievements && <MinS title="Achievements"><p style={{ margin: 0, whiteSpace: 'pre-line', color: '#444' }}>{data.achievements}</p></MinS>}
    </div>
  );
}

function ExecutiveResume({ data }) {
  const accent = '#7b2d8b';
  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#fff', minHeight: 'auto', fontSize: '12px' }}>
      {/* Header bar - Responsive */}
      <div style={{ background: accent, color: '#fff', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.5px' }}>{data.name || 'YOUR NAME'}</h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px', opacity: 0.9, justifyContent: 'center' }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>🔗 {data.linkedin}</span>}
          {data.github && <span>💻 {data.github}</span>}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {data.objective && (
          <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#f9f4fb', borderLeft: `4px solid ${accent}`, borderRadius: '0 8px 8px 0' }}>
            <p style={{ margin: 0, color: '#333', lineHeight: 1.7, fontStyle: 'italic' }}>{data.objective}</p>
          </div>
        )}
        {data.education.some(e => e.institution) && (
          <ES title="EDUCATION" accent={accent}>
            {data.education.filter(e => e.institution).map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div><div style={{ fontWeight: 700 }}>{e.institution}</div><div style={{ color: '#555' }}>{e.degree}{e.field ? ` in ${e.field}` : ''}</div></div>
                <div style={{ textAlign: 'right', color: '#666', fontSize: '12px' }}>{e.year && <div>{e.year}</div>}{e.cgpa && <div>CGPA: {e.cgpa}</div>}</div>
              </div>
            ))}
          </ES>
        )}
        {(data.skills.technical || data.skills.soft || data.skills.tools) && (
          <ES title="CORE COMPETENCIES" accent={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[...data.skills.technical.split(','), ...data.skills.tools.split(',')].filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{ background: '#f0e6f5', color: accent, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{s.trim()}</span>
              ))}
            </div>
            {data.skills.soft && <div style={{ marginTop: '8px', color: '#555' }}><strong>Soft Skills:</strong> {data.skills.soft}</div>}
          </ES>
        )}
        {data.experience.some(e => e.company) && (
          <ES title="PROFESSIONAL EXPERIENCE" accent={accent}>
            {data.experience.filter(e => e.company).map((e, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div><div style={{ fontWeight: 700, color: '#111', fontSize: '14px' }}>{e.role}</div><div style={{ color: accent, fontWeight: 600, fontSize: '12px' }}>{e.company}</div></div>
                  <div style={{ color: '#888', fontSize: '12px', fontStyle: 'italic' }}>{e.duration}</div>
                </div>
                {e.description && <div style={{ marginTop: '4px', color: '#444', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{e.description}</div>}
              </div>
            ))}
          </ES>
        )}
        {data.projects.some(p => p.title) && (
          <ES title="KEY PROJECTS" accent={accent}>
            {data.projects.filter(p => p.title).map((p, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 700 }}>{p.title} {p.tech && <span style={{ color: accent, fontSize: '11px', fontWeight: 400 }}>({p.tech})</span>}</div>
                {p.description && <div style={{ color: '#444', marginTop: '2px' }}>{p.description}</div>}
              </div>
            ))}
          </ES>
        )}
        {data.certifications.some(c => c.name) && (
          <ES title="CERTIFICATIONS" accent={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.certifications.filter(c => c.name).map((c, i) => (
                <span key={i} style={{ background: '#f9f4fb', border: `1px solid ${accent}`, color: '#333', padding: '3px 10px', borderRadius: '4px', fontSize: '11px' }}>
                  {c.name}{c.year ? ` (${c.year})` : ''}
                </span>
              ))}
            </div>
          </ES>
        )}
        {data.achievements && <ES title="ACHIEVEMENTS" accent={accent}><p style={{ margin: 0, whiteSpace: 'pre-line', color: '#444' }}>{data.achievements}</p></ES>}
      </div>
    </div>
  );
}

// ── Section sub-components ─────────────────────────────────────────────────────
function RS({ title, children }) {
  return <div style={{ marginBottom: '8px', pageBreakInside: 'avoid' }}><div style={{ fontWeight: 800, fontSize: '11px', borderBottom: '1px solid #2c3e50', paddingBottom: '1px', marginBottom: '4px', color: '#2c3e50', letterSpacing: '0.06em' }}>{title}</div>{children}</div>;
}
function MS({ title, children }) {
  return <div style={{ marginBottom: '12px' }}><div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>{title}</div>{children}</div>;
}
function MR({ title, accent, children }) {
  return <div style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}><div style={{ fontWeight: 700, fontSize: '11px', color: accent, letterSpacing: '0.08em', borderBottom: `2px solid ${accent}`, paddingBottom: '1px', marginBottom: '6px' }}>{title}</div>{children}</div>;
}
function MinS({ title, children }) {
  return <div style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}><div style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>{title}</div>{children}</div>;
}
function ES({ title, accent, children }) {
  return <div style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}><div style={{ fontWeight: 700, fontSize: '11px', color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ flex: 1, height: '1px', background: accent, opacity: 0.3 }} />{title}<span style={{ flex: 1, height: '1px', background: accent, opacity: 0.3 }} /></div>{children}</div>;
}

const RENDERERS = { classic: ClassicResume, modern: ModernResume, minimal: MinimalResume, executive: ExecutiveResume };

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const { user } = useAuth();
  const [step, setStep] = useState('upload'); // template | form | preview
  const [template, setTemplate] = useState('classic');
  const [data, setData] = useState({ ...defaultData, name: user?.name || '', email: user?.email || '', phone: user?.phone || '', skills: { technical: (user?.skills || []).join(', '), soft: '', tools: '' } });
  const [jobRole, setJobRole] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadJobRole, setUploadJobRole] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const fileInputRef = useRef();

  const set = (field, val) => setData(d => ({ ...d, [field]: val }));
  const setNested = (section, idx, field, val) => { const arr = [...data[section]]; arr[idx] = { ...arr[idx], [field]: val }; setData(d => ({ ...d, [section]: arr })); };
  const addItem = (section, empty) => setData(d => ({ ...d, [section]: [...d[section], empty] }));
  const removeItem = (section, idx) => setData(d => ({ ...d, [section]: d[section].filter((_, i) => i !== idx) }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    setUploadError('');
    setUploadedFileName(file.name);
    try {
      // Convert to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mimeType = file.type === 'application/pdf' ? 'application/pdf' : (file.type || 'image/jpeg');
      const extracted = await extractFromResume(base64, mimeType);

      // Merge extracted data with defaults
      setData(d => ({
        ...d,
        name: extracted.name || d.name,
        email: extracted.email || d.email,
        phone: extracted.phone || d.phone,
        location: extracted.location || d.location,
        linkedin: extracted.linkedin || d.linkedin,
        github: extracted.github || d.github,
        objective: extracted.objective || d.objective,
        education: extracted.education?.length ? extracted.education : d.education,
        skills: {
          technical: extracted.skills?.technical || d.skills.technical,
          soft: extracted.skills?.soft || d.skills.soft,
          tools: extracted.skills?.tools || d.skills.tools,
        },
        projects: extracted.projects?.filter(p => p.title).length ? extracted.projects : d.projects,
        experience: extracted.experience?.filter(e => e.company).length ? extracted.experience : d.experience,
        certifications: extracted.certifications?.filter(c => c.name).length ? extracted.certifications : d.certifications,
        achievements: extracted.achievements || d.achievements,
      }));

      // Stay on upload step so user can enter job role
    } catch (err) {
      console.error('Resume extract error:', err);
      setUploadError('Error: ' + (err.message || 'Could not extract resume data. Try a different file.'));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBuildResume = async () => {
    if (!uploadJobRole.trim()) return;
    setEnhancing(true);
    setAiError('');
    try {
      const enhanced = await generateWithAI(data, uploadJobRole);
      setData(d => ({
        ...d,
        objective: enhanced.objective || d.objective,
        skills: { ...d.skills, ...enhanced.skills },
        projects: enhanced.projects?.length ? enhanced.projects : d.projects,
        experience: enhanced.experience?.length ? enhanced.experience : d.experience,
        achievements: enhanced.achievements || d.achievements,
      }));
      setJobRole(uploadJobRole);
      setStep('template');
    } catch (err) {
      setAiError('AI enhancement failed: ' + err.message);
    } finally {
      setEnhancing(false);
    }
  };

  const handleAI = async () => {
    if (!jobRole.trim()) { setAiError('Please enter a job role first'); return; }
    setAiLoading(true); setAiError('');
    try {
      const enhanced = await generateWithAI(data, jobRole);
      setData(d => ({
        ...d,
        objective: enhanced.objective || d.objective,
        skills: { ...d.skills, ...enhanced.skills },
        projects: enhanced.projects?.length ? enhanced.projects : d.projects,
        experience: enhanced.experience?.length ? enhanced.experience : d.experience,
        achievements: enhanced.achievements || d.achievements,
      }));
    } catch (e) {
      setAiError('AI enhancement failed. Please check your details and try again.');
    } finally { setAiLoading(false); }
  };

  const ResumeComponent = RENDERERS[template] || ClassicResume;

  // Step 0: Upload existing resume
  if (step === 'upload') return (
    <div>
      <div className="page-header">
        <h1>📄 Resume Builder</h1>
        <p>Upload your existing resume and AI will extract all information automatically</p>
      </div>

      <div style={{ maxWidth: '560px' }}>
        {/* Upload card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>📤 Upload Your Resume</h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--text3)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Upload a photo or screenshot of your resume. AI will read it and auto-fill all your details — name, education, skills, projects, experience and more.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${uploadedFileName ? 'var(--green)' : 'var(--border2)'}`,
              borderRadius: '12px', padding: '2.5rem', textAlign: 'center',
              cursor: uploadLoading ? 'wait' : 'pointer',
              background: uploadedFileName ? 'var(--green-dim)' : 'var(--surface2)',
              transition: 'all 0.2s',
            }}
          >
            {uploadLoading ? (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Reading your resume...</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>AI is extracting your information</div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                  <div className="spinner" />
                </div>
              </div>
            ) : uploadedFileName ? (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontWeight: 600, color: 'var(--green)' }}>Resume extracted!</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '4px' }}>{uploadedFileName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '4px' }}>Click to upload a different file</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📎</div>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Click to upload resume</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>JPG, PNG, PDF screenshot — up to 10MB</div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {uploadError && (
            <div style={{ marginTop: '0.75rem', color: 'var(--red)', fontSize: '0.82rem', background: 'var(--red-dim)', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
              ⚠️ {uploadError}
            </div>
          )}
        </div>

        {/* Job role input - shown after resume is uploaded */}
        {uploadedFileName && !uploadLoading && (
          <div className="card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, var(--accent-dim), var(--purple-dim))', border: '1px solid var(--accent)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>🎯 Target Job Role</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '0.85rem', lineHeight: 1.6 }}>
              Enter the job role you are applying for. AI will tailor your resume — rewriting your objective, highlighting relevant skills and enhancing project descriptions to match.
            </p>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <input
                className="form-control"
                placeholder="e.g. Software Engineer, Data Analyst, Full Stack Developer..."
                value={uploadJobRole}
                onChange={e => setUploadJobRole(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && uploadJobRole.trim()) handleBuildResume(); }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={!uploadJobRole.trim() || enhancing}
                onClick={handleBuildResume}
              >
                {enhancing ? '🤖 Tailoring resume...' : '✨ Build Resume for this Role'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setJobRole(''); setStep('template'); }}
                title="Skip AI enhancement"
              >
                Skip
              </button>
            </div>
            {enhancing && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.75rem', textAlign: 'center' }}>
                🤖 AI is tailoring your resume for <strong>{uploadJobRole}</strong>...
              </div>
            )}
          </div>
        )}

        {/* Or start from scratch */}
        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.82rem', marginBottom: '1rem' }}>— or —</div>
        <button
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => setStep('template')}
        >
          Start from Scratch (fill manually)
        </button>
      </div>
    </div>
  );

  // Step 1: Choose template
  if (step === 'template') return (
    <div>
      <div className="page-header"><h1>📄 Resume Builder</h1><p>Choose a template to get started</p></div>
      <div className="grid-2" style={{ maxWidth: '800px' }}>
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => setTemplate(t.id)} style={{ cursor: 'pointer', padding: '1.25rem', borderRadius: '12px', border: `2px solid ${template === t.id ? t.accent : 'var(--border2)'}`, background: template === t.id ? 'var(--surface2)' : 'var(--surface)', transition: 'all 0.15s', position: 'relative' }}>
            {/* Mini preview */}
            <div style={{ height: '120px', background: t.id === 'modern' ? `linear-gradient(90deg, ${t.accent} 35%, #f5f5f5 35%)` : '#f5f5f5', borderRadius: '6px', marginBottom: '0.75rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#999', border: '1px solid #e0e0e0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: t.accent, fontSize: '0.8rem' }}>{t.label}</div>
                <div style={{ color: '#aaa', fontSize: '0.65rem' }}>Preview</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{t.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{t.desc}</div>
            {template === t.id && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-outline" onClick={() => setStep('upload')}>← Back</button>
        <button className="btn btn-primary" onClick={() => setStep('form')}>Continue with {TEMPLATES.find(t => t.id === template)?.label} →</button>
      </div>
    </div>
  );

  // Step 3: Preview
  if (step === 'preview') return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }} className="no-print">
        <button className="btn btn-outline" style={{ flex: '1 1 100px', minHeight: '40px' }} onClick={() => setStep('form')}>← Back</button>
        <button className="btn btn-outline" style={{ flex: '1 1 100px', minHeight: '40px' }} onClick={() => setStep('template')}>Change</button>
        <button className="btn btn-primary" style={{ flex: '1 1 100px', minHeight: '40px' }} onClick={() => window.print()}>🖨 Print</button>
      </div>
      <div id="resume-preview" style={{ maxWidth: '820px', margin: '0 auto', boxShadow: '0 0 30px rgba(0,0,0,0.25)', padding: '0.5rem' }}>
        <ResumeComponent data={data} />
      </div>
      <style>{`
        #resume-preview {
          margin: 0 auto;
          padding: 0.5rem;
        }
        
        /* Mobile resume preview */
        @media (max-width: 768px) {
          #resume-preview {
            max-width: 100% !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          #resume-preview { box-shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          aside, header, nav, footer { display: none !important; }
          @page { margin: 0.5cm; size: A4; }
          #resume-preview > div { page-break-inside: avoid; }
          #resume-preview div { page-break-inside: avoid; }
          #resume-preview p { page-break-inside: avoid; orphans: 3; widows: 3; }
          h1, h2, h3, h4 { page-break-after: avoid; }
          tr, img { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );

  // Step 2: Form
  return (
    <div>
      <div className="page-header">
        <div style={{ marginBottom: '1rem' }}><h1>📄 Resume Builder</h1><p>Fill in your details — AI will optimize for your target role</p></div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ flex: '1', minWidth: '100px' }} onClick={() => setStep('template')}>← Templates</button>
          <button className="btn btn-primary" style={{ flex: '1', minWidth: '100px' }} onClick={() => setStep('preview')}>Preview →</button>
        </div>
      </div>

      {/* AI Enhance box */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--accent-dim), var(--purple-dim))', border: '1px solid var(--accent)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>🤖 AI Resume Enhancer</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>Enter your target job role and let AI optimize your objective, skills and descriptions to match the role perfectly.</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input className="form-control" style={{ flex: 1, minWidth: '200px' }} placeholder="e.g. Software Engineer, Data Analyst, Marketing Manager..." value={jobRole} onChange={e => setJobRole(e.target.value)} />
          <button className="btn btn-primary" onClick={handleAI} disabled={aiLoading} style={{ whiteSpace: 'nowrap' }}>
            {aiLoading ? '⏳ Enhancing...' : '✨ Enhance with AI'}
          </button>
        </div>
        {aiError && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{aiError}</div>}
        {aiLoading && <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.5rem' }}>🤖 AI is optimizing your resume for {jobRole} role...</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Personal Info */}
        <div className="card">
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</h3>
          <div className="grid-2">
            <div className="form-group"><label>Full Name</label><input className="form-control" value={data.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label>Email</label><input className="form-control" value={data.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="form-group"><label>Phone</label><input className="form-control" value={data.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div className="form-group"><label>Location</label><input className="form-control" value={data.location} onChange={e => set('location', e.target.value)} placeholder="City, State" /></div>
            <div className="form-group"><label>LinkedIn</label><input className="form-control" value={data.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/..." /></div>
            <div className="form-group"><label>GitHub</label><input className="form-control" value={data.github} onChange={e => set('github', e.target.value)} placeholder="github.com/..." /></div>
          </div>
        </div>

        {/* Objective */}
        <div className="card">
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Career Objective</h3>
          <textarea className="form-control" rows={3} value={data.objective} onChange={e => set('objective', e.target.value)} placeholder="Write a brief career objective... (AI will enhance this based on your target role)" />
        </div>

        {/* Education */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Education</h3>
            <button className="btn btn-outline btn-sm" onClick={() => addItem('education', { institution: '', degree: '', field: '', year: '', cgpa: '' })}>+ Add</button>
          </div>
          {data.education.map((e, i) => (
            <div key={i} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.75rem' }}>
              <div className="grid-2" style={{ gap: '0.5rem' }}>
                <div className="form-group"><label>Institution</label><input className="form-control" value={e.institution} onChange={ev => setNested('education', i, 'institution', ev.target.value)} /></div>
                <div className="form-group"><label>Degree</label><input className="form-control" value={e.degree} onChange={ev => setNested('education', i, 'degree', ev.target.value)} placeholder="B.E / B.Tech / MCA" /></div>
                <div className="form-group"><label>Field of Study</label><input className="form-control" value={e.field} onChange={ev => setNested('education', i, 'field', ev.target.value)} /></div>
                <div className="form-group"><label>Year</label><input className="form-control" value={e.year} onChange={ev => setNested('education', i, 'year', ev.target.value)} placeholder="2020–2024" /></div>
                <div className="form-group"><label>CGPA / %</label><input className="form-control" value={e.cgpa} onChange={ev => setNested('education', i, 'cgpa', ev.target.value)} /></div>
              </div>
              {data.education.length > 1 && <button className="btn btn-danger btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => removeItem('education', i)}>Remove</button>}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="card">
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group"><label>Technical Skills</label><input className="form-control" value={data.skills.technical} onChange={e => setData(d => ({ ...d, skills: { ...d.skills, technical: e.target.value } }))} placeholder="Java, Python, React, SQL, Machine Learning..." /></div>
            <div className="form-group"><label>Soft Skills</label><input className="form-control" value={data.skills.soft} onChange={e => setData(d => ({ ...d, skills: { ...d.skills, soft: e.target.value } }))} placeholder="Communication, Leadership, Problem Solving..." /></div>
            <div className="form-group"><label>Tools & Technologies</label><input className="form-control" value={data.skills.tools} onChange={e => setData(d => ({ ...d, skills: { ...d.skills, tools: e.target.value } }))} placeholder="Git, VS Code, Docker, Figma, Postman..." /></div>
          </div>
        </div>

        {/* Projects */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projects</h3>
            <button className="btn btn-outline btn-sm" onClick={() => addItem('projects', { title: '', description: '', tech: '', link: '' })}>+ Add</button>
          </div>
          {data.projects.map((p, i) => (
            <div key={i} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.75rem' }}>
              <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="form-group"><label>Project Title</label><input className="form-control" value={p.title} onChange={e => setNested('projects', i, 'title', e.target.value)} /></div>
                <div className="form-group"><label>Technologies Used</label><input className="form-control" value={p.tech} onChange={e => setNested('projects', i, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB..." /></div>
              </div>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}><label>Description</label><textarea className="form-control" rows={2} value={p.description} onChange={e => setNested('projects', i, 'description', e.target.value)} placeholder="What did you build? What problem did it solve?" /></div>
              <div className="form-group"><label>GitHub / Live Link</label><input className="form-control" value={p.link} onChange={e => setNested('projects', i, 'link', e.target.value)} placeholder="github.com/..." /></div>
              {data.projects.length > 1 && <button className="btn btn-danger btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => removeItem('projects', i)}>Remove</button>}
            </div>
          ))}
        </div>

        {/* Experience */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Experience / Internships</h3>
            <button className="btn btn-outline btn-sm" onClick={() => addItem('experience', { company: '', role: '', duration: '', description: '' })}>+ Add</button>
          </div>
          {data.experience.map((e, i) => (
            <div key={i} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.75rem' }}>
              <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="form-group"><label>Company</label><input className="form-control" value={e.company} onChange={ev => setNested('experience', i, 'company', ev.target.value)} /></div>
                <div className="form-group"><label>Role</label><input className="form-control" value={e.role} onChange={ev => setNested('experience', i, 'role', ev.target.value)} /></div>
                <div className="form-group"><label>Duration</label><input className="form-control" value={e.duration} onChange={ev => setNested('experience', i, 'duration', ev.target.value)} placeholder="Jun 2023 – Aug 2023" /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows={2} value={e.description} onChange={ev => setNested('experience', i, 'description', ev.target.value)} placeholder="Key responsibilities and achievements..." /></div>
              {data.experience.length > 1 && <button className="btn btn-danger btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => removeItem('experience', i)}>Remove</button>}
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certifications</h3>
            <button className="btn btn-outline btn-sm" onClick={() => addItem('certifications', { name: '', issuer: '', year: '' })}>+ Add</button>
          </div>
          {data.certifications.map((c, i) => (
            <div key={i}>
              <style>{`
                @media (max-width: 768px) {
                  .cert-row-${i} { grid-template-columns: 1fr !important; }
                }
              `}</style>
              <div className={`cert-row-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
                <div className="form-group"><label>Certification Name</label><input className="form-control" value={c.name} onChange={e => setNested('certifications', i, 'name', e.target.value)} /></div>
                <div className="form-group"><label>Issuer</label><input className="form-control" value={c.issuer} onChange={e => setNested('certifications', i, 'issuer', e.target.value)} placeholder="Coursera, Google, AWS..." /></div>
                <div className="form-group"><label>Year</label><input className="form-control" value={c.year} onChange={e => setNested('certifications', i, 'year', e.target.value)} /></div>
                {data.certifications.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => removeItem('certifications', i)} style={{ padding: '0.5rem' }}>✕</button>}
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="card">
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Achievements & Extracurriculars</h3>
          <textarea className="form-control" rows={4} value={data.achievements} onChange={e => set('achievements', e.target.value)} placeholder={'• Hackathon winner...\n• NSS Volunteer...\n• Sports captain...'} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setStep('template')}>← Change Template</button>
          <button className="btn btn-primary" onClick={() => setStep('preview')}>Preview Resume →</button>
        </div>
      </div>
    </div>
  );
}