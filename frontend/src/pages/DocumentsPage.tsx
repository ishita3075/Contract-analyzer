import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { DocumentSummary, RiskLevel } from '../types';
import { Search, FileText, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>Pending</span>;
  const cls = level === 'HIGH' ? 'badge-high' : level === 'MEDIUM' ? 'badge-medium' : 'badge-low';
  const icons: Record<RiskLevel, string> = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };
  return <span className={`badge ${cls}`}>{icons[level]} {level}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ANALYZED: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'Analyzed' },
    ANALYZING: { bg: 'rgba(99,102,241,0.1)', color: '#6366F1', label: 'Analyzing...' },
    PARSING: { bg: 'rgba(99,102,241,0.1)', color: '#6366F1', label: 'Parsing' },
    UPLOADED: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Uploaded' },
    FAILED: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Failed' },
    INVALID_DOCUMENT: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Not a Contract' },
  };
  const s = map[status] || { bg: 'var(--bg-card)', color: 'var(--text-muted)', label: status };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [riskFilter, setRiskFilter] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.listDocuments(page, 15, search || undefined);
      let content = res.content || [];
      if (riskFilter) content = content.filter(d => d.overallRiskLevel === riskFilter);
      setDocs(content);
      setTotalPages(res.totalPages);
      setTotalDocs(res.totalElements);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [page, search, riskFilter]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try { await api.deleteDocument(id); fetchDocs(); } catch { }
  };

  return (
    <div style={{ padding: 32 }} className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Documents</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{totalDocs} contracts</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search contracts..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ paddingLeft: 38 }} />
        </div>
        <select className="input" style={{ width: 160 }} value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
          <option value="">All Risk Levels</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : docs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={48} color="var(--text-subtle)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600 }}>No documents found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Risk Level</th>
                <th>Clauses</th>
                <th>Missing</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={16} color="var(--text-subtle)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.filename}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{doc.uploadedBy}</div>
                      </div>
                    </div>
                  </td>
                  <td><RiskBadge level={doc.overallRiskLevel} /></td>
                  <td style={{ fontWeight: 600 }}>{doc.clauseCount}</td>
                  <td>
                    {doc.missingClauseCount > 0
                      ? <span style={{ color: 'var(--risk-high)', fontWeight: 600 }}>⚠ {doc.missingClauseCount}</span>
                      : <span style={{ color: 'var(--risk-low)' }}>✓ None</span>}
                  </td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/documents/${doc.id}`)}
                        style={{ background: 'rgba(99,102,241,0.1)', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: 'var(--primary)' }}>
                        <Eye size={13} />
                      </button>
                      <button onClick={e => handleDelete(e, doc.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: 'var(--risk-high)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page + 1} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" style={{ padding: '6px 10px' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
              <button className="btn-ghost" style={{ padding: '6px 10px' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
