import { StorageAdapter } from './adapter';
import { Review, ReviewInput, ReviewStats, CollectionForm, Project } from '../../types';
import { getSupabase } from '../supabaseClient';

export class SupabaseAdapter implements StorageAdapter {
  name = 'Supabase Cloud (Multi-Tenant PostgreSQL)';
  isCloud = true;

  private mapRowToReview(row: any): Review {
    return {
      id: row.id,
      projectId: row.project_id,
      collectionFormId: row.collection_form_id,
      name: row.name,
      email: row.email || '', // Stripped by DB RPC for anonymous visitors
      role: row.role,
      company: row.company || undefined,
      avatarUrl: row.avatar_url || undefined,
      rating: Number(row.rating),
      title: row.title || undefined,
      content: row.content,
      type: row.type || 'text',
      videoUrl: row.video_url || undefined,
      tags: Array.isArray(row.tags) ? row.tags : [],
      source: row.source || 'form',
      status: row.status || 'pending',
      isFeatured: Boolean(row.is_featured),
      consent: Boolean(row.consent),
      helpfulCount: row.helpful_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapReviewToRow(review: Partial<ReviewInput | Review>, projectId?: string): any {
    const row: any = {};
    if (projectId || review.projectId) {
      row.project_id = projectId || review.projectId;
    }
    if (review.collectionFormId !== undefined) row.collection_form_id = review.collectionFormId;
    if (review.name !== undefined) row.name = review.name;
    if (review.email !== undefined) row.email = review.email;
    if (review.role !== undefined) row.role = review.role;
    if (review.company !== undefined) row.company = review.company;
    if (review.avatarUrl !== undefined) row.avatar_url = review.avatarUrl;
    if (review.rating !== undefined) row.rating = review.rating;
    if (review.title !== undefined) row.title = review.title;
    if (review.content !== undefined) row.content = review.content;
    if (review.type !== undefined) row.type = review.type;
    if (review.videoUrl !== undefined) row.video_url = review.videoUrl;
    if (review.tags !== undefined) row.tags = review.tags;
    if (review.source !== undefined) row.source = review.source;
    if (review.status !== undefined) row.status = review.status;
    if (review.isFeatured !== undefined) row.is_featured = review.isFeatured;
    if (review.consent !== undefined) row.consent = review.consent;
    return row;
  }

  async getReviews(projectId?: string): Promise<Review[]> {
    const supabase = getSupabase();

    // Determine authentication context
    const { data: { session } } = await supabase.auth.getSession();

    // 1. ANONYMOUS VISITOR (e.g. Embedded Widget or Public Page)
    if (!session) {
      // Must provide a target project ID; anonymous callers cannot list all reviews across the DB
      if (!projectId) {
        console.warn('[Security] Anonymous queries without specific target project ID are rejected.');
        return [];
      }

      // Query through the secure database RPC function
      // Enforces:
      // - target project must have an active collection form
      // - returns only reviews where status = 'approved'
      // - strictly omits private customer emails and metadata at SQL engine level
      const { data, error } = await supabase.rpc('get_public_approved_reviews', {
        target_project_id: projectId,
      });

      if (error) {
        console.error('[Security] Failed to load public reviews via secure RPC:', error);
        throw new Error(`Failed to load public reviews: ${error.message}`);
      }

      return (data || []).map(this.mapRowToReview);
    }

    // 2. AUTHENTICATED TENANT OWNER (Dashboard)
    // Governed by PostgreSQL RLS reviews_owner_manage policy
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to load reviews from Supabase: ${error.message}`);
    }
    return (data || []).map(this.mapRowToReview);
  }

  async getReviewById(id: string): Promise<Review | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToReview(data);
  }

  async createReview(input: ReviewInput, projectId?: string): Promise<Review> {
    const supabase = getSupabase();
    const targetProjectId = projectId || input.projectId;
    
    if (!targetProjectId) {
      throw new Error('Project ID is required to create a testimonial in a multi-tenant workspace.');
    }

    const payload = this.mapReviewToRow(
      {
        ...input,
        status: input.status || 'pending',
        consent: true,
        isFeatured: false,
        source: input.source || 'form',
      },
      targetProjectId
    );

    const { data, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit testimonial: ${error.message}`);
    }

    return this.mapRowToReview(data);
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const supabase = getSupabase();
    const payload = this.mapReviewToRow(updates);

    const { data, error } = await supabase
      .from('reviews')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }

    return this.mapRowToReview(data);
  }

  async deleteReview(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
    return true;
  }

  async getStats(projectId?: string): Promise<ReviewStats> {
    const reviews = await this.getReviews(projectId);
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

  // Public helper to resolve form slug for public /c/:slug route
  async getCollectionFormBySlug(publicSlug: string): Promise<{ form: CollectionForm; project: Project } | null> {
    const supabase = getSupabase();
    
    // 1. Fetch form
    const { data: formData, error: formError } = await supabase
      .from('collection_forms')
      .select('*')
      .eq('public_slug', publicSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (formError || !formData) return null;

    // 2. Fetch project
    const { data: projectData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', formData.project_id)
      .maybeSingle();

    if (projError || !projectData) return null;

    return {
      form: {
        id: formData.id,
        projectId: formData.project_id,
        publicSlug: formData.public_slug,
        title: formData.title,
        description: formData.description,
        isActive: formData.is_active,
        allowVideo: formData.allow_video,
        settings: formData.settings,
        createdAt: formData.created_at,
        updatedAt: formData.updated_at,
      },
      project: {
        id: projectData.id,
        workspaceId: projectData.workspace_id,
        name: projectData.name,
        slug: projectData.slug,
        websiteUrl: projectData.website_url,
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at,
      },
    };
  }
}
