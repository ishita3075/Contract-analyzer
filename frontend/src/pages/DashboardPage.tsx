import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { DocumentSummary } from '../types';
import {
  FileText, AlertTriangle, Clock,
  Upload, ArrowRight, Shield, CheckCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function RiskBadge({ level }: { level: string | null }) {
  if (!level) return <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>—</span>;
  const cls = level === 'HIGH' ? 'badge-high' : level === 'MEDIUM' ? 'badge-medium' : 'badge-low';
  return <span className={`badge ${cls}`}>{level}</span>;
}

function KPICard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}



export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listDocuments(0, 100).then(page => { setDocs(page.content || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const total = docs.length;
  const highRisk = docs.filter(d => d.overallRiskLevel === 'HIGH').length;
  const analyzed = docs.filter(d => d.status === 'ANALYZED').length;
  const pending = docs.filter(d => d.status !== 'ANALYZED' && d.status !== 'FAILED').length;
  const recent = docs.slice(0, 5);

  const pieData = [
    { name: 'High', value: highRisk, color: '#EF4444' },
    { name: 'Medium', value: docs.filter(d => d.overallRiskLevel === 'MEDIUM').length, color: '#F59E0B' },
    { name: 'Low', value: docs.filter(d => d.overallRiskLevel === 'LOW').length, color: '#10B981' },
  ].filter(d => d.value > 0);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          {user?.orgName} · Contract Intelligence Overview
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        <KPICard icon={FileText} label="Total Documents" value={loading ? '—' : total} color="#6366F1" />
        <KPICard icon={AlertTriangle} label="High Risk" value={loading ? '—' : highRisk} sub="Requires immediate review" color="#EF4444" />
        <KPICard icon={CheckCircle} label="Analyzed" value={loading ? '—' : analyzed} color="#10B981" />
        <KPICard icon={Clock} label="In Progress" value={loading ? '—' : pending} color="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 24 }}>
        {/* Recent Documents */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Contracts</h2>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => navigate('/documents')}>
              View all <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <FileText size={40} color="var(--text-subtle)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No contracts yet</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/upload')}>
                <Upload size={14} /> Upload First Contract
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(doc => (
                  <tr key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{doc.filename}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
                        {doc.clauseCount} clauses
                      </div>
                    </td>
                    <td><RiskBadge level={doc.overallRiskLevel} /></td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                        background: doc.status === 'ANALYZED' ? 'rgba(16,185,129,0.1)' : doc.status === 'FAILED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: doc.status === 'ANALYZED' ? '#10B981' : doc.status === 'FAILED' ? '#EF4444' : '#F59E0B'
                      }}>{doc.status}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Risk Distribution</h2>
          {pieData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
              <p style={{ color: 'var(--text-subtle)', fontSize: 13 }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {[{ label: 'High Risk', count: highRisk, color: '#EF4444' },
              { label: 'Medium Risk', count: docs.filter(d => d.overallRiskLevel === 'MEDIUM').length, color: '#F59E0B' },
              { label: 'Low Risk', count: docs.filter(d => d.overallRiskLevel === 'LOW').length, color: '#10B981' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Upload CTA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
        border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Analyze a New Contract</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              AI-powered clause extraction, risk scoring, and template comparison in seconds
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/upload')}>
          <Upload size={15} /> Upload Contract
        </button>
      </div>
    </div>
  );
}
