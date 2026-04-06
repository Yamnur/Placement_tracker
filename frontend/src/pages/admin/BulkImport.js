import { useState, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SAMPLE_CSV = `name,email,rollNumber,branch,cgpa,phone,graduationYear
John Doe,john@college.edu,CS001,CSE,8.5,9876543210,2026
Jane Smith,jane@college.edu,EC002,ECE,7.8,9876543211,2026
Bob Kumar,bob@college.edu,ME003,ME,8.1,9876543212,2025`;

export default function BulkImport() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample-students.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) return toast.error('Please select a CSV file');
    setImporting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/students/bulk-import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(r.data);
      toast.success(r.data.message);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="page-header"><h1>📥 Bulk Student Import</h1><p>Import multiple students at once using a CSV file</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Upload panel */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Upload CSV File</h3>

          <div style={{ border: '2px dashed var(--border2)', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '1rem', cursor: 'pointer', background: file ? 'var(--green-dim)' : 'transparent' }}
            onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{file ? '✅' : '📁'}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text2)' }}>
              {file ? file.name : 'Click to select CSV file'}
            </div>
            {!file && <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>Only .csv files supported</div>}
          </div>

          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleImport} disabled={!file || importing} style={{ flex: 1 }}>
              {importing ? '⏳ Importing...' : '📥 Import Students'}
            </button>
            {file && <button className="btn btn-outline" onClick={() => { setFile(null); fileRef.current.value = ''; }}>Clear</button>}
          </div>

          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface2)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--green)' }}>Import Complete</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>✅ Created: <strong>{result.created}</strong></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>⏭ Skipped (existing): <strong>{result.skipped}</strong></div>
              {result.errors?.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600 }}>Errors ({result.errors.length}):</div>
                  {result.errors.slice(0, 5).map((e, i) => <div key={i} style={{ fontSize: '0.75rem', color: 'var(--red)' }}>• {e}</div>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Instructions</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 2 }}>
            <div>1. Download the sample CSV template below</div>
            <div>2. Fill in student details (name & email are required)</div>
            <div>3. Save the file and upload it here</div>
            <div>4. Existing students (by email) will be skipped</div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'var(--amber-dim)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--amber)' }}>
            ⚠️ Default password for imported students is their <strong>Roll Number</strong>. If no roll number, default is <strong>Student@123</strong>. Advise students to change their password on first login.
          </div>

          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={downloadSample}>
            ↓ Download Sample CSV
          </button>

          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text3)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required CSV Columns</div>
            <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text2)', lineHeight: 1.8 }}>
              <div><strong>name</strong> — Full name (required)</div>
              <div><strong>email</strong> — Email address (required)</div>
              <div><strong>rollNumber</strong> — Roll number</div>
              <div><strong>branch</strong> — CSE / ECE / EEE / ME / CE / IT</div>
              <div><strong>cgpa</strong> — CGPA (0–10)</div>
              <div><strong>phone</strong> — Mobile number</div>
              <div><strong>graduationYear</strong> — e.g. 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
