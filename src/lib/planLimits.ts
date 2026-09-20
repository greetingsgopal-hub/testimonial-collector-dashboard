/**
 * Plan limits utilities for feature gating throughout the app.
 * Use these helpers to check if a user can access a feature or has hit a limit.
 */
import { PlanTier, PlanLimits, PLAN_LIMITS, Workspace } from '../types';

export interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: PlanTier;
}

/** Get the limits object for a given plan tier */
export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan];
}

/** Check if a boolean feature is available on the plan */
export function checkFeatureAccess(workspace: Workspace | null, feature: keyof PlanLimits): PlanCheckResult {
  if (!workspace) return { allowed: false, reason: 'No workspace found' };

  const limits = PLAN_LIMITS[workspace.plan];
  const value = limits[feature];

  if (typeof value === 'boolean') {
    if (value) return { allowed: true };

    // Find the cheapest plan that unlocks this feature
    const upgradeTo = (['starter', 'pro'] as PlanTier[]).find(p => {
      const v = PLAN_LIMITS[p][feature];
      return typeof v === 'boolean' ? v : false;
    });

    return {
      allowed: false,
      reason: `${formatFeatureName(feature)} requires a ${upgradeTo || 'paid'} plan`,
      upgradeRequired: upgradeTo,
    };
  }

  return { allowed: true };
}

/** Check if a numeric limit has been reached */
export function checkNumericLimit(
  workspace: Workspace | null,
  field: 'maxTestimonials' | 'maxProjects' | 'maxSeats' | 'maxWidgets',
  currentCount: number
): PlanCheckResult {
  if (!workspace) return { allowed: false, reason: 'No workspace found' };

  const limit = PLAN_LIMITS[workspace.plan][field];
  if (limit === -1) return { allowed: true }; // unlimited
  if (currentCount < limit) return { allowed: true };

  const upgradeTo = (['starter', 'pro'] as PlanTier[]).find(p => {
    const l = PLAN_LIMITS[p][field];
    return l === -1 || currentCount < l;
  });

  return {
    allowed: false,
    reason: `You've reached the ${formatFieldName(field)} limit (${limit}) on the ${workspace.plan} plan`,
    upgradeRequired: upgradeTo,
  };
}

/** Get a human-readable usage summary */
export function getUsageSummary(workspace: Workspace | null): {
  testimonials: { current: number; max: number | 'unlimited'; percent: number };
  projects: { current: number; max: number | 'unlimited'; percent: number };
  seats: { current: number; max: number | 'unlimited'; percent: number };
} {
  if (!workspace) {
    return {
      testimonials: { current: 0, max: 15, percent: 0 },
      projects: { current: 0, max: 1, percent: 0 },
      seats: { current: 0, max: 1, percent: 0 },
    };
  }

  const limits = PLAN_LIMITS[workspace.plan];

  const calcPercent = (current: number, max: number) =>
    max === -1 ? Math.min(current / 100, 1) * 100 : Math.min((current / max) * 100, 100);

  return {
    testimonials: {
      current: workspace.testimonialCount || 0,
      max: limits.maxTestimonials === -1 ? 'unlimited' : limits.maxTestimonials,
      percent: calcPercent(workspace.testimonialCount || 0, limits.maxTestimonials),
    },
    projects: {
      current: workspace.projectCount || 0,
      max: limits.maxProjects === -1 ? 'unlimited' : limits.maxProjects,
      percent: calcPercent(workspace.projectCount || 0, limits.maxProjects),
    },
    seats: {
      current: workspace.seatCount || 1,
      max: limits.maxSeats === -1 ? 'unlimited' : limits.maxSeats,
      percent: calcPercent(workspace.seatCount || 1, limits.maxSeats),
    },
  };
}

/** Get pricing info for display */
export const PLAN_PRICING: Record<PlanTier, { monthly: number; annual: number; name: string; tagline: string }> = {
  free: {
    monthly: 0,
    annual: 0,
    name: 'Free',
    tagline: 'For trying things out',
  },
  starter: {
    monthly: 29,
    annual: 24,
    name: 'Starter',
    tagline: 'For growing businesses',
  },
  pro: {
    monthly: 59,
    annual: 49,
    name: 'Pro',
    tagline: 'For scaling teams & agencies',
  },
};

// ── Internal helpers ──────────────────────────────────────────

function formatFeatureName(feature: keyof PlanLimits): string {
  const map: Record<string, string> = {
    removeBranding: 'Remove branding',
    hdVideo: 'HD video',
    richSnippets: 'Rich Snippets (SEO)',
    translation: 'Testimonial translation',
    apiAccess: 'API access',
    webhooks: 'Webhooks',
    customDomain: 'Custom domain',
    sentimentAnalysis: 'Sentiment analysis',
    caseStudyGenerator: 'Case study generator',
    zapierIntegration: 'Zapier integration',
    prioritySupport: 'Priority support',
  };
  return map[feature] || feature;
}

function formatFieldName(field: string): string {
  const map: Record<string, string> = {
    maxTestimonials: 'testimonial',
    maxProjects: 'project',
    maxSeats: 'team seat',
    maxWidgets: 'widget',
  };
  return map[field] || field;
}
