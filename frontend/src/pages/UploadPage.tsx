import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { api } from '../lib/api';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

type Stage = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [docId, setDocId] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFile(accepted[0]); setStage('idle'); setError(''); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
  });

  const handleUpload = async () => {
    if (!file) return;
    setStage('uploading');
    setProgress(0);
    setError('');
    try {
      const res = await api.uploadDocument(file, (pct) => setProgress(pct));
      setDocId(res.documentId);
      setStage('analyzing');
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const doc = await api.getDocument(res.documentId);
          if (doc.status === 'ANALYZED') { clearInterval(poll); setStage('done'); }
          else if (doc.status === 'FAILED') { clearInterval(poll); setStage('error'); setError('Analysis failed. Please try again.'); }
        } catch {}
      }, 3000);
    } catch (err: any) {
      setStage('error');
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const formatSize = (b: number) => b > 1024*1024 ? `${(b/1024/1024).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;

  return (
    <div style={{ padding: 32, maxWidth: 720, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Upload Contract</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>
          Upload a PDF or DOCX file to begin AI-powered clause extraction and risk analysis
        </p>
      </div>

      {/* Dropzone */}
      {stage === 'idle' && (
        <>
          <div {...getRootProps()} style={{
            border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 16, padding: 48, textAlign: 'center', cursor: 'pointer',
            background: isDragActive ? 'rgba(99,102,241,0.08)' : 'var(--glass)',
            transition: 'all 0.2s',
            ...(file ? { borderStyle: 'solid', borderColor: 'var(--primary)' } : {})
          }}>
            <input {...getInputProps()} />
            {file ? (
              <>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FileText size={28} color="var(--primary)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{file.name}</div>
                <div style={{ color: 'var(--text-subtle)', fontSize: 13, marginTop: 6 }}>{formatSize(file.size)}</div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, margin: '12px auto 0' }}>
                  <X size={12} /> Remove file
                </button>
              </>
            ) : (
              <>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Upload size={28} color="var(--text-subtle)" />
                </div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                  {isDragActive ? 'Drop your contract here' : 'Drag & drop your contract'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse to upload</span></p>
                <p style={{ color: 'var(--text-subtle)', fontSize: 12, marginTop: 12 }}>Supports PDF and DOCX · Max 50 MB</p>
              </>
            )}
          </div>

          {file && (
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '14px 0', fontSize: 15 }} onClick={handleUpload}>
              <Upload size={16} /> Start Analysis
            </button>
          )}
        </>
      )}

      {/* Upload progress */}
      {stage === 'uploading' && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Uploading...</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>{file?.name}</div>
          <div className="progress-bar" style={{ marginBottom: 12 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{progress}% uploaded</div>
        </div>
      )}

      {/* Analyzing */}
      {stage === 'analyzing' && (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 24px', position: 'relative' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '3px solid rgba(99,102,241,0.2)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Analyzing Contract...</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            The AI is extracting clauses, scoring risk, and detecting anomalies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300, margin: '0 auto' }}>
            {['Parsing document text', 'Extracting clauses with AI', 'Scoring risk levels', 'Detecting missing clauses', 'Comparing to templates'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                <Loader size={12} className="animate-spin" color="var(--primary)" />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {stage === 'done' && (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={36} color="var(--risk-low)" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Analysis Complete!</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            Your contract has been fully analyzed. Review the findings below.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate(`/documents/${docId}`)}>
              <FileText size={15} /> View Analysis
            </button>
            <button className="btn-ghost" onClick={() => { setFile(null); setStage('idle'); setDocId(''); }}>
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {stage === 'error' && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={32} color="var(--risk-high)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Analysis Failed</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{error}</div>
          <button className="btn-primary" onClick={() => { setFile(null); setStage('idle'); setError(''); }}>
            Try Again
          </button>
        </div>
      )}

      {/* Info box */}
      {stage === 'idle' && (
        <div style={{ marginTop: 24, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--primary)' }}>What the AI analyzes:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['Clause extraction & classification', 'Risk scoring (Low/Medium/High)', 'Missing critical clauses', 'One-sided clause detection', 'Unusual term identification', 'Template similarity scoring'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <CheckCircle size={13} color="var(--risk-low)" /> {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
