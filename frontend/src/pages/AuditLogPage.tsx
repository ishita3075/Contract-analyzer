import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { AuditLog } from '../types';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

const EVENT_COLORS: Record<string, { bg: string; color: string }> = {
  DOCUMENT_UPLOADED: { bg: 'rgba(99,102,241,0.1)', color: '#6366F1' },
  DOCUMENT_ANALYZED: { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
  DOCUMENT_DELETED: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
  DOCUMENT_EXPORTED: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getAuditLogs(page, 30).then(res => {
      setLogs(res.content || []);
      setTotalPages(res.totalPages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page]);

  return (
    <div style={{ padding: 32 }} className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Audit Log</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Immutable record of all system events</p>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <ClipboardList size={48} color="var(--text-subtle)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)' }}>No audit events yet</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>Actor</th>
                <th>Document</th>
                <th>Details</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const ec = EVENT_COLORS[log.eventType] || { bg: 'rgba(148,163,184,0.1)', color: '#94A3B8' };
                return (
                  <tr key={log.id} style={{ cursor: 'default' }}>
                    <td style={{ fontSize: 12, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: ec.bg, color: ec.color }}>
                        {log.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{log.actorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{log.actorEmail}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.documentId || '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{log.ipAddress}</td>
                  </tr>
                );
              })}
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
