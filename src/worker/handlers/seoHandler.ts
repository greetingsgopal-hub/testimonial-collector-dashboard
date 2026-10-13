import { WorkerEnv } from '../types';
import { COMPETITORS, USE_CASES } from '../../lib/seoData';

/**
 * Generates dynamic, compliant /sitemap.xml for Google and search engine crawlers.
 */
export async function handleSitemapXml(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const url = new URL(request.url);
  const origin = url.origin || 'https://pandapraise.com';
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: `${origin}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${origin}/pricing`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${origin}/wall-of-love`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${origin}/privacy`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${origin}/terms`, priority: '0.3', changefreq: 'monthly' },
  ];

  const competitorRoutes = COMPETITORS.map((c) => ({
    loc: `${origin}/alternatives/${c.slug}`,
    priority: '0.85',
    changefreq: 'weekly',
  }));

  const useCaseRoutes = USE_CASES.map((u) => ({
    loc: `${origin}${u.path}`,
    priority: '0.85',
    changefreq: 'weekly',
  }));

  const allUrls = [...staticRoutes, ...competitorRoutes, ...useCaseRoutes];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    },
  });
}

/**
 * Generates dynamic /robots.txt with sitemap directive.
 */
export async function handleRobotsTxt(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const url = new URL(request.url);
  const origin = url.origin || 'https://pandapraise.com';

  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

Sitemap: ${origin}/sitemap.xml
`;

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

/**
 * Pre-renders crawler-indexable Programmatic SEO Pages at the Edge:
 * - /alternatives/:competitor
 * - /best-:useCase-testimonial-tools
 */
export async function handleSeoPagePreRender(
  request: Request,
  _env: WorkerEnv
): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '');

  // 1. Match /alternatives/:slug
  const altMatch = pathname.match(/^\/alternatives\/([a-zA-Z0-9_-]+)$/);
  if (altMatch) {
    const slug = altMatch[1].toLowerCase();
    const comp = COMPETITORS.find((c) => c.slug === slug);
    if (comp) {
      return renderCompetitorHtml(comp, url.origin);
    }
  }

  // 2. Match /best-:useCase-testimonial-tools
  const useCase = USE_CASES.find((u) => u.path === pathname);
  if (useCase) {
    return renderUseCaseHtml(useCase, url.origin);
  }

  return null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderCompetitorHtml(comp: any, origin: string): Response {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'PandaPraise',
        operatingSystem: 'All',
        applicationCategory: 'BusinessApplication',
        description: comp.metaDescription,
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '128',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: comp.faqs.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(comp.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(comp.metaDescription)}">
  <link rel="canonical" href="${origin}/alternatives/${comp.slug}">
  <meta property="og:title" content="${escapeHtml(comp.metaTitle)}">
  <meta property="og:description" content="${escapeHtml(comp.metaDescription)}">
  <meta property="og:url" content="${origin}/alternatives/${comp.slug}">
  <meta property="og:type" content="website">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-purple-500/30">
  <!-- Nav -->
  <header class="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="${origin}/" class="flex items-center gap-2 font-bold text-lg text-white">
        <span class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">🐼</span>
        <span>PandaPraise</span>
      </a>
      <div class="flex items-center gap-4">
        <a href="${origin}/pricing" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
        <a href="${origin}/signup" class="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md">Get Started Free</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-16">
    <div class="text-center max-w-3xl mx-auto space-y-5">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
        <span>⚡ 2026 Comparison</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
        PandaPraise vs ${escapeHtml(comp.name)}
      </h1>
      <p class="text-base sm:text-lg text-slate-400 font-normal">
        ${escapeHtml(comp.tagline)}. ${escapeHtml(comp.pricingTeardown)}
      </p>
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="${origin}/signup" class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all text-center">
          Switch to PandaPraise Free
        </a>
        <a href="#matrix" class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center">
          View Feature Comparison
        </a>
      </div>
    </div>

    <!-- Pricing Comparison Teardown -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div class="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(comp.name)} Pricing</span>
        <div class="text-2xl font-black text-slate-300">${escapeHtml(comp.competitorPrice)}</div>
        <p class="text-xs text-slate-500">Steep seat limits and expensive ongoing subscriptions.</p>
      </div>

      <div class="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/40 space-y-2 relative overflow-hidden">
        <div class="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wide">Better Value</div>
        <span class="text-xs font-bold text-purple-300 uppercase tracking-wider">PandaPraise Pricing</span>
        <div class="text-2xl font-black text-white">${escapeHtml(comp.pandaPraisePrice)}</div>
        <p class="text-xs text-purple-200">15 reviews free forever. Lifetime licenses available with zero recurring fees.</p>
      </div>
    </div>

    <!-- Feature Comparison Matrix -->
    <section id="matrix" class="space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Feature Comparison</h2>
        <p class="text-sm text-slate-400">Side-by-side feature teardown for modern growth teams.</p>
      </div>

      <div class="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900/80">
              <th class="p-4 sm:p-5 font-bold text-slate-300">Feature</th>
              <th class="p-4 sm:p-5 font-bold text-purple-400">PandaPraise</th>
              <th class="p-4 sm:p-5 font-bold text-slate-400">${escapeHtml(comp.name)}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${comp.featureMatrix
              .map(
                (m: any) => `<tr>
                <td class="p-4 sm:p-5 font-medium text-slate-200">
                  ${escapeHtml(m.feature)}
                  ${m.note ? `<span class="block text-xs text-slate-500 mt-0.5">${escapeHtml(m.note)}</span>` : ''}
                </td>
                <td class="p-4 sm:p-5 font-bold text-white">
                  ${typeof m.pandaPraise === 'boolean' ? (m.pandaPraise ? '✅ Included' : '❌ No') : escapeHtml(m.pandaPraise)}
                </td>
                <td class="p-4 sm:p-5 text-slate-400">
                  ${typeof m.competitor === 'boolean' ? (m.competitor ? '✅ Yes' : '❌ No') : escapeHtml(m.competitor)}
                </td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Why Switch -->
    <section class="space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Why Businesses Switch to PandaPraise</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${comp.whySwitch
          .map(
            (w: string, i: number) => `
          <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <span class="w-8 h-8 rounded-full bg-purple-900/60 text-purple-300 font-black text-xs flex items-center justify-center">0${i + 1}</span>
            <p class="text-sm text-slate-200 leading-relaxed font-medium">${escapeHtml(w)}</p>
          </div>`
          )
          .join('')}
      </div>
    </section>

    <!-- 3-Step Migration Guide -->
    <section class="space-y-6 p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
      <div class="text-center space-y-2">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Migration Guide</h2>
        <p class="text-sm text-slate-400">Switch from ${escapeHtml(comp.name)} in under 3 minutes.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        ${comp.migrationSteps
          .map(
            (s: any) => `
          <div class="space-y-2">
            <div class="text-xs font-bold text-purple-400 uppercase tracking-wider">Step ${s.step}</div>
            <h3 class="text-base font-bold text-white">${escapeHtml(s.title)}</h3>
            <p class="text-xs text-slate-400">${escapeHtml(s.desc)}</p>
          </div>`
          )
          .join('')}
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="space-y-6 max-w-3xl mx-auto">
      <div class="text-center space-y-2">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
      </div>
      <div class="space-y-4">
        ${comp.faqs
          .map(
            (faq: any) => `
          <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 class="text-sm font-bold text-white">${escapeHtml(faq.question)}</h3>
            <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(faq.answer)}</p>
          </div>`
          )
          .join('')}
      </div>
    </section>

    <!-- Final CTA Banner -->
    <div class="p-10 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/40 text-center space-y-4">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Ready to upgrade your social proof?</h2>
      <p class="text-sm text-purple-200 max-w-md mx-auto">
        Join hundreds of businesses converting more visitors with PandaPraise. Free plan includes 15 reviews forever.
      </p>
      <div class="pt-2">
        <a href="${origin}/signup" class="inline-block px-8 py-3 rounded-xl font-bold text-sm bg-white text-slate-950 hover:bg-slate-100 shadow-xl transition-all">
          Get Started Free
        </a>
      </div>
    </div>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    },
  });
}

function renderUseCaseHtml(uc: any, origin: string): Response {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'PandaPraise',
        operatingSystem: 'All',
        applicationCategory: 'BusinessApplication',
        description: uc.metaDescription,
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: uc.faqs.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(uc.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(uc.metaDescription)}">
  <link rel="canonical" href="${origin}${uc.path}">
  <meta property="og:title" content="${escapeHtml(uc.metaTitle)}">
  <meta property="og:description" content="${escapeHtml(uc.metaDescription)}">
  <meta property="og:url" content="${origin}${uc.path}">
  <meta property="og:type" content="article">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-purple-500/30">
  <!-- Nav -->
  <header class="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="${origin}/" class="flex items-center gap-2 font-bold text-lg text-white">
        <span class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">🐼</span>
        <span>PandaPraise</span>
      </a>
      <div class="flex items-center gap-4">
        <a href="${origin}/pricing" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
        <a href="${origin}/signup" class="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md">Get Started Free</a>
      </div>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-16">
    <div class="text-center max-w-3xl mx-auto space-y-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
        <span>Tailored for ${escapeHtml(uc.industry)}</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
        ${escapeHtml(uc.heroHeadline)}
      </h1>
      <p class="text-base sm:text-lg text-slate-400 font-normal">
        ${escapeHtml(uc.heroSubtitle)}
      </p>
      <div class="pt-4">
        <a href="${origin}/signup" class="inline-block px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition-all">
          Get Started Free
        </a>
      </div>
    </div>

    <!-- Recommended Layout -->
    <div class="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold text-purple-400 uppercase tracking-wider">Recommended Widget Layout</span>
        <h2 class="text-lg font-bold text-white mt-1">${escapeHtml(uc.recommendedLayout)}</h2>
      </div>
      <a href="${origin}/signup" class="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-purple-950 hover:bg-purple-50 transition-colors shrink-0">
        Preview in Studio
      </a>
    </div>

    <!-- Key Benefits -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${uc.keyBenefits
        .map(
          (b: any) => `
        <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 class="text-base font-bold text-white">${escapeHtml(b.title)}</h3>
          <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(b.desc)}</p>
        </div>`
        )
        .join('')}
    </div>

    <!-- FAQs -->
    <section class="space-y-4">
      <h2 class="text-xl font-bold text-white text-center">Frequently Asked Questions</h2>
      <div class="space-y-3 max-w-2xl mx-auto">
        ${uc.faqs
          .map(
            (faq: any) => `
          <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <h3 class="text-sm font-bold text-white">${escapeHtml(faq.question)}</h3>
            <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(faq.answer)}</p>
          </div>`
          )
          .join('')}
      </div>
    </section>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    },
  });
}
