import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * C6 regression tests: the DelegatingStorageAdapter (storage router) must
 * forward every adapter method the application calls. The router previously
 * dropped evaluateAutoApproval and resetToSampleData, silently disabling
 * auto-approval on public collection forms and the demo seed button.
 */

// ── Static call-site coverage ──────────────────────────────────────────────
// Every `storage.<method>(` call anywhere in src/ must be forwarded by the
// router class in src/lib/storage/index.ts. This prevents any future adapter
// method from being silently dropped again.

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      out.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const srcDir = join(process.cwd(), 'src');
const calledMethods = new Set<string>();
for (const file of listSourceFiles(srcDir)) {
  const content = readFileSync(file, 'utf8');
  for (const m of content.matchAll(/\bstorage\.(\w+)\(/g)) {
    calledMethods.add(m[1]);
  }
}

const routerSource = readFileSync(join(srcDir, 'lib/storage/index.ts'), 'utf8');

describe('C6: router call-site coverage (no silently dropped methods)', () => {
  it('application code actually calls storage methods (test is meaningful)', () => {
    expect(calledMethods.size).toBeGreaterThan(0);
  });

  it('every storage.<method>() call site is forwarded by the router', () => {
    const missing: string[] = [];
    for (const method of calledMethods) {
      // Router must define the method (with optional trailing '?')
      const defined = new RegExp(`${method}\\??\\s*\\(`).test(
        routerSource.slice(routerSource.indexOf('class DelegatingStorageAdapter'))
      );
      if (!defined) missing.push(method);
    }
    expect(missing).toEqual([]);
  });

  it('router forwards evaluateAutoApproval (the C6 production bug)', () => {
    expect(routerSource).toMatch(/evaluateAutoApproval\(reviewId/);
  });

  it('router forwards resetToSampleData', () => {
    expect(routerSource).toMatch(/resetToSampleData\(projectId/);
  });
});

// ── Behavioral delegation tests ────────────────────────────────────────────
// Verify forwarding actually reaches the active adapter, using mocked modules.

vi.mock('../firebase', () => ({
  isFirebaseConfigured: false,
}));

vi.mock('./localStorageAdapter', () => ({
  LocalStorageAdapter: class LocalStorageAdapter {
    static instances: LocalStorageAdapter[] = [];
    name = 'LocalStorageAdapter';
    isCloud = false;
    evaluateAutoApproval = vi.fn().mockResolvedValue({ id: 'rev_1', status: 'approved' });
    resetToSampleData = vi.fn().mockResolvedValue(undefined);
    getReviews = vi.fn().mockResolvedValue([]);
    getReviewById = vi.fn().mockResolvedValue(null);
    createReview = vi.fn().mockResolvedValue({ id: 'rev_1' });
    updateReview = vi.fn().mockResolvedValue({ id: 'rev_1' });
    deleteReview = vi.fn().mockResolvedValue(true);
    getStats = vi.fn().mockResolvedValue({});
    getCollectionForm = vi.fn().mockResolvedValue(null);
    updateCollectionForm = vi.fn().mockResolvedValue({});
    createCollectionForm = vi.fn().mockResolvedValue({});
    getCollectionFormBySlug = vi.fn().mockResolvedValue(null);
    constructor() {
      LocalStorageAdapter.instances.push(this);
    }
  },
}));

import { storage } from './index';
import { LocalStorageAdapter } from './localStorageAdapter';

function getLocalInstance(): any {
  const instances = (LocalStorageAdapter as any).instances as any[];
  expect(instances.length).toBeGreaterThan(0);
  return instances[0];
}

describe('C6: router behavioral delegation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('pandapraise_demo_mode');
  });

  it('forwards evaluateAutoApproval to the active adapter with arguments', async () => {
    const result = await storage.evaluateAutoApproval?.('rev_9', 'proj_1');
    expect(getLocalInstance().evaluateAutoApproval).toHaveBeenCalledWith('rev_9', 'proj_1');
    expect(result).toEqual({ id: 'rev_1', status: 'approved' });
  });

  it('forwards resetToSampleData to the active adapter with arguments', async () => {
    await storage.resetToSampleData?.('proj_2');
    expect(getLocalInstance().resetToSampleData).toHaveBeenCalledWith('proj_2');
  });

  it('does not throw when the active adapter lacks the optional method', async () => {
    const instance = getLocalInstance();
    // Simulate an adapter without the optional method
    const original = instance.resetToSampleData;
    delete instance.resetToSampleData;
    try {
      const result = await storage.resetToSampleData?.('proj_3');
      expect(result).toBeUndefined();
    } finally {
      instance.resetToSampleData = original;
    }
  });
});
