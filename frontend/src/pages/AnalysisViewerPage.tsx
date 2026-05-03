import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { DocumentAnalysis, ClauseDetail, RiskLevel } from '../types';
import { ArrowLeft, AlertTriangle, ShieldAlert, Zap, FileText, ChevronRight, CheckCircle, Info } from 'lucide-react';

function RiskBadge({ level }: { level: RiskLevel }) {
  const cls = level === 'HIGH' ? 'badge-high' : level === 'MEDIUM' ? 'badge-medium' : 'badge-low';
  return <span className={`badge ${cls}`}>{level}</span>;
}

function ScoreBar({ score, level }: { score: number; level: RiskLevel }) {
  const color = level === 'HIGH' ? 'var(--risk-high)' : level === 'MEDIUM' ? 'var(--risk-medium)' : 'var(--risk-low)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

function ClauseCard({ clause, active, onClick }: { clause: ClauseDetail; active: boolean; onClick: () => void }) {
  const borderColor = clause.riskLevel === 'HIGH' ? 'var(--risk-high)' : clause.riskLevel === 'MEDIUM' ? 'var(--risk-medium)' : 'var(--risk-low)';
  return (
    <div onClick={onClick} style={{
      background: active ? 'rgba(99,102,241,0.1)' : 'var(--glass)',
      border: `1px solid ${active ? 'var(--primary)' : 'var(--glass-border)'}`,
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
      marginBottom: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {clause.type.replace(/_/g, ' ')}
          </span>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <RiskBadge level={clause.riskLevel} />
            {clause.isOneSided && <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', fontSize: 10 }}>⚖ One-Sided</span>}
            {clause.isUnusual && <span className="badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10 }}>★ Unusual</span>}
            {clause.deviationFlagged && <span className="badge" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)', fontSize: 10 }}>↕ Deviation</span>}
          </div>
        </div>
        <ChevronRight size={14} color={active ? 'var(--primary)' : 'var(--text-subtle)'} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {clause.extractedText}
      </p>
    </div>
  );
}

function ClauseDetail({ clause }: { clause: ClauseDetail }) {
  const borderColor = clause.riskLevel === 'HIGH' ? 'var(--risk-high)' : clause.riskLevel === 'MEDIUM' ? 'var(--risk-medium)' : 'var(--risk-low)';
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {clause.type.replace(/_/g, ' ')}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <RiskBadge level={clause.riskLevel} />
            {clause.isOneSided && <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>⚖ One-Sided</span>}
            {clause.isUnusual && <span className="badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>★ Unusual Term</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4 }}>Risk Score</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: borderColor }}>{clause.riskScore}</div>
        </div>
      </div>

      <ScoreBar score={clause.riskScore} level={clause.riskLevel} />

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Extracted Text</div>
        <div style={{ background: 'var(--bg-card)', borderLeft: `3px solid ${borderColor}`, borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>
          {clause.extractedText}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>AI Explanation</div>
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)' }}>
          {clause.explanation}
        </div>
      </div>

      {clause.isOneSided && clause.oneSidedExplanation && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>⚖ One-Sided Clause</div>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)' }}>
            {clause.oneSidedExplanation}
          </div>
        </div>
      )}

      {clause.isUnusual && clause.unusualExplanation && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>★ Unusual Term</div>
          <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)' }}>
            {clause.unusualExplanation}
          </div>
        </div>
      )}

      {clause.expectedStandardLanguage && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--risk-low)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Expected Standard Language</div>
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {clause.expectedStandardLanguage}
          </div>
        </div>
      )}

      {clause.templateSimilarityScore !== null && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Template Similarity</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{
                width: `${(clause.templateSimilarityScore * 100).toFixed(0)}%`,
                background: clause.deviationFlagged ? 'var(--risk-high)' : 'var(--risk-low)'
              }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: clause.deviationFlagged ? 'var(--risk-high)' : 'var(--risk-low)', minWidth: 36 }}>
              {(clause.templateSimilarityScore * 100).toFixed(0)}%
            </span>
            {clause.deviationFlagged && <span style={{ fontSize: 11, color: 'var(--risk-high)' }}>⚠ Below 75% threshold</span>}
          </div>
        </div>
      )}
    </div>
  );
}

type TabType = 'clauses' | 'missing' | 'onesided' | 'unusual';

export default function AnalysisViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('clauses');
  const [activeClause, setActiveClause] = useState<ClauseDetail | null>(null);
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getDocumentAnalysis(id).then(a => {
      setAnalysis(a);
      if (a.clauses.length > 0) setActiveClause(a.clauses[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading analysis...</p>
      </div>
    </div>
  );

  if (!analysis) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Document not found or analysis not available.</p>
      <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/documents')}>← Back to Documents</button>
    </div>
  );

  const riskColor = analysis.overallRiskLevel === 'HIGH' ? 'var(--risk-high)' : analysis.overallRiskLevel === 'MEDIUM' ? 'var(--risk-medium)' : 'var(--risk-low)';
  const filteredClauses = riskFilter ? analysis.clauses.filter(c => c.riskLevel === riskFilter) : analysis.clauses;
  const oneSidedClauses = analysis.clauses.filter(c => c.isOneSided);
  const unusualClauses = analysis.clauses.filter(c => c.isUnusual);

  const tabs: { id: TabType; label: string; count: number; icon: any }[] = [
    { id: 'clauses', label: 'All Clauses', count: analysis.clauseCount, icon: FileText },
    { id: 'missing', label: 'Missing', count: analysis.missingClauseCount, icon: AlertTriangle },
    { id: 'onesided', label: 'One-Sided', count: analysis.oneSidedClauseCount, icon: ShieldAlert },
    { id: 'unusual', label: 'Unusual Terms', count: analysis.unusualTermCount, icon: Zap },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button className="btn-ghost" style={{ padding: '6px 10px' }} onClick={() => navigate('/documents')}>
          <ArrowLeft size={14} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{analysis.filename}</div>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
            {analysis.clauseCount} clauses · Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Overall Risk</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: riskColor }}>{analysis.overallRiskScore}/100</div>
          </div>
          <span className={`badge ${analysis.overallRiskLevel === 'HIGH' ? 'badge-high' : analysis.overallRiskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`} style={{ fontSize: 13, padding: '5px 14px' }}>
            {analysis.overallRiskLevel}
          </span>
        </div>
      </div>

      {/* Body: split pane */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Clause List */}
        <div style={{ width: 380, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px', gap: 4, overflowX: 'auto', flexShrink: 0 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '12px 10px',
                fontSize: 12, fontWeight: 600, color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-subtle)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'color 0.15s'
              }}>
                <tab.icon size={12} />
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    background: tab.id === 'missing' && tab.count > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.15)',
                    color: tab.id === 'missing' && tab.count > 0 ? 'var(--risk-high)' : 'var(--primary)',
                    borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Filter (clauses tab only) */}
          {activeTab === 'clauses' && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <select className="input" style={{ fontSize: 12, padding: '7px 10px' }} value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                <option value="">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
          )}

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {activeTab === 'clauses' && filteredClauses.map(c => (
              <ClauseCard key={c.clauseId} clause={c} active={activeClause?.clauseId === c.clauseId} onClick={() => setActiveClause(c)} />
            ))}

            {activeTab === 'missing' && (
              analysis.missingClauses.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <CheckCircle size={32} color="var(--risk-low)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No missing clauses detected</p>
                </div>
              ) : analysis.missingClauses.map(mc => (
                <div key={mc.id} style={{
                  background: 'var(--glass)', border: '1px solid var(--glass-border)', borderLeft: `3px solid ${mc.severity === 'CRITICAL' ? 'var(--risk-high)' : mc.severity === 'IMPORTANT' ? 'var(--risk-medium)' : 'var(--risk-low)'}`,
                  borderRadius: 10, padding: '14px 16px', marginBottom: 8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {mc.clauseType.replace(/_/g, ' ')}
                    </span>
                    <span className="badge" style={{
                      background: mc.severity === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : mc.severity === 'IMPORTANT' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                      color: mc.severity === 'CRITICAL' ? 'var(--risk-high)' : mc.severity === 'IMPORTANT' ? 'var(--risk-medium)' : 'var(--risk-low)',
                      border: 'none', fontSize: 9
                    }}>{mc.severity}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{mc.explanation}</p>
                </div>
              ))
            )}

            {activeTab === 'onesided' && (
              oneSidedClauses.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <CheckCircle size={32} color="var(--risk-low)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No one-sided clauses detected</p>
                </div>
              ) : oneSidedClauses.map(c => (
                <ClauseCard key={c.clauseId} clause={c} active={activeClause?.clauseId === c.clauseId} onClick={() => { setActiveClause(c); setActiveTab('clauses'); }} />
              ))
            )}

            {activeTab === 'unusual' && (
              unusualClauses.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <CheckCircle size={32} color="var(--risk-low)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No unusual terms detected</p>
                </div>
              ) : unusualClauses.map(c => (
                <ClauseCard key={c.clauseId} clause={c} active={activeClause?.clauseId === c.clauseId} onClick={() => { setActiveClause(c); setActiveTab('clauses'); }} />
              ))
            )}
          </div>
        </div>

        {/* Right: Clause Detail */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {activeClause ? (
            <ClauseDetail clause={activeClause} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Info size={40} color="var(--text-subtle)" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: 'var(--text-muted)' }}>Select a clause to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
