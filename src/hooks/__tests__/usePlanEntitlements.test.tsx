import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getPlanEntitlements } from '../usePlanEntitlements';
import { WallOfLoveEmbed } from '../../components/WallOfLoveEmbed';

describe('usePlanEntitlements & getPlanEntitlements', () => {
  it('enforces exact quotas and boolean flags for Starter plan', () => {
    const starter = getPlanEntitlements('starter');
    expect(starter.maxTextProofs).toBe(10);
    expect(starter.maxVideoProofs).toBe(2);
    expect(starter.maxWorkspaces).toBe(1);
    expect(starter.canRemoveBranding).toBe(false);
    expect(starter.canUseChromeExtension).toBe(false);
    expect(starter.canUseAutomatedDrips).toBe(false);
    expect(starter.canUseCustomDomain).toBe(false);
    expect(starter.canUseAiShield).toBe(false);
    expect(starter.canUseRestApiAndWebhooks).toBe(false);
    expect(starter.canUseCustomCss).toBe(false);
  });

  it('enforces exact quotas and boolean flags for Pro plan', () => {
    const pro = getPlanEntitlements('pro');
    expect(pro.maxTextProofs).toBe(Infinity);
    expect(pro.maxVideoProofs).toBe(Infinity);
    expect(pro.maxWorkspaces).toBe(1);
    expect(pro.canRemoveBranding).toBe(true);
    expect(pro.canUseChromeExtension).toBe(true);
    expect(pro.canUseAutomatedDrips).toBe(true);
    expect(pro.canUseCustomDomain).toBe(true);
    expect(pro.canUseAiShield).toBe(true);
    expect(pro.canUseRestApiAndWebhooks).toBe(false);
    expect(pro.canUseCustomCss).toBe(false);
  });

  it('enforces exact quotas and boolean flags for Lifetime plan', () => {
    const lifetime = getPlanEntitlements('lifetime');
    expect(lifetime.maxTextProofs).toBe(Infinity);
    expect(lifetime.maxVideoProofs).toBe(Infinity);
    expect(lifetime.maxWorkspaces).toBe(3);
    expect(lifetime.canRemoveBranding).toBe(true);
    expect(lifetime.canUseChromeExtension).toBe(true);
    expect(lifetime.canUseAutomatedDrips).toBe(true);
    expect(lifetime.canUseCustomDomain).toBe(true);
    expect(lifetime.canUseAiShield).toBe(true);
    expect(lifetime.canUseRestApiAndWebhooks).toBe(false);
    expect(lifetime.canUseCustomCss).toBe(true);
  });

  it('enforces exact quotas and boolean flags for Agency plan', () => {
    const agency = getPlanEntitlements('agency');
    expect(agency.maxTextProofs).toBe(Infinity);
    expect(agency.maxVideoProofs).toBe(Infinity);
    expect(agency.maxWorkspaces).toBe(5);
    expect(agency.canRemoveBranding).toBe(true);
    expect(agency.canUseChromeExtension).toBe(true);
    expect(agency.canUseAutomatedDrips).toBe(true);
    expect(agency.canUseCustomDomain).toBe(true);
    expect(agency.canUseAiShield).toBe(true);
    expect(agency.canUseRestApiAndWebhooks).toBe(true);
    expect(agency.canUseCustomCss).toBe(true);
  });
});

describe('WallOfLoveEmbed production enforcement', () => {
  const sampleReviews = [
    {
      id: 'r1',
      name: 'Sarah Connor',
      rating: 5,
      content: 'PandaPraise transformed our user testimonials completely!',
    },
  ];

  it('forces "Powered by PandaPraise" badge to render on Starter even if remove_branding is true', () => {
    const html = renderToString(
      <WallOfLoveEmbed
        workspace={{
          id: 'ws_starter_1',
          name: 'Starter Workspace',
          plan: 'starter',
          remove_branding: true, // Should be rejected/ignored on Starter!
        }}
        reviews={sampleReviews}
      />
    );

    expect(html).toContain('id="pandapraise-branding-badge"');
    expect(html).toContain('Powered by PandaPraise');
  });

  it('hides "Powered by PandaPraise" badge on Pro when remove_branding is true', () => {
    const html = renderToString(
      <WallOfLoveEmbed
        workspace={{
          id: 'ws_pro_1',
          name: 'Pro Workspace',
          plan: 'pro',
          remove_branding: true,
        }}
        reviews={sampleReviews}
      />
    );

    expect(html).not.toContain('id="pandapraise-branding-badge"');
  });

  it('rejects custom CSS injection on Pro workspace', () => {
    const html = renderToString(
      <WallOfLoveEmbed
        workspace={{
          id: 'ws_pro_2',
          name: 'Pro Workspace',
          plan: 'pro',
          custom_css: '.malicious-override { display: none; }',
        }}
        reviews={sampleReviews}
      />
    );

    expect(html).not.toContain('.malicious-override');
    expect(html).not.toContain('<style>');
  });

  it('injects custom CSS on Agency workspace', () => {
    const customCssCode = '.pandapraise-card { border-radius: 20px; }';
    const html = renderToString(
      <WallOfLoveEmbed
        workspace={{
          id: 'ws_agency_1',
          name: 'Agency Workspace',
          plan: 'agency',
          custom_css: customCssCode,
        }}
        reviews={sampleReviews}
      />
    );

    expect(html).toContain(customCssCode);
    expect(html).toContain('<style>');
  });

  it('injects custom CSS on Lifetime workspace', () => {
    const customCssCode = '.pandapraise-card { box-shadow: 0 10px 20px rgba(0,0,0,0.2); }';
    const html = renderToString(
      <WallOfLoveEmbed
        workspace={{
          id: 'ws_lifetime_1',
          name: 'Founding Lifetime Workspace',
          plan: 'lifetime',
          custom_css: customCssCode,
        }}
        reviews={sampleReviews}
      />
    );

    expect(html).toContain(customCssCode);
    expect(html).toContain('<style>');
  });
});
