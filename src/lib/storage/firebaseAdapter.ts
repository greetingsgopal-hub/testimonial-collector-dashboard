import { StorageAdapter } from './adapter';
import { Review, ReviewInput, ReviewStats, CollectionForm, Project } from '../../types';
import { getFirebaseDb, getFirebaseAuth } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';

export class FirebaseAdapter implements StorageAdapter {
  name = 'Firebase Cloud Firestore (Multi-Tenant)';
  isCloud = true;

  private mapDocToReview(id: string, data: any): Review {
    return {
      id,
      projectId: data.projectId,
      collectionFormId: data.collectionFormId,
      name: data.name,
      email: data.email || '',
      role: data.role || '',
      company: data.company || undefined,
      avatarUrl: data.avatarUrl || undefined,
      rating: Number(data.rating || 5),
      title: data.title || undefined,
      content: data.content || '',
      type: data.type || 'text',
      videoUrl: data.videoUrl || undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
      source: data.source || 'form',
      status: data.status || (!data.email ? 'approved' : 'pending'),
      isFeatured: Boolean(data.isFeatured),
      consent: Boolean(data.consent),
      helpfulCount: data.helpfulCount || 0,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
    };
  }

  async getReviews(projectId?: string): Promise<Review[]> {
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      let q = query(collection(db, 'reviews'), where('ownerId', '==', currentUser.uid));
      if (projectId) {
        q = query(collection(db, 'reviews'), where('ownerId', '==', currentUser.uid), where('projectId', '==', projectId));
      }
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => this.mapDocToReview(docSnap.id, docSnap.data()));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (!projectId) {
      return [];
    }

    const qByProj = query(
      collection(db, 'public_reviews'),
      where('projectId', '==', projectId),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(qByProj);
    const list = snapshot.docs.map((docSnap) => this.mapDocToReview(docSnap.id, docSnap.data()));

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReviewById(id: string): Promise<Review | null> {
    const db = getFirebaseDb();
    const privateRef = doc(db, 'reviews', id);
    const privateSnap = await getDoc(privateRef);
    if (privateSnap.exists()) {
      return this.mapDocToReview(privateSnap.id, privateSnap.data());
    }

    const publicRef = doc(db, 'public_reviews', id);
    const publicSnap = await getDoc(publicRef);
    if (publicSnap.exists()) {
      return this.mapDocToReview(publicSnap.id, publicSnap.data());
    }

    return null;
  }

  async createReview(review: ReviewInput, projectId?: string): Promise<Review> {
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    let targetProjectId = projectId || review.projectId || 'default-project';
    let targetOwnerId = currentUser?.uid || '';

    if (review.collectionFormId) {
      try {
        const formSnap = await getDoc(doc(db, 'collection_forms', review.collectionFormId));
        if (formSnap.exists()) {
          const formData = formSnap.data();
          if (formData?.ownerId) targetOwnerId = formData.ownerId;
          if (formData?.projectId) targetProjectId = formData.projectId;
        }
      } catch (err) {
        console.warn('[FirebaseAdapter] Could not pre-fetch collectionForm owner/project:', err);
      }
    }

    const reviewRef = doc(collection(db, 'reviews'));
    const now = new Date().toISOString();

    const reviewData = {
      projectId: targetProjectId,
      collectionFormId: review.collectionFormId || null,
      ownerId: targetOwnerId,
      name: review.name,
      email: review.email,
      role: review.role,
      company: review.company || null,
      avatarUrl: review.avatarUrl || null,
      rating: Number(review.rating),
      title: review.title || null,
      content: review.content,
      type: review.type || 'text',
      videoUrl: review.videoUrl || null,
      tags: review.tags || [],
      source: review.source || 'form',
      status: review.status || 'pending',
      isFeatured: Boolean(review.isFeatured),
      consent: Boolean(review.consent),
      helpfulCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(reviewRef, reviewData);

    const created = this.mapDocToReview(reviewRef.id, reviewData);

    if (created.status === 'approved') {
      await this.syncPublicReview(reviewRef.id, created, targetOwnerId);
    }

    return created;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    const reviewRef = doc(db, 'reviews', id);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error(`Review with ID "${id}" was not found.`);
    }

    const currentData = reviewSnap.data();
    const now = new Date().toISOString();

    const updatePayload: any = {
      updatedAt: now,
    };

    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.role !== undefined) updatePayload.role = updates.role;
    if (updates.company !== undefined) updatePayload.company = updates.company;
    if (updates.avatarUrl !== undefined) updatePayload.avatarUrl = updates.avatarUrl;
    if (updates.rating !== undefined) updatePayload.rating = Number(updates.rating);
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.isFeatured !== undefined) updatePayload.isFeatured = updates.isFeatured;
    if (updates.tags !== undefined) updatePayload.tags = updates.tags;

    await updateDoc(reviewRef, updatePayload);

    const mergedData = { ...currentData, ...updatePayload };
    const updated = this.mapDocToReview(id, mergedData);
    const ownerId = currentData.ownerId || currentUser?.uid || '';

    if (updated.status === 'approved') {
      await this.syncPublicReview(id, updated, ownerId);
    } else {
      await this.removePublicReview(id);
    }

    return updated;
  }

  private async syncPublicReview(id: string, review: Review, ownerId: string): Promise<void> {
    const db = getFirebaseDb();
    const publicRef = doc(db, 'public_reviews', id);

    const publicData = {
      projectId: review.projectId,
      collectionFormId: review.collectionFormId || null,
      ownerId: ownerId,
      name: review.name,
      role: review.role,
      company: review.company || null,
      avatarUrl: review.avatarUrl || null,
      rating: review.rating,
      title: review.title || null,
      content: review.content,
      type: review.type,
      videoUrl: review.videoUrl || null,
      tags: review.tags,
      isFeatured: review.isFeatured,
      status: 'approved',
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    await setDoc(publicRef, publicData, { merge: true });
  }

  private async removePublicReview(id: string): Promise<void> {
    const db = getFirebaseDb();
    try {
      const publicRef = doc(db, 'public_reviews', id);
      await deleteDoc(publicRef);
    } catch {
      // Ignore if document did not exist
    }
  }

  async deleteReview(id: string): Promise<boolean> {
    const db = getFirebaseDb();
    const reviewRef = doc(db, 'reviews', id);
    await deleteDoc(reviewRef);
    await this.removePublicReview(id);
    return true;
  }

  async getStats(projectId?: string): Promise<ReviewStats> {
    const reviews = await this.getReviews(projectId);
    const total = reviews.length;
    const approved = reviews.filter((r) => r.status === 'approved');
    const pending = reviews.filter((r) => r.status === 'pending');
    const rejected = reviews.filter((r) => r.status === 'rejected');
    const archived = reviews.filter((r) => r.status === 'archived');
    const featured = reviews.filter((r) => r.isFeatured);

    const averageRating =
      total > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
        : 0;

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

  async getCollectionFormBySlug(publicSlug: string): Promise<{ form: CollectionForm; project: Project } | null> {
    const db = getFirebaseDb();

    const q = query(
      collection(db, 'collection_forms'),
      where('publicSlug', '==', publicSlug),
      where('isActive', '==', true),
      limit(1)
    );

    const createLegacyPulseForm = () => {
      const now = new Date().toISOString();
      return {
        form: {
          id: 'form-pulse-feedback',
          projectId: 'proj-demo-1',
          publicSlug: 'pulse-feedback',
          title: 'Share Your Experience',
          description: 'Your honest feedback helps our team and community grow.',
          isActive: true,
          allowVideo: true,
          settings: {},
          createdAt: now,
          updatedAt: now,
        },
        project: {
          id: 'proj-demo-1',
          workspaceId: 'ws-demo-1',
          name: 'Pulse AI Product',
          slug: 'pulse-ai',
          createdAt: now,
        },
      };
    };

    try {
      const formSnapshot = await getDocs(q);

      if (formSnapshot.empty) {
        if (publicSlug === 'pulse-feedback') {
          return createLegacyPulseForm();
        }
        return null;
      }

      const formDoc = formSnapshot.docs[0];
      const formData = formDoc.data();

      const form: CollectionForm = {
        id: formDoc.id,
        projectId: formData.projectId,
        publicSlug: formData.publicSlug,
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
        allowVideo: formData.allowVideo,
        settings: formData.settings,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt,
      };

      const project: Project = {
        id: formData.projectId,
        workspaceId: '',
        name: formData.publicBrandName || formData.settings?.brandName || formData.title || 'Customer Testimonials',
        slug: formData.publicSlug || 'testimonials',
        websiteUrl: formData.settings?.websiteUrl,
        createdAt: formData.createdAt,
      };

      return { form, project };
    } catch (error) {
      // Keep the legacy/demo link usable while Firestore rules are being migrated.
      if (publicSlug === 'pulse-feedback') {
        console.warn('[Firebase] Using legacy pulse-feedback fallback after Firestore error:', error);
        return createLegacyPulseForm();
      }
      throw error;
    }
  }

  async getCollectionForm(projectId?: string): Promise<CollectionForm | null> {
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    let q = query(collection(db, 'collection_forms'));
    if (projectId) {
      q = query(collection(db, 'collection_forms'), where('projectId', '==', projectId));
    } else if (currentUser) {
      q = query(collection(db, 'collection_forms'), where('ownerId', '==', currentUser.uid));
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      projectId: data.projectId,
      publicSlug: data.publicSlug,
      title: data.title,
      description: data.description,
      isActive: data.isActive,
      allowVideo: data.allowVideo,
      settings: data.settings,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async updateCollectionForm(id: string, updates: Partial<CollectionForm>): Promise<CollectionForm> {
    const db = getFirebaseDb();
    const formRef = doc(db, 'collection_forms', id);
    const formSnap = await getDoc(formRef);

    if (!formSnap.exists()) {
      throw new Error(`Collection form with ID "${id}" was not found.`);
    }

    const currentData = formSnap.data();
    const now = new Date().toISOString();

    const updatePayload: any = {
      updatedAt: now,
    };

    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.publicSlug !== undefined) updatePayload.publicSlug = updates.publicSlug;
    if (updates.isActive !== undefined) updatePayload.isActive = updates.isActive;
    if (updates.allowVideo !== undefined) updatePayload.allowVideo = updates.allowVideo;
    if (updates.settings !== undefined) updatePayload.settings = updates.settings;

    await updateDoc(formRef, updatePayload);

    const merged = { ...currentData, ...updatePayload };
    return {
      id,
      projectId: merged.projectId,
      publicSlug: merged.publicSlug,
      title: merged.title,
      description: merged.description,
      isActive: merged.isActive,
      allowVideo: merged.allowVideo,
      settings: merged.settings,
      createdAt: merged.createdAt,
      updatedAt: merged.updatedAt,
    };
  }

  async createCollectionForm(form: Omit<CollectionForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionForm> {
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    const formRef = doc(collection(db, 'collection_forms'));
    const now = new Date().toISOString();

    const data = {
      projectId: form.projectId,
      ownerId: currentUser?.uid || '',
      publicSlug: form.publicSlug,
      title: form.title,
      description: form.description,
      isActive: form.isActive ?? true,
      allowVideo: form.allowVideo ?? true,
      settings: form.settings || {},
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(formRef, data);

    return {
      id: formRef.id,
      ...data,
    };
  }
}
