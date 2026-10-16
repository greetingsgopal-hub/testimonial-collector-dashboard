import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Workspace } from '../types';

export type PlanTier = 'starter' | 'pro' | 'agency' | 'lifetime';

export interface PlanEntitlements {
  plan: PlanTier;
  maxTextProofs: number;
  maxVideoProofs: number;
  maxWorkspaces: number;
  canRemoveBranding: boolean;
  canUseChromeExtension: boolean;
  canUseAutomatedDrips: boolean;
  canUseCustomDomain: boolean;
  canUseAiShield: boolean;
  canUseRestApiAndWebhooks: boolean;
  canUseCustomCss: boolean;
}

export function normalizePlanTier(rawPlan?: string | null): PlanTier {
  const p = (rawPlan || '').toLowerCase().trim();
  if (p === 'agency') return 'agency';
  if (p === 'lifetime' || p === 'founding_lifetime' || p === 'founding') return 'lifetime';
  if (p === 'pro') return 'pro';
  return 'starter';
}

export function getPlanEntitlements(rawPlan: string = 'starter'): PlanEntitlements {
  const plan = normalizePlanTier(rawPlan);

  switch (plan) {
    case 'agency':
      return {
        plan: 'agency',
        maxTextProofs: Infinity,
        maxVideoProofs: Infinity,
        maxWorkspaces: 5,
        canRemoveBranding: true,
        canUseChromeExtension: true,
        canUseAutomatedDrips: true,
        canUseCustomDomain: true,
        canUseAiShield: true,
        canUseRestApiAndWebhooks: true,
        canUseCustomCss: true,
      };
    case 'lifetime':
      return {
        plan: 'lifetime',
        maxTextProofs: Infinity,
        maxVideoProofs: Infinity,
        maxWorkspaces: 3,
        canRemoveBranding: true,
        canUseChromeExtension: true,
        canUseAutomatedDrips: true,
        canUseCustomDomain: true,
        canUseAiShield: true,
        canUseRestApiAndWebhooks: false,
        canUseCustomCss: true,
      };
    case 'pro':
      return {
        plan: 'pro',
        maxTextProofs: Infinity,
        maxVideoProofs: Infinity,
        maxWorkspaces: 1,
        canRemoveBranding: true,
        canUseChromeExtension: true,
        canUseAutomatedDrips: true,
        canUseCustomDomain: true,
        canUseAiShield: true,
        canUseRestApiAndWebhooks: false,
        canUseCustomCss: false,
      };
    case 'starter':
    default:
      return {
        plan: 'starter',
        maxTextProofs: 10,
        maxVideoProofs: 2,
        maxWorkspaces: 1,
        canRemoveBranding: false,
        canUseChromeExtension: false,
        canUseAutomatedDrips: false,
        canUseCustomDomain: false,
        canUseAiShield: false,
        canUseRestApiAndWebhooks: false,
        canUseCustomCss: false,
      };
  }
}

export function usePlanEntitlements(overrideWorkspace?: Workspace | null): PlanEntitlements {
  const { workspace } = useAuth();
  const currentWorkspace = overrideWorkspace !== undefined ? overrideWorkspace : workspace;

  return useMemo(() => {
    return getPlanEntitlements(currentWorkspace?.plan);
  }, [currentWorkspace?.plan]);
}

export default usePlanEntitlements;
