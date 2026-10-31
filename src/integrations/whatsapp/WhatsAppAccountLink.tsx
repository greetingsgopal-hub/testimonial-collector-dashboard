import React from 'react';
import { auth } from '../../firebase-adapters/firebase';

declare global { interface Window { FB?: { init(options: Record<string, unknown>): void; login(callback: (response: any) => void, options: Record<string, unknown>): void } } }
type Waba = { id: string; name: string; phones: Array<{ id: string; displayPhoneNumber: string }> };

export const WhatsAppAccountLink: React.FC = () => {
  const [wabas, setWabas] = React.useState<Waba[]>([]);
  const [selected, setSelected] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const getFirebaseToken = async () => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) throw new Error('Sign in before linking a WhatsApp Business Account.');
    return token;
  };

  const connect = async () => {
    if (!window.FB) { setStatus('Meta Login is still loading. Try again shortly.'); return; }
    setBusy(true); setStatus('');
    try {
      const idToken = await getFirebaseToken();
      window.FB.login(async (login) => {
        try {
          const accessToken = login?.authResponse?.accessToken;
          if (!accessToken) { setStatus('Meta authorization was cancelled or denied.'); setBusy(false); return; }
          const response = await fetch('/api/meta/link-whatsapp', { method: 'POST', headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ userAccessToken: accessToken }) });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || 'Could not list WhatsApp accounts.');
          setWabas(payload.wabas || []);
          setSelected('');
          setStatus('Choose the WhatsApp number to link.');
        } catch (error) { setStatus(error instanceof Error ? error.message : 'Meta authorization failed.'); }
        finally { setBusy(false); }
      }, { scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management', return_scopes: true });
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not start Meta authorization.'); setBusy(false); }
  };

  const confirm = async () => {
    const [wabaId, phoneNumberId] = selected.split(':');
    if (!wabaId || !phoneNumberId) return;
    setBusy(true); setStatus('');
    try {
      const idToken = await getFirebaseToken();
      const response = await fetch('/api/meta/confirm-whatsapp', { method: 'POST', headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ wabaId, phoneNumberId }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not verify this WhatsApp number.');
      setStatus(`Linked ${payload.account.displayPhoneNumber || payload.account.phoneNumberId}.`);
      setWabas([]);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not link this number.'); }
    finally { setBusy(false); }
  };

  React.useEffect(() => {
    const appId = import.meta.env.VITE_META_APP_ID;
    if (!appId) { setStatus('Meta Login is not configured for this site.'); return; }
    const init = () => window.FB?.init({ appId, cookie: true, xfbml: false, version: 'v26.0' });
    if (window.FB) { init(); return; }
    const existing = document.getElementById('facebook-jssdk');
    if (existing) { existing.addEventListener('load', init, { once: true }); return () => existing.removeEventListener('load', init); }
    const script = document.createElement('script'); script.id = 'facebook-jssdk'; script.src = 'https://connect.facebook.net/en_US/sdk.js'; script.async = true; script.defer = true; script.onload = init; document.head.appendChild(script);
  }, []);

  return <section className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-5">
    <h3 className="text-sm font-bold tracking-widest text-white">LINK WHATSAPP BUSINESS</h3>
    <p className="mt-2 text-xs text-white/50">Authorize with your Meta account. Only numbers available to that account can be linked.</p>
    {!wabas.length ? <button type="button" onClick={connect} disabled={busy} className="mt-4 h-11 rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-50">{busy ? 'Connecting…' : 'Continue with Meta'}</button> : <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <select aria-label="WhatsApp Business phone number" className="min-h-11 flex-1 rounded-xl bg-white/[0.06] px-3 text-sm text-white" value={selected} onChange={e => setSelected(e.target.value)}><option value="">Select a WhatsApp number</option>{wabas.flatMap(w => w.phones.map(p => <option key={`${w.id}:${p.id}`} value={`${w.id}:${p.id}`}>{w.name} · {p.displayPhoneNumber || p.id}</option>))}</select>
      <button type="button" onClick={confirm} disabled={busy || !selected} className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-50">{busy ? 'Verifying…' : 'Link number'}</button>
    </div>}
    {status && <p role="status" className="mt-3 text-xs text-white/60">{status}</p>}
  </section>;
};

