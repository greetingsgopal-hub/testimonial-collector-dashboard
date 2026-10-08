import { Review } from '../types';

export const SAMPLE_REVIEWS_STORAGE_PREFIX = 'panda_praise_sample_cleared_';

export function isSampleDataCleared(projectId?: string): boolean {
  if (!projectId) return false;
  try {
    return localStorage.getItem(`${SAMPLE_REVIEWS_STORAGE_PREFIX}${projectId}`) === 'true';
  } catch {
    return false;
  }
}

export function setSampleDataCleared(projectId: string, cleared: boolean): void {
  try {
    if (cleared) {
      localStorage.setItem(`${SAMPLE_REVIEWS_STORAGE_PREFIX}${projectId}`, 'true');
    } else {
      localStorage.removeItem(`${SAMPLE_REVIEWS_STORAGE_PREFIX}${projectId}`);
    }
  } catch {}
}

export function getSampleReviews(projectId: string = 'demo_project'): Review[] {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: `sample_rev_1_${projectId}`,
      projectId,
      authorName: 'Sarah Jenkins',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@brightscale.io',
      role: 'VP of Marketing',
      company: 'BrightScale',
      rating: 5,
      content:
        'Panda Praise doubled our landing page conversion rate in the first week. The Wall of Love was live on our site in under 3 minutes and looks stunning.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      status: 'approved',
      isFeatured: true,
      isSample: true,
      tags: ['Conversion', 'SaaS', 'Wall of Love'],
      source: 'sample',
      type: 'text',
      consent: true,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: `sample_rev_2_${projectId}`,
      projectId,
      authorName: 'David Chen',
      name: 'David Chen',
      email: 'david@saaslaunch.co',
      role: 'Founder & CEO',
      company: 'SaaSLaunch',
      rating: 5,
      content:
        'The automated Google & Meta import feature saved our team hours of manual screenshotting. Setup was ridiculously seamless and frictionless.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      status: 'approved',
      isFeatured: true,
      isSample: true,
      tags: ['Automation', 'Google Reviews'],
      source: 'sample',
      type: 'text',
      consent: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
    {
      id: `sample_rev_3_${projectId}`,
      projectId,
      authorName: 'Elena Rostova',
      name: 'Elena Rostova',
      email: 'elena@cloudflow.app',
      role: 'Head of Product',
      company: 'CloudFlow',
      rating: 5,
      content:
        'Collecting video and verified reviews has never been this effortless. Our customers actually love submitting feedback now because of the clean flow.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      status: 'approved',
      isFeatured: true,
      isSample: true,
      tags: ['Video Proof', 'UX'],
      source: 'sample',
      type: 'text',
      consent: true,
      createdAt: oneWeekAgo,
      updatedAt: oneWeekAgo,
    },
  ];
}
