import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ClauseTemplate } from '../types';
import { BookOpen, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ClauseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ clauseType: '', name: '', standardText: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => api.listTemplates().then(t => { setTemplates(t); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) { await api.updateTemplate(editId, form); }
      else { await api.createTemplate(form); }
      setShowCreate(false); setEditId(null); setForm({ clauseType: '', name: '', standardText: '', description: '' });
      load();
    } catch {} finally { setSaving(false); }
  };

  const handleEdit = (t: ClauseTemplate) => {
    setEditId(t.id);
    setForm({ clauseType: t.clauseType, name: t.name, standardText: t.standardText, description: t.description });
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try { await api.deleteTemplate(id); load(); } catch {}
  };

  const CLAUSE_TYPES = ['LIABILITY','TERMINATION','CONFIDENTIALITY','PAYMENT_TERMS','INTELLECTUAL_PROPERTY','GOVERNING_LAW','FORCE_MAJEURE','DISPUTE_RESOLUTION','DATA_PROTECTION','AUTO_RENEWAL','NON_COMPETE','SLA','WARRANTIES'];

  return (
    <div style={{ padding: 32 }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Template Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{templates.length} standard clause templates</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowCreate(true); setEditId(null); setForm({ clauseType: '', name: '', standardText: '', description: '' }); }}>
          <Plus size={15} /> New Template
        </button>
      </div>

      {showCreate && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>{editId ? 'Edit Template' : 'Create Template'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Clause Type</label>
              <select className="input" value={form.clauseType} onChange={e => setForm(f => ({ ...f, clauseType: e.target.value }))}>
                <option value="">Select type...</option>
                {CLAUSE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Template Name</label>
              <input className="input" placeholder="e.g. Standard Liability Cap" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Standard Text</label>
            <textarea className="input" rows={5} placeholder="Enter the standard clause language..." value={form.standardText}
              onChange={e => setForm(f => ({ ...f, standardText: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description (optional)</label>
            <input className="input" placeholder="Brief description of this template" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Check size={14} /> {saving ? 'Saving...' : 'Save Template'}
            </button>
            <button className="btn-ghost" onClick={() => { setShowCreate(false); setEditId(null); }}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
        </div>
      ) : templates.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 16 }}>
          <BookOpen size={48} color="var(--text-subtle)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No templates yet</p>
          <p style={{ color: 'var(--text-subtle)', fontSize: 13, marginTop: 6 }}>Create standard clause templates to enable similarity scoring</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {templates.map(t => (
            <div key={t.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t.clauseType.replace(/_/g, ' ')}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleEdit(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4 }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--risk-high)', padding: 4 }}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{t.name}</div>
              {t.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{t.description}</div>}
              <div style={{ fontSize: 12, color: 'var(--text-subtle)', lineHeight: 1.6, background: 'var(--bg-card)', borderRadius: 8, padding: 12, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {t.standardText}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 12 }}>
                v{t.version} · Updated {new Date(t.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
