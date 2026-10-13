import { describe, it, expect, vi } from 'vitest';
import { handleEmbedScript } from './embedScript';

const REVIEWS_FIXTURE = {
  projectId: 'proj-viral-1',
  totalCount: 3,
  averageRating: '5.0',
  testimonials: [
    {
      id: 'rev-1',
      text: 'Amazing conversion boost with PandaPraise!',
      authorName: 'Sarah Lin',
      authorTitle: 'Founder',
      authorCompany: 'GrowthCo',
      rating: 5,
      source: 'google',
      verified: true,
    },
    {
      id: 'rev-2',
      text: 'Setting up the widget took less than 2 minutes.',
      authorName: 'David Kim',
      authorTitle: 'CTO',
      authorCompany: 'SaaSFlow',
      rating: 5,
      source: 'direct',
      verified: true,
    },
  ],
};

async function renderWithAttributes(attrs: Record<string, string>, payload = REVIEWS_FIXTURE) {
  document.body.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'panda-praise-wall';
  for (const [key, val] of Object.entries(attrs)) {
    container.setAttribute(key, val);
  }
  document.body.appendChild(container);

  const fetchMock = vi.fn().mockResolvedValue({
    json: async () => payload,
  });
  (globalThis as any).fetch = fetchMock;

  const response = handleEmbedScript(new Request('https://pandapraise.com/embed.js'), {} as any);
  const scriptText = await (response as any).text();
  eval(scriptText);
  await new Promise((r) => setTimeout(r, 50));

  return container;
}

describe('Embed Script Phase 1: Viral loops & Marquee layout', () => {
  it('renders marquee ticker layout when data-widget-type="marquee"', async () => {
    const container = await renderWithAttributes({
      'data-project-id': 'proj-viral-1',
      'data-widget-type': 'marquee',
    });

    const marquee = container.querySelector('.pp-marquee');
    expect(marquee).not.toBeNull();
    const track = container.querySelector('.pp-marquee-track');
    expect(track).not.toBeNull();
    // Cards are rendered and duplicated for seamless infinite scroll
    const cards = container.querySelectorAll('.pp-card');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('encodes workspace referral slug and ref=embed in the viral footer badge link', async () => {
    const container = await renderWithAttributes({
      'data-project-id': 'workspace-supergrowth',
    });

    const badgeLink = container.querySelector('.pp-footer-link');
    expect(badgeLink).not.toBeNull();
    const href = badgeLink!.getAttribute('href');
    expect(href).toContain('ref=workspace-supergrowth');
    expect(href).toContain('utm_source=widget');
    expect(href).toContain('utm_campaign=powered_by');
  });

  it('includes marquee styles in CSS bundle', async () => {
    const response = handleEmbedScript(new Request('https://pandapraise.com/embed.js'), {} as any);
    const scriptText = await (response as any).text();
    expect(scriptText).toContain('.pp-marquee');
    expect(scriptText).toContain('pp-marquee-scroll');
  });
});
