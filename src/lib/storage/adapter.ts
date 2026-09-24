import {
  Review, ReviewInput, ReviewStats,
  CollectionForm, Project, Workspace,
  TeamMember, TeamInvitation, ImportJob,
  WallOfLoveConfig, WebhookConfig, ApiKey,
} from '../../types';

export interface StorageAdapter {
  name: string;
  isCloud: boolean;

  // ── Reviews (existing) ──────────────────────────────────
  getReviews(projectId?: string): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | null>;
  createReview(review: ReviewInput, projectId?: string): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;
  deleteReview(id: string): Promise<boolean>;
  getStats(projectId?: string): Promise<ReviewStats>;
  evaluateAutoApproval?(reviewId: string, projectId?: string): Promise<Review | null>;
  resetToSampleData?(projectId?: string): Promise<void>;
  bulkCreateReviews?(reviews: ReviewInput[], projectId: string): Promise<Review[]>;

  // ── Collection Forms (existing) ─────────────────────────
  getCollectionForm(projectId?: string): Promise<CollectionForm | null>;
  getCollectionFormBySlug(publicSlug: string): Promise<{ form: CollectionForm; project: Project } | null>;
  updateCollectionForm(id: string, updates: Partial<CollectionForm>): Promise<CollectionForm>;
  createCollectionForm(form: Omit<CollectionForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionForm>;

  // ── Workspace Management ────────────────────────────────
  getWorkspace?(workspaceId: string): Promise<Workspace | null>;
  getWorkspacesByOwner?(ownerId: string): Promise<Workspace[]>;
  createWorkspace?(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace>;
  updateWorkspace?(id: string, updates: Partial<Workspace>): Promise<Workspace>;
  deleteWorkspace?(id: string): Promise<boolean>;

  // ── Project Management ──────────────────────────────────
  getProjects?(workspaceId: string): Promise<Project[]>;
  getProjectById?(id: string): Promise<Project | null>;
  createProject?(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject?(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject?(id: string): Promise<boolean>;

  // ── Team Management ─────────────────────────────────────
  getTeamMembers?(workspaceId: string): Promise<TeamMember[]>;
  inviteTeamMember?(invitation: Omit<TeamInvitation, 'id' | 'createdAt' | 'token'>): Promise<TeamInvitation>;
  acceptTeamInvitation?(token: string, userId: string): Promise<TeamMember>;
  removeTeamMember?(id: string): Promise<boolean>;
  updateTeamMemberRole?(id: string, role: TeamMember['role']): Promise<TeamMember>;

  // ── Import Jobs ─────────────────────────────────────────
  createImportJob?(job: Omit<ImportJob, 'id' | 'createdAt'>): Promise<ImportJob>;
  getImportJobs?(workspaceId: string): Promise<ImportJob[]>;
  updateImportJob?(id: string, updates: Partial<ImportJob>): Promise<ImportJob>;

  // ── Wall of Love ────────────────────────────────────────
  getWallOfLoveConfig?(projectId: string): Promise<WallOfLoveConfig | null>;
  getWallOfLoveBySlug?(slug: string): Promise<WallOfLoveConfig | null>;
  createWallOfLoveConfig?(config: Omit<WallOfLoveConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WallOfLoveConfig>;
  updateWallOfLoveConfig?(id: string, updates: Partial<WallOfLoveConfig>): Promise<WallOfLoveConfig>;

  // ── Webhooks ────────────────────────────────────────────
  getWebhooks?(workspaceId: string): Promise<WebhookConfig[]>;
  createWebhook?(webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt' | 'failureCount'>): Promise<WebhookConfig>;
  updateWebhook?(id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig>;
  deleteWebhook?(id: string): Promise<boolean>;

  // ── API Keys ────────────────────────────────────────────
  getApiKeys?(workspaceId: string): Promise<ApiKey[]>;
  createApiKey?(key: Omit<ApiKey, 'id' | 'createdAt'>): Promise<ApiKey & { rawKey: string }>;
  revokeApiKey?(id: string): Promise<boolean>;
}
