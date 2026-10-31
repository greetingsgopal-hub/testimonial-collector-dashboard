import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyFirebaseToken, getDocument, saveDocument, encryptToken, decryptToken } = vi.hoisted(() => ({
  verifyFirebaseToken: vi.fn(),
  getDocument: vi.fn(),
  saveDocument: vi.fn(),
  encryptToken: vi.fn(() => 'encrypted-token'),
  decryptToken: vi.fn(() => 'per-user-meta-token'),
}));

vi.mock('../lib/firebaseAuth', () => ({ extractBearerToken: (header?: string | null) => header?.startsWith('Bearer ') ? header.slice(7) : null, verifyFirebaseToken }));
vi.mock('../lib/firestoreAdmin', () => ({ getDocument, saveDocument }));
vi.mock('../lib/crypto', () => ({ encryptToken, decryptToken }));

import { handleWhatsAppMetaConfirm, handleWhatsAppMetaLink } from './whatsappAccountLink';

const env: any = { META_APP_ID: 'app-id', META_APP_SECRET: 'app-secret', APP_ENCRYPTION_KEY: 'encryption-key' };

describe('per-user WhatsApp account linking', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()); });

  it('requires a verified Firebase user before account discovery', async () => {
    verifyFirebaseToken.mockResolvedValueOnce(null);
    const response = await handleWhatsAppMetaLink(new Request('https://app.test/api/meta/link-whatsapp', { method: 'POST', headers: { Authorization: 'Bearer invalid' }, body: JSON.stringify({ userAccessToken: 'meta-token' }) }), env);
    expect(response.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects a phone number that is not returned under the selected WABA', async () => {
    verifyFirebaseToken.mockResolvedValueOnce({ uid: 'owner-1' });
    getDocument.mockResolvedValueOnce({ ownerUid: 'owner-1', wabaIds: ['123456789'], accessTokenEncrypted: 'encrypted-token' });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: '111111111' }] }), { status: 200 }));
    const response = await handleWhatsAppMetaConfirm(new Request('https://app.test/api/meta/confirm-whatsapp', { method: 'POST', headers: { Authorization: 'Bearer valid' }, body: JSON.stringify({ wabaId: '123456789', phoneNumberId: '999999999' }) }), env);
    expect(response.status).toBe(403);
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('writes the mapping only after Meta confirms the phone belongs to the authorized WABA', async () => {
    verifyFirebaseToken.mockResolvedValueOnce({ uid: 'owner-2' });
    getDocument.mockResolvedValueOnce({ ownerUid: 'owner-2', wabaIds: ['123456789'], accessTokenEncrypted: 'encrypted-token' });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: '987654321', display_phone_number: '+1 555 0100' }] }), { status: 200 }));
    const response = await handleWhatsAppMetaConfirm(new Request('https://app.test/api/meta/confirm-whatsapp', { method: 'POST', headers: { Authorization: 'Bearer valid' }, body: JSON.stringify({ wabaId: '123456789', phoneNumberId: '987654321' }) }), env);
    expect(response.status).toBe(200);
    expect(saveDocument).toHaveBeenNthCalledWith(1, 'whatsapp_accounts', '123456789', expect.objectContaining({ ownerUid: 'owner-2', verified: true, verifiedVia: 'per_user_meta_oauth' }), undefined, env);
    expect(saveDocument).toHaveBeenNthCalledWith(2, 'whatsapp_accounts_by_phone', '987654321', expect.objectContaining({ ownerUid: 'owner-2', verified: true }), undefined, env);
  });
});

