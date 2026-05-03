// Shared TypeScript types matching backend DTOs

export interface User {
  userId: string;
  email: string;
  name: string;
  role: 'VIEWER' | 'REVIEWER' | 'ADMIN';
  orgId: string;
  orgName: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; name: string; orgName?: string; }

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AnalysisStatus = 'UPLOADED' | 'PARSING' | 'ANALYZING' | 'ANALYZED' | 'FAILED';

export interface DocumentSummary {
  id: string;
  filename: string;
  contentType: string;
  fileSizeBytes: number;
  status: AnalysisStatus;
  overallRiskScore: number | null;
  overallRiskLevel: RiskLevel | null;
  clauseCount: number;
  missingClauseCount: number;
  oneSidedClauseCount?: number;
  unusualTermCount?: number;
  createdAt: string;
  analyzedAt: string | null;
  uploadedBy: string;
}

export interface ClauseDetail {
  clauseId: string;
  type: string;
  extractedText: string;
  riskLevel: RiskLevel;
  riskScore: number;
  explanation: string;
  templateSimilarityScore: number | null;
  deviationFlagged: boolean;
  isOneSided: boolean;
  oneSidedExplanation: string | null;
  isUnusual: boolean;
  unusualExplanation: string | null;
  expectedStandardLanguage: string | null;
  reviewed: boolean;
  reviewerNotes: string | null;
}

export interface MissingClause {
  id: string;
  clauseType: string;
  severity: 'CRITICAL' | 'IMPORTANT' | 'RECOMMENDED';
  explanation: string;
}

export interface DocumentAnalysis {
  documentId: string;
  filename: string;
  overallRiskScore: number;
  overallRiskLevel: RiskLevel;
  clauseCount: number;
  missingClauseCount: number;
  oneSidedClauseCount: number;
  unusualTermCount: number;
  oneSidedClausesSummary?: string;
  unusualTermsSummary?: string;
  clauses: ClauseDetail[];
  missingClauses: MissingClause[];
  analyzedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuditLog {
  id: string;
  eventType: string;
  actorName: string;
  actorEmail: string;
  documentId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface ClauseTemplate {
  id: string;
  clauseType: string;
  name: string;
  standardText: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  documentId: string;
  filename: string;
  status: string;
  message: string;
}
