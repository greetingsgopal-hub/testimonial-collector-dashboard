import { StorageAdapter } from './adapter';
import { Review, ReviewInput, ReviewStats, CollectionForm, Project, Campaign, CampaignInput, CampaignLog, CampaignLogInput } from '../../types';
import { INITIAL_REVIEWS } from '../seedData';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../security';
import { buildReviewEditUpdates } from '../contentIntegrity';

const STORAGE_KEY_PREFIX = 'pandapraise_testimonials_project_';
export class LocalStorageAdapter implements StorageAdapter {
  name = 'Local Storage (Development/Demo Mode)';
  isCloud = false;

  private getStorageKey(projectId?: string): string {
    return STORAGE_KEY_PREFIX + (projectId || 'default');
  }

  private loadReviews(projectId?: string): Review[] {
    try {
      const key = this.getStorageKey(projectId);
      const data = localStorage.getItem(key);
      if (!data) {
        // If this is a demo project or default, populate with demo reviews initially
        if (!projectId || projectId === 'proj-demo-1' || projectId === 'default') {
          const seeded = INITIAL_REVIEWS.map(r => ({ ...r, projectId: projectId || 'proj-demo-1' }));
          localStorage.setItem(key, JSON.stringify(seeded));
          return seeded;
        }
        return [];
      }
      return JSON.parse(data) as Review[];
    } catch (e) {
      console.error('Failed to parse reviews from localStorage', e);
      return [];
    }
  }

  private saveReviews(reviews: Review[], projectId?: string): void {
    try {
      const key = this.getStorageKey(projectId);
      localStorage.setItem(key, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save reviews to localStorage', e);
    }
  }

  async getReviews(projectId?: string): Promise<Review[]> {
    return this.loadReviews(projectId);
  }

  async getReviewById(id: string): Promise<Review | null> {
    // Search across active keys or default
    const reviews = this.loadReviews();
    return reviews.find(r => r.id === id) || null;
  }

  async createReview(input: ReviewInput, projectId?: string): Promise<Review> {
    const targetProject = projectId || input.projectId || 'proj-demo-1';
    const reviews = this.loadReviews(targetProject);
    
    const newReview: Review = {
      ...input,
      id: 'rev-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      projectId: targetProject,
      source: input.source || 'form',
      status: 'pending', // Public customer submissions ALWAYS start as pending
      isFeatured: false,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    this.saveReviews(reviews, targetProject);
    return newReview;
  }

  async bulkCreateReviews(inputs: ReviewInput[], projectId: string): Promise<Review[]> {
    const targetProject = projectId || 'proj-demo-1';
    const reviews = this.loadReviews(targetProject);
    const now = new Date().toISOString();
    const created: Review[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const newReview: Review = {
        ...input,
        id: 'rev-' + Math.random().toString(36).substring(2, 9) + (Date.now() + i).toString(36),
        projectId: targetProject,
        source: input.source || 'csv',
        status: input.status || 'approved',
        isFeatured: Boolean(input.isFeatured),
        helpfulCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      created.push(newReview);
      reviews.unshift(newReview);
    }

    this.saveReviews(reviews, targetProject);
    return created;
  }

  async evaluateAutoApproval(reviewId: string, projectId?: string): Promise<Review | null> {
    const targetProject = projectId || 'proj-demo-1';
    const reviews = this.loadReviews(targetProject);
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return null;

    // SECURITY: Never auto-approve negative feedback or low ratings
    if (rev.tags?.includes('private-feedback') || rev.rating <= 3) {
      return rev;
    }

    const form = await this.getCollectionForm(targetProject);
    if (form?.settings?.autoApprove && rev.rating >= 4) {
      return this.updateReview(reviewId, { status: 'approved', projectId: targetProject });
    }
    return rev;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const reviews = this.loadReviews(updates.projectId);
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Review with id ' + id + ' not found in project');
    }

    // Content integrity: same guard as the Firebase adapter — verbatim
    // sources reject content edits; owner-sourced edits are snapshotted and
    // disclosed.
    const guarded = buildReviewEditUpdates(reviews[index], updates);

    const updated: Review = {
      ...reviews[index],
      ...guarded,
      updatedAt: new Date().toISOString(),
    };

    reviews[index] = updated;
    this.saveReviews(reviews, updates.projectId || updated.projectId);
    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    const reviews = this.loadReviews();
    const filtered = reviews.filter(r => r.id !== id);
    if (filtered.length === reviews.length) {
      return false;
    }
    this.saveReviews(filtered);
    return true;
  }

  async getStats(projectId?: string): Promise<ReviewStats> {
    const reviews = this.loadReviews(projectId);
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'approved');
    const pending = reviews.filter(r => r.status === 'pending');
    const rejected = reviews.filter(r => r.status === 'rejected');
    const archived = reviews.filter(r => r.status === 'archived');
    const featured = reviews.filter(r => r.isFeatured);

    const sumRating = approved.length > 0 
      ? approved.reduce((acc, curr) => acc + curr.rating, 0)
      : 0;
    const averageRating = approved.length > 0 ? Number((sumRating / approved.length).toFixed(1)) : 0;

    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
      }
    }

    return {
      total,
      averageRating,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      archivedCount: archived.length,
      featuredCount: featured.length,
      ratingBreakdown,
    };
  }

  async resetToSampleData(projectId?: string): Promise<void> {
    const targetProject = projectId || 'proj-demo-1';
    const seeded = INITIAL_REVIEWS.map(r => ({ ...r, projectId: targetProject }));
    this.saveReviews(seeded, targetProject);
  }

  // Phase 2: Collection Form Management
  private getFormStorageKey(projectId?: string): string {
    return `pandapraise_collection_form_${projectId || 'default'}`;
  }

  async getCollectionForm(projectId?: string): Promise<CollectionForm | null> {
    const target = projectId || 'proj-demo-1';
    const key = this.getFormStorageKey(target);
    const data = localStorage.getItem(key);
    if (!data) {
      const defaultForm: CollectionForm = {
        id: 'form-' + target,
        projectId: target,
        publicSlug: target === 'proj-demo-1' ? 'feedback' : target + '-feedback',
        title: 'Share Your Experience with Panda Praise',
        description: 'Your honest feedback helps our team and community grow.',
        isActive: true,
        allowVideo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(defaultForm));
      return defaultForm;
    }
    try {
      const parsed = JSON.parse(data) as CollectionForm;
      if (parsed.title?.includes('Pulse') || parsed.publicSlug === 'pulse-feedback') {
        parsed.title = 'Share Your Experience with Panda Praise';
        if (parsed.publicSlug === 'pulse-feedback') parsed.publicSlug = 'feedback';
        localStorage.setItem(key, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async updateCollectionForm(id: string, updates: Partial<CollectionForm>): Promise<CollectionForm> {
    const target = updates.projectId || 'proj-demo-1';
    const key = this.getFormStorageKey(target);
    const existing = await this.getCollectionForm(target);
    const updated: CollectionForm = {
      ...(existing || {
        id,
        projectId: target,
        publicSlug: 'feedback',
        title: 'Share Your Experience',
        description: '',
        isActive: true,
        allowVideo: true,
        createdAt: new Date().toISOString(),
      }),
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }

  async getCollectionFormBySlug(publicSlug: string): Promise<{ form: CollectionForm; project: Project } | null> {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('pandapraise_form_') || key.startsWith('pandapraise_collection_form_'))) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const form = JSON.parse(val) as CollectionForm;
            if (form.publicSlug === publicSlug) {
              const cleanTitle = deduplicateRepeatedString(form.title) || 'Share Your Experience';
              const cleanBrand = cleanBrandOrProductName(form.settings?.brandName) || 'Panda Praise';
              return {
                form: {
                  ...form,
                  title: cleanTitle,
                },
                project: {
                  id: form.projectId,
                  workspaceId: 'ws-demo-1',
                  name: cleanBrand,
                  slug: 'demo-product',
                  createdAt: form.createdAt,
                }
              };
            }
          }
        } catch {
          // ignore
        }
      }
    }
    const demoForm = await this.getCollectionForm('proj-demo-1');
    if (demoForm && (demoForm.publicSlug === publicSlug || publicSlug === 'feedback' || publicSlug === 'pulse-feedback' || publicSlug === 'pandapraise-feedback' || publicSlug === 'pandapraise')) {
      return {
        form: {
          ...demoForm,
          publicSlug: publicSlug === 'pulse-feedback' ? 'feedback' : publicSlug,
          title: 'Share Your Experience with Panda Praise',
          description: 'Help other founders and creators discover how Panda Praise automates testimonial collection and social publishing.',
        },
        project: {
          id: 'proj-demo-1',
          workspaceId: 'ws-demo-1',
          name: 'Panda Praise',
          slug: 'pandapraise',
          websiteUrl: 'https://pandapraise.com',
          createdAt: demoForm.createdAt,
        }
      };
    }
    return null;
  }

  async createCollectionForm(form: Omit<CollectionForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionForm> {
    const newId = 'form-' + Math.random().toString(36).substring(2, 9);
    const created: CollectionForm = {
      ...form,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const key = this.getFormStorageKey(form.projectId);
    localStorage.setItem(key, JSON.stringify(created));
    return created;
  }

  // ── Automated Review Campaigns ───────────────────────────
  private getCampaignStorageKey(projectId?: string): string {
    return 'pandapraise_campaigns_' + (projectId || 'default');
  }

  private getLogsStorageKey(projectId?: string): string {
    return 'pandapraise_campaign_logs_' + (projectId || 'default');
  }

  async getCampaigns(projectId?: string): Promise<Campaign[]> {
    try {
      const key = this.getCampaignStorageKey(projectId);
      const raw = localStorage.getItem(key);
      if (!raw) {
        // Seed default starter campaigns for out-of-the-box delight
        const defaultCampaigns: Campaign[] = [
          {
            id: 'camp-default-email',
            projectId: projectId || 'proj-demo-1',
            ownerId: 'demo-user',
            name: 'Post-Purchase Email Delight',
            channel: 'email',
            status: 'active',
            triggerType: 'webhook',
            delayDays: 3,
            template: {
              subject: 'How was your recent purchase with {{company_name}}?',
              messageBody: 'Hi {{customer_name}},\n\nThank you for choosing {{company_name}}! We hope you are loving your {{product_name}}.\n\nCould you take 60 seconds to share your feedback with us? It means the world to our small team!\n\nCheers,\n{{company_name}} Team',
              ctaText: 'Share Your Experience',
              senderName: 'Panda Praise Team',
            },
            stats: { sent: 48, opened: 32, clicked: 24, converted: 18 },
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'camp-default-whatsapp',
            projectId: projectId || 'proj-demo-1',
            ownerId: 'demo-user',
            name: 'WhatsApp Fast Feedback',
            channel: 'whatsapp',
            status: 'active',
            triggerType: 'webhook',
            delayDays: 1,
            template: {
              messageBody: 'Hey {{customer_name}}! 👋 Thank you for ordering from {{company_name}}. How has your experience been so far with {{product_name}}? Let us know in 1 quick click!',
              ctaText: 'Give Quick Feedback',
            },
            stats: { sent: 35, opened: 33, clicked: 28, converted: 22 },
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(key, JSON.stringify(defaultCampaigns));
        return defaultCampaigns;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    if (typeof localStorage === 'undefined') return null;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('pandapraise_campaigns_')) {
        try {
          const list: Campaign[] = JSON.parse(localStorage.getItem(k) || '[]');
          const found = list.find((c) => c.id === id);
          if (found) return found;
        } catch {
          // ignore
        }
      }
    }
    const list = await this.getCampaigns('proj-demo-1');
    return list.find((c) => c.id === id) || null;
  }

  async createCampaign(campaign: CampaignInput, projectId?: string): Promise<Campaign> {
    const pId = projectId || campaign.projectId || 'proj-demo-1';
    const list = await this.getCampaigns(pId);
    const newCampaign: Campaign = {
      ...campaign,
      id: 'camp-' + Math.random().toString(36).substring(2, 9),
      projectId: pId,
      stats: { sent: 0, opened: 0, clicked: 0, converted: 0, ...(campaign.stats || {}) },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newCampaign, ...list];
    localStorage.setItem(this.getCampaignStorageKey(pId), JSON.stringify(updated));
    return newCampaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('pandapraise_campaigns_')) {
          try {
            const list: Campaign[] = JSON.parse(localStorage.getItem(k) || '[]');
            const idx = list.findIndex((c) => c.id === id);
            if (idx !== -1) {
              const updated: Campaign = {
                ...list[idx],
                ...updates,
                updatedAt: new Date().toISOString(),
              };
              list[idx] = updated;
              localStorage.setItem(k, JSON.stringify(list));
              return updated;
            }
          } catch {
            // ignore
          }
        }
      }
    }
    const list = await this.getCampaigns('proj-demo-1');
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const updated: Campaign = {
        ...list[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      localStorage.setItem(this.getCampaignStorageKey('proj-demo-1'), JSON.stringify(list));
      return updated;
    }
    throw new Error('Campaign not found');
  }

  async deleteCampaign(id: string): Promise<boolean> {
    if (typeof localStorage === 'undefined') return false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('pandapraise_campaigns_')) {
        try {
          const list: Campaign[] = JSON.parse(localStorage.getItem(k) || '[]');
          const filtered = list.filter((c) => c.id !== id);
          if (filtered.length !== list.length) {
            localStorage.setItem(k, JSON.stringify(filtered));
            return true;
          }
        } catch {
          // ignore
        }
      }
    }
    return false;
  }

  async getCampaignLogs(campaignId?: string, projectId?: string): Promise<CampaignLog[]> {
    try {
      const key = this.getLogsStorageKey(projectId);
      const raw = localStorage.getItem(key);
      const logs: CampaignLog[] = raw ? JSON.parse(raw) : [];
      if (campaignId) {
        return logs.filter((l) => l.campaignId === campaignId);
      }
      return logs;
    } catch {
      return [];
    }
  }

  async createCampaignLog(log: CampaignLogInput): Promise<CampaignLog> {
    const pId = log.projectId || 'proj-demo-1';
    const logs = await this.getCampaignLogs(undefined, pId);
    const newLog: CampaignLog = {
      ...log,
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [newLog, ...logs];
    localStorage.setItem(this.getLogsStorageKey(pId), JSON.stringify(updated));
    return newLog;
  }

  async updateCampaignLog(id: string, updates: Partial<CampaignLog>): Promise<CampaignLog> {
    const pId = updates.projectId || 'proj-demo-1';
    const logs = await this.getCampaignLogs(undefined, pId);
    let target: CampaignLog | null = null;
    const updated = logs.map((l) => {
      if (l.id === id) {
        target = { ...l, ...updates };
        return target;
      }
      return l;
    });
    if (!target) throw new Error('Campaign log not found');
    localStorage.setItem(this.getLogsStorageKey(pId), JSON.stringify(updated));
    return target;
  }
}

