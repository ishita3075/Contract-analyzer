import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  User, LoginRequest, RegisterRequest, DocumentSummary,
  DocumentAnalysis, Page, AuditLog, ClauseTemplate, UploadResponse, ClauseDetail
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: BASE_URL });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(data: LoginRequest): Promise<User> {
    const res = await this.client.post<User>('/auth/login', data);
    return res.data;
  }

  async register(data: RegisterRequest): Promise<User> {
    const res = await this.client.post<User>('/auth/register', data);
    return res.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    localStorage.clear();
  }

  // Documents
  async uploadDocument(file: File, onProgress?: (pct: number) => void): Promise<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    const res = await this.client.post<UploadResponse>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return res.data;
  }

  async listDocuments(page = 0, size = 20, search?: string): Promise<Page<DocumentSummary>> {
    const params: Record<string, string | number> = { page, size };
    if (search) params.search = search;
    const res = await this.client.get<Page<DocumentSummary>>('/documents', { params });
    return res.data;
  }

  async getDocument(id: string): Promise<DocumentSummary> {
    const res = await this.client.get<DocumentSummary>(`/documents/${id}`);
    return res.data;
  }

  async getDocumentAnalysis(id: string): Promise<DocumentAnalysis> {
    const res = await this.client.get<DocumentAnalysis>(`/documents/${id}/analysis`);
    return res.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.client.delete(`/documents/${id}`);
  }

  // Clauses
  async getClauses(documentId: string, type?: string, riskLevel?: string): Promise<ClauseDetail[]> {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (riskLevel) params.riskLevel = riskLevel;
    const res = await this.client.get<ClauseDetail[]>(`/documents/${documentId}/clauses`, { params });
    return res.data;
  }

  async reviewClause(clauseId: string, reviewerNotes: string, reviewed: boolean): Promise<ClauseDetail> {
    const res = await this.client.patch<ClauseDetail>(`/clauses/${clauseId}/review`, { reviewerNotes, reviewed });
    return res.data;
  }

  // Templates
  async listTemplates(): Promise<ClauseTemplate[]> {
    const res = await this.client.get<ClauseTemplate[]>('/templates');
    return res.data;
  }

  async createTemplate(data: { clauseType: string; name: string; standardText: string; description?: string }): Promise<ClauseTemplate> {
    const res = await this.client.post<ClauseTemplate>('/templates', data);
    return res.data;
  }

  async updateTemplate(id: string, data: Partial<ClauseTemplate>): Promise<ClauseTemplate> {
    const res = await this.client.put<ClauseTemplate>(`/templates/${id}`, data);
    return res.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.client.delete(`/templates/${id}`);
  }

  // Audit
  async getAuditLogs(page = 0, size = 50): Promise<Page<AuditLog>> {
    const res = await this.client.get<Page<AuditLog>>('/audit/logs', { params: { page, size } });
    return res.data;
  }

  async getDocumentAuditLogs(documentId: string): Promise<AuditLog[]> {
    const res = await this.client.get<AuditLog[]>(`/audit/logs/${documentId}`);
    return res.data;
  }
}

export const api = new ApiClient();
