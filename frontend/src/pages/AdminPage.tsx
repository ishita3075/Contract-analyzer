import { useAuth } from '../context/AuthContext';
import { Settings, Users, Key, BarChart2, Shield, Database } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();

  const cards = [
    { icon: Users, title: 'User Management', desc: 'Manage team members, roles, and permissions', color: '#6366F1' },
    { icon: Key, title: 'API Configuration', desc: 'Configure LLM endpoints and integration keys', color: '#8B5CF6' },
    { icon: BarChart2, title: 'Usage Analytics', desc: 'Review system usage metrics and performance KPIs', color: '#10B981' },
    { icon: Shield, title: 'Security Settings', desc: 'Configure CORS, rate limits, and auth policies', color: '#F59E0B' },
    { icon: Database, title: 'Data Retention', desc: 'Set document retention policies per organization', color: '#EF4444' },
    { icon: Settings, title: 'System Config', desc: 'Application settings and maintenance controls', color: '#94A3B8' },
  ];

  return (
    <div style={{ padding: 32 }} className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.orgName} · System Administration</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {cards.map(card => (
          <div key={card.title} className="glass-card" style={{ padding: 24, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <card.icon size={20} color={card.color} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{card.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{card.desc}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-subtle)' }}>Coming in Phase 2 →</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, padding: 20, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
        <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>📋 System Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { label: 'LLM Mode', value: 'Mock (Development)' },
            { label: 'API Base', value: '/api/v1' },
            { label: 'Auth', value: 'JWT Bearer' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
