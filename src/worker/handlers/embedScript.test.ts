import { describe, it, expect, vi } from 'vitest';
import { handleEmbedScript } from './embedScript';

/**
 * C1 regression test — embed script XSS.
 *
 * The embed script is served as a string by handleEmbedScript. We execute the
 * real served script inside jsdom with a malicious testimonials payload and
 * assert that nothing executes and all attacker content renders as inert text.
 */

const XSS_PAYLOAD = {
  testimonials: [
    {
      id: 't1',
      text: '<img src=x onerror="window.__xssHit=(window.__xssHit||0)+1">',
      authorName: '<script>window.__xssHit=(window.__xssHit||0)+1</script>',
      authorTitle: '"><img src=x onerror="window.__xssHit=(window.__xssHit||0)+1">',
      authorCompany: '" onmouseover="window.__xssHit=(window.__xssHit||0)+1',
      authorAvatar: 'x" onerror="window.__xssHit=(window.__xssHit||0)+1',
      rating: 5,
      source: 'google',
      verified: true,
    },
  ],
};

async function renderWithPayload(theme: string) {
  // Fresh DOM container with attacker-controlled theme attribute
  document.body.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'panda-praise-wall';
  container.setAttribute('data-theme', theme);
  document.body.appendChild(container);

  // Track whether any payload executes
  (window as any).__xssHit = 0;

  // Stub fetch to return the malicious payload
  const fetchMock = vi.fn().mockResolvedValue({
    json: async () => XSS_PAYLOAD,
  });
  (globalThis as any).fetch = fetchMock;

  // Execute the real served embed script
  const response = handleEmbedScript(new Request('https://worker.dev/embed.js'), {} as any);
  const scriptText = await (response as any).text();
  eval(scriptText);

  // Let the fetch promise chain resolve
  await new Promise((r) => setTimeout(r, 50));

  return container;
}

describe('C1: embed script XSS', () => {
  it('renders malicious testimonial fields as inert text — no script executes', async () => {
    const container = await renderWithPayload('light_gradient');

    // Nothing executed
    expect((window as any).__xssHit).toBe(0);

    // No event-handler attributes anywhere in the rendered wall
    const withHandlers = container.querySelectorAll(
      '[onerror],[onload],[onclick],[onmouseover],[onmouseout],[onfocus]'
    );
    expect(withHandlers.length).toBe(0);

    // No injected <script> elements
    expect(container.querySelectorAll('script').length).toBe(0);

    // The payload appears only as escaped literal text
    expect(container.innerHTML).toContain('&lt;img src=x onerror=');
    expect(container.innerHTML).toContain('&lt;script&gt;');
    expect(container.innerHTML).not.toContain('<img src=x onerror=');
    expect(container.innerHTML).not.toContain('<script>');
  });

  it('rejects non-https avatar URLs (no attribute injection via src)', async () => {
    const container = await renderWithPayload('light_gradient');

    // The attacker avatar must not appear as an img src
    const imgs = container.querySelectorAll('img');
    imgs.forEach((img) => {
      expect(img.getAttribute('src')).toMatch(/^https:\/\//);
    });
    // Attacker avatar string must not appear raw anywhere
    expect(container.innerHTML).not.toContain('x" onerror=');
  });

  it('falls back to a safe theme when data-theme is attacker-controlled', async () => {
    const container = await renderWithPayload(
      'light_gradient" onmouseover="window.__xssHit=(window.__xssHit||0)+1'
    );

    expect((window as any).__xssHit).toBe(0);

    const wall = container.querySelector('.pp-wall-container');
    expect(wall).not.toBeNull();
    // Class list must be exactly the safe default theme
    expect(wall!.className).toBe('pp-wall-container pp-theme-light_gradient');
  });
});
