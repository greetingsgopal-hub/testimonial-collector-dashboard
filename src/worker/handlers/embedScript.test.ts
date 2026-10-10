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

/**
 * Widget layout selection — the embed snippet's data-widget-type must render
 * the same layout the user configured in the Widget Studio. What the user
 * sees in the studio is what renders on their website.
 */

const TWO_REVIEWS = {
  projectId: 'proj-abc',
  totalCount: 2,
  averageRating: '4.5',
  testimonials: [
    {
      id: 't1',
      text: 'Panda Praise made collecting reviews effortless.',
      authorName: 'Asha Verma',
      authorTitle: 'Owner',
      authorCompany: 'Verma Bakery',
      rating: 5,
      source: 'google',
      verified: true,
    },
    {
      id: 't2',
      text: 'Setup took five minutes and the wall looks great.',
      authorName: 'Rohit Sharma',
      rating: 4,
      source: 'direct',
      verified: false,
    },
  ],
};

async function renderWithType(widgetType: string | null, payload: any = TWO_REVIEWS) {
  document.body.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'panda-praise-wall';
  container.setAttribute('data-project-id', 'proj-abc');
  if (widgetType !== null) {
    container.setAttribute('data-widget-type', widgetType);
  }
  document.body.appendChild(container);

  (window as any).__xssHit = 0;

  const fetchMock = vi.fn().mockResolvedValue({
    json: async () => payload,
  });
  (globalThis as any).fetch = fetchMock;

  const response = handleEmbedScript(new Request('https://worker.dev/embed.js'), {} as any);
  const scriptText = await (response as any).text();
  eval(scriptText);
  await new Promise((r) => setTimeout(r, 50));

  return container;
}

describe('embed script layouts (data-widget-type)', () => {
  it('renders the wall masonry by default when no type is set', async () => {
    const container = await renderWithType(null);
    expect(container.querySelector('.pp-wall-masonry')).not.toBeNull();
    expect(container.querySelectorAll('.pp-card').length).toBe(2);
  });

  it('renders the carousel layout with navigation when data-widget-type="carousel"', async () => {
    const container = await renderWithType('carousel');
    expect(container.querySelector('.pp-carousel')).not.toBeNull();
    expect(container.querySelectorAll('.pp-carousel-slide').length).toBe(2);
    expect(container.querySelectorAll('.pp-carousel-slide.pp-active').length).toBe(1);
    expect(container.querySelector('.pp-prev')).not.toBeNull();
    expect(container.querySelector('.pp-next')).not.toBeNull();
    expect(container.querySelectorAll('.pp-carousel-dot').length).toBe(2);
  });

  it('renders exactly one card in the spotlight layout', async () => {
    const container = await renderWithType('spotlight');
    expect(container.querySelector('.pp-spotlight')).not.toBeNull();
    expect(container.querySelectorAll('.pp-card').length).toBe(1);
    expect(container.textContent).toContain('Asha Verma');
  });

  it('renders the trust badge with aggregate rating and a link to the public wall', async () => {
    const container = await renderWithType('badge');
    const badge = container.querySelector('a.pp-badge');
    expect(badge).not.toBeNull();
    expect(badge!.getAttribute('href')).toBe('https://pandapraise.com/w/proj-abc');
    expect(container.textContent).toContain('4.5 out of 5');
    expect(container.textContent).toContain('Based on 2 verified reviews');
  });

  it('falls back to the wall layout for an unknown or attacker-controlled type', async () => {
    const container = await renderWithType('carousel"><script>window.__xssHit=1</script>');
    expect(container.querySelector('.pp-wall-masonry')).not.toBeNull();
    expect(container.querySelector('.pp-carousel')).toBeNull();
    expect((window as any).__xssHit).toBe(0);
  });

  it('shows the friendly empty state in every layout when no reviews exist', async () => {
    for (const type of ['wall', 'carousel', 'spotlight', 'badge']) {
      const container = await renderWithType(type, {
        projectId: 'proj-abc',
        totalCount: 0,
        averageRating: '0.0',
        testimonials: [],
      });
      expect(container.textContent).toContain('No testimonials approved yet.');
    }
  });

  it('keeps attacker-controlled review fields inert in the carousel layout', async () => {
    const container = await renderWithType('carousel', XSS_PAYLOAD);
    expect((window as any).__xssHit).toBe(0);
    expect(container.querySelectorAll('script').length).toBe(0);
    expect(container.innerHTML).toContain('&lt;img src=x onerror=');
  });
});

describe('edited-by-owner disclosure', () => {
  const EDITED_PAYLOAD = {
    projectId: 'proj-abc',
    totalCount: 2,
    averageRating: '4.5',
    testimonials: [
      { ...TWO_REVIEWS.testimonials[0], editedByOwner: true },
      { ...TWO_REVIEWS.testimonials[1], editedByOwner: false },
    ],
  };

  it('marks owner-edited reviews and leaves verbatim reviews unmarked', async () => {
    const container = await renderWithType(null, EDITED_PAYLOAD);
    const marks = container.querySelectorAll('.pp-edited');
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe('Edited by business');
    // The edited mark must sit on the first (edited) review's card only.
    const cards = container.querySelectorAll('.pp-card');
    expect(cards[0].querySelector('.pp-edited')).not.toBeNull();
    expect(cards[1].querySelector('.pp-edited')).toBeNull();
  });

  it('renders the disclosure in every layout', async () => {
    for (const type of ['wall', 'carousel', 'spotlight']) {
      const container = await renderWithType(type, EDITED_PAYLOAD);
      expect(container.querySelector('.pp-edited'), `layout ${type}`).not.toBeNull();
    }
  });
});

describe('Snippet attribute parsing & auto-mounting', () => {
  it('reads configuration attributes from the <script> tag and auto-creates container', async () => {
    document.body.innerHTML = '';
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://pandapraise.com/widget.js';
    scriptTag.setAttribute('data-project-id', 'proj-snippet-123');
    scriptTag.setAttribute('data-layout', 'grid');
    scriptTag.setAttribute('data-theme', 'dark');
    scriptTag.setAttribute('data-limit', '6');
    document.body.appendChild(scriptTag);

    let calledUrl = '';
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      calledUrl = url;
      return { json: async () => TWO_REVIEWS };
    });
    (globalThis as any).fetch = fetchMock;

    const response = handleEmbedScript(new Request('https://worker.dev/widget.js'), {} as any);
    const scriptText = await (response as any).text();
    eval(scriptText);
    await new Promise((r) => setTimeout(r, 50));

    // An auto-created container must exist
    const autoContainer = document.getElementById('panda-praise-wall');
    expect(autoContainer).not.toBeNull();
    expect(autoContainer!.querySelector('.pp-wall-masonry')).not.toBeNull();
    // Dark theme was inherited from script tag
    expect(autoContainer!.querySelector('.pp-theme-dark')).not.toBeNull();
    // Fetch query parameter included the project ID from script tag
    expect(calledUrl).toContain('projectId=proj-snippet-123');
    expect(calledUrl).toContain('limit=6');
  });
});

describe('Isolated rendering: Shadow DOM & Scoped CSS', () => {
  it('attaches Shadow DOM and encapsulates styles when data-shadow="true"', async () => {
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.id = 'panda-praise-wall';
    container.setAttribute('data-project-id', 'proj-abc');
    container.setAttribute('data-shadow', 'true');
    document.body.appendChild(container);

    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => TWO_REVIEWS,
    });
    (globalThis as any).fetch = fetchMock;

    const response = handleEmbedScript(new Request('https://worker.dev/widget.js'), {} as any);
    const scriptText = await (response as any).text();
    eval(scriptText);
    await new Promise((r) => setTimeout(r, 50));

    expect(container.shadowRoot).not.toBeNull();
    const shadowRoot = container.shadowRoot!;
    expect(shadowRoot.querySelector('style')).not.toBeNull();
    expect(shadowRoot.querySelector('.pp-wall-masonry')).not.toBeNull();
    expect(shadowRoot.querySelectorAll('.pp-card').length).toBe(2);
  });

  it('includes impenetrable all: initial CSS reset in style rules', async () => {
    const response = handleEmbedScript(new Request('https://worker.dev/widget.js'), {} as any);
    const scriptText = await (response as any).text();
    expect(scriptText).toContain('all: initial');
    expect(scriptText).toContain('contain: content');
  });
});

describe('Core Web Vitals: Zero CLS layout & image attributes', () => {
  it('renders avatars with explicit width, height, lazy loading, and async decoding', async () => {
    const AVATAR_REVIEW = {
      projectId: 'proj-abc',
      totalCount: 1,
      averageRating: '5.0',
      testimonials: [
        {
          id: 't-img',
          text: 'Super fast widget',
          authorName: 'Tech Lead',
          authorAvatar: 'https://images.example.com/avatar.jpg',
          rating: 5,
          source: 'google',
          verified: true,
        },
      ],
    };

    const container = await renderWithType(null, AVATAR_REVIEW);
    const img = container.querySelector('img.pp-avatar');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('width')).toBe('40');
    expect(img!.getAttribute('height')).toBe('40');
    expect(img!.getAttribute('loading')).toBe('lazy');
    expect(img!.getAttribute('decoding')).toBe('async');
  });
});

describe('Viral Growth Loop: Branding Badge', () => {
  it('renders "Collected with PandaPraise" with UTM parameters on standard tier', async () => {
    const container = await renderWithType(null, TWO_REVIEWS);
    const badgeLink = container.querySelector('.pp-footer-link');
    expect(badgeLink).not.toBeNull();
    expect(badgeLink!.textContent).toContain('Collected with PandaPraise');
    expect(badgeLink!.getAttribute('href')).toContain('https://pandapraise.com');
    expect(badgeLink!.getAttribute('href')).toContain('utm_source=widget');
  });

  it('suppresses branding badge when backend payload specifies hideBranding: true', async () => {
    const PRO_PAYLOAD = {
      ...TWO_REVIEWS,
      hideBranding: true,
    };
    const container = await renderWithType(null, PRO_PAYLOAD);
    expect(container.querySelector('.pp-footer-link')).toBeNull();
    expect(container.textContent).not.toContain('Collected with PandaPraise');
  });

  it('suppresses branding badge when container has data-hide-badge="true"', async () => {
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.id = 'panda-praise-wall';
    container.setAttribute('data-project-id', 'proj-abc');
    container.setAttribute('data-hide-badge', 'true');
    document.body.appendChild(container);

    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => TWO_REVIEWS,
    });
    (globalThis as any).fetch = fetchMock;

    const response = handleEmbedScript(new Request('https://worker.dev/widget.js'), {} as any);
    const scriptText = await (response as any).text();
    eval(scriptText);
    await new Promise((r) => setTimeout(r, 50));

    expect(container.querySelector('.pp-footer-link')).toBeNull();
  });
});
