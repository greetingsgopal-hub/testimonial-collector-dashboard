import { describe, it, expect } from 'vitest';
import {
  LOGIN_PAGE_TEMPLATE,
  AUTH_MIDDLEWARE_TEMPLATE,
  RBAC_TEMPLATE,
} from '../accessTemplates';

describe('PandaPraise Access System (Auth • RBAC • Impersonation)', () => {
  it('exports valid and complete LOGIN_PAGE_TEMPLATE', () => {
    expect(LOGIN_PAGE_TEMPLATE).toBeDefined();
    expect(LOGIN_PAGE_TEMPLATE).toContain('"use client"');
    expect(LOGIN_PAGE_TEMPLATE).toContain('your-store.myshopify.com');
    expect(LOGIN_PAGE_TEMPLATE).toContain('admin@pandapraise.com');
    expect(LOGIN_PAGE_TEMPLATE).toContain('Impersonating');
  });

  it('exports valid AUTH_MIDDLEWARE_TEMPLATE with security requirements', () => {
    expect(AUTH_MIDDLEWARE_TEMPLATE).toBeDefined();
    expect(AUTH_MIDDLEWARE_TEMPLATE).toContain('verifyJWT');
    expect(AUTH_MIDDLEWARE_TEMPLATE).toContain('requireRole');
    expect(AUTH_MIDDLEWARE_TEMPLATE).toContain('requireStore');
    expect(AUTH_MIDDLEWARE_TEMPLATE).toContain('logAudit');
    expect(AUTH_MIDDLEWARE_TEMPLATE).toContain('impersonatedStore');
  });

  it('exports valid RBAC_TEMPLATE with permissions matrix', () => {
    expect(RBAC_TEMPLATE).toBeDefined();
    expect(RBAC_TEMPLATE).toContain('PERMISSIONS');
    expect(RBAC_TEMPLATE).toContain('merchant_admin');
    expect(RBAC_TEMPLATE).toContain('agency_editor');
    expect(RBAC_TEMPLATE).toContain('auditor');
    expect(RBAC_TEMPLATE).toContain('super_admin');
    expect(RBAC_TEMPLATE).toContain('useAuth');
  });
});
