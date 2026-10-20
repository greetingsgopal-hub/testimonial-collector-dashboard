/*!
 * Panda Praise — One-File Trust Layer v1.0
 * Drop this before </body> on EVERY page (or at minimum on your 404 page).
 *
 * Creates: /about, /contact, /privacy, /terms, /roadmap, /blog
 * Adds: site-wide footer w/ legal links, cookie consent, Organization JSON-LD,
 *       floating contact button, grievance-officer disclosure.
 *
 * ── TODO BEFORE GOING LIVE ────────────────────────────────────────────
 *  1. Fill every CONFIG field. Placeholders are not compliance.
 *  2. Have a lawyer review Privacy + Terms. These are templates, not legal advice.
 *  3. Add real testimonials / case studies in your CMS. The script cannot do this.
 *  4. Remove "coming soon" badges from the homepage and link them to /roadmap.
 * ──────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__ppTrustLayer) return;
  window.__ppTrustLayer = true;

  /* ─────────────────────────── CONFIG ─────────────────────────── */
  var CONFIG = {
    brand:            'Panda Praise',
    legalName:        'Panda Praise Technologies',
    address:          'Bengaluru, Karnataka, PIN 560001, India',
    email:            'support@pandapraise.com',
    privacyEmail:     'privacy@pandapraise.com',
    supportDesk:      'https://pandapraise.com/contact',
    grievanceOfficer: 'Designated Compliance Lead · support@pandapraise.com',
    jurisdiction:     'Bengaluru, Karnataka, India',
    effectiveDate:    '1 January 2025',
    siteUrl:          'https://pandapraise.com',
    processors:       'Razorpay (payments), Cloudflare (Edge Workers & hosting), and Google Cloud Firebase (authentication & data store)'
  };

  /* ─────────────────────────── STYLES ─────────────────────────── */
  var CSS = ''
  + ':root{--pp-ink:#111827;--pp-muted:#4b5563;--pp-line:#e5e7eb;--pp-bg:#fff;--pp-accent:#16a34a;--pp-accent-ink:#fff}'
  + '.pp-standalone{font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--pp-ink);background:var(--pp-bg);margin:0}'
  + '.pp-wrap{max-width:820px;margin:0 auto;padding:40px 20px 80px}'
  + '.pp-wrap h1{font-size:2rem;line-height:1.25;margin:0 0 8px}'
  + '.pp-wrap h2{font-size:1.2rem;margin:32px 0 8px}'
  + '.pp-wrap h3{font-size:1rem;margin:20px 0 6px}'
  + '.pp-wrap p,.pp-wrap li{color:var(--pp-muted)}'
  + '.pp-wrap a{color:#0f766e}'
  + '.pp-meta{font-size:.85rem;color:var(--pp-muted);margin:0 0 28px}'
  + '.pp-note{background:#f9fafb;border:1px solid var(--pp-line);border-radius:10px;padding:14px 16px;font-size:.9rem}'
  + '.pp-nav{display:flex;gap:18px;flex-wrap:wrap;align-items:center;max-width:820px;margin:0 auto;padding:20px}'
  + '.pp-nav a{color:var(--pp-ink);text-decoration:none;font-weight:600;font-size:.92rem}'
  + '.pp-nav a:hover{color:var(--pp-accent)}'
  + 'footer.pp-footer{border-top:1px solid var(--pp-line);margin-top:60px;padding:32px 20px;font-size:.85rem;color:var(--pp-muted)}'
  + '.pp-footer-inner{max-width:820px;margin:0 auto}'
  + '.pp-footer-links{display:flex;gap:16px;flex-wrap:wrap;margin:0 0 12px}'
  + '.pp-footer a{color:var(--pp-muted);text-decoration:none}'
  + '.pp-footer a:hover{color:var(--pp-ink);text-decoration:underline}'
  + '.pp-footer button{background:none;border:0;padding:0;font:inherit;color:var(--pp-muted);cursor:pointer}'
  + '.pp-footer button:hover{color:var(--pp-ink);text-decoration:underline}'
  + '#pp-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:640px;margin:0 auto;'
  + 'background:#111827;color:#f9fafb;border-radius:12px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.25);'
  + 'font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}'
  + '#pp-cookie a{color:#a7f3d0}'
  + '#pp-cookie .pp-cookie-actions{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}'
  + '#pp-cookie button{border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer;border:1px solid transparent}'
  + '.pp-accept{background:var(--pp-accent);color:var(--pp-accent-ink)}'
  + '.pp-reject{background:transparent;color:#f9fafb;border-color:#374151}'
  + '#pp-contact-fab{position:fixed;left:16px;bottom:16px;z-index:2147482000;background:#111827;color:#fff;'
  + 'border-radius:999px;padding:10px 16px;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;'
  + 'text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.2)}'
  + '@media(max-width:520px){#pp-contact-fab{display:none}}';

  /* ─────────────────────────── HELPERS ─────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(p) { p = (p || '/').toLowerCase().replace(/\/+$/, ''); return p || '/'; }
  function injectCSS() {
    if (document.getElementById('pp-trust-css')) return;
    var s = document.createElement('style');
    s.id = 'pp-trust-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ─────────────────────────── SHARED CHROME ─────────────────────────── */
  function headerHTML() {
    return '<nav class="pp-nav">'
      + '<a href="/">' + esc(CONFIG.brand) + '</a>'
      + '<a href="/about">About</a>'
      + '<a href="/contact">Contact</a>'
      + '<a href="/roadmap">Roadmap</a>'
      + '<a href="/blog">Blog</a>'
      + '<a href="/privacy">Privacy</a>'
      + '<a href="/terms">Terms</a>'
      + '</nav>';
  }

  function footerHTML() {
    return '<footer class="pp-footer" role="contentinfo"><div class="pp-footer-inner">'
      + '<div class="pp-footer-links">'
      +   '<a href="/about">About Us</a>'
      +   '<a href="/contact">Contact</a>'
      +   '<a href="/privacy">Privacy Policy</a>'
      +   '<a href="/terms">Terms of Service</a>'
      +   '<a href="/roadmap">Roadmap</a>'
      +   '<button type="button" id="pp-cookie-reset">Cookie Preferences</button>'
      + '</div>'
      + '<p style="margin:0 0 6px">' + esc(CONFIG.legalName) + ' &middot; ' + esc(CONFIG.address) + '</p>'
      + '<p style="margin:0 0 6px">Support: <a href="mailto:' + esc(CONFIG.email) + '">' + esc(CONFIG.email) + '</a>'
      +   ' &middot; <a href="/contact">Online Help Desk</a></p>'
      + '<p style="margin:0 0 6px">Grievance Officer: ' + esc(CONFIG.grievanceOfficer) + '</p>'
      + '<p style="margin:0">&copy; ' + new Date().getFullYear() + ' ' + esc(CONFIG.legalName) + '. All rights reserved.</p>'
      + '</div></footer>';
  }

  function cookieHTML() {
    return '<div id="pp-cookie" role="dialog" aria-label="Cookie consent" hidden>'
      + '<div>We use essential cookies to run ' + esc(CONFIG.brand) + ' and optional cookies to understand usage. '
      + 'See our <a href="/privacy#cookies">Cookie Policy</a>.</div>'
      + '<div class="pp-cookie-actions">'
      +   '<button type="button" class="pp-accept" id="pp-cookie-accept">Accept all</button>'
      +   '<button type="button" class="pp-reject" id="pp-cookie-reject">Reject non-essential</button>'
      + '</div></div>';
  }

  function fabHTML() {
    return '<a id="pp-contact-fab" href="/contact" title="Contact us">Need help?</a>';
  }

  /* ─────────────────────────── PAGES ─────────────────────────── */
  var PAGES = {

    '/about': {
      title: 'About Us',
      desc: 'Who is behind Panda Praise, how we work, and how to reach us.',
      html:
        '<h1>About ' + esc(CONFIG.brand) + '</h1>'
      + '<p class="pp-meta">Last updated: ' + esc(CONFIG.effectiveDate) + '</p>'
      + '<p>' + esc(CONFIG.brand) + ' is a testimonial collection and social-proof display tool operated by '
      + esc(CONFIG.legalName) + '. It is built for small businesses and independent SaaS teams who want to turn '
      + 'happy customers into credible, verifiable proof on their websites.</p>'
      + '<h2>Who we are</h2>'
      + '<p><strong>Legal entity:</strong> ' + esc(CONFIG.legalName) + '</p>'
      + '<p><strong>Registered address:</strong> ' + esc(CONFIG.address) + '</p>'
      + '<p><strong>Contact:</strong> <a href="mailto:' + esc(CONFIG.email) + '">' + esc(CONFIG.email) + '</a> · '
      + '<a href="/contact">Contact Support</a></p>'
      + '<h2>How we work</h2>'
      + '<p>We collect testimonials only with the explicit consent of the person giving them. We do not edit the '
      + 'substance of a testimonial, and we display the attribution chosen by the reviewer. If you believe a '
      + 'testimonial hosted by us is inaccurate or was collected without consent, email '
      + '<a href="mailto:' + esc(CONFIG.privacyEmail) + '">' + esc(CONFIG.privacyEmail) + '</a> and we will '
      + 'investigate and remove it where appropriate.</p>'
      + '<h2>Contact</h2>'
      + '<p>Full contact options, including our grievance officer, are on the <a href="/contact">Contact page</a>.</p>'
    },

    '/contact': {
      title: 'Contact Us',
      desc: 'Reach the Panda Praise team — support, privacy, billing and grievance officer.',
      html:
        '<h1>Contact Us</h1>'
      + '<p class="pp-meta">We aim to respond within 2 business days.</p>'
      + '<h2>General support</h2>'
      + '<p>Email: <a href="mailto:' + esc(CONFIG.email) + '">' + esc(CONFIG.email) + '</a><br>'
      + 'Support Form: <a href="/contact">Online Inquiries</a></p>'
      + '<h2>Privacy &amp; data requests</h2>'
      + '<p>Access, correction, deletion, or consent withdrawal: '
      + '<a href="mailto:' + esc(CONFIG.privacyEmail) + '">' + esc(CONFIG.privacyEmail) + '</a></p>'
      + '<h2>Grievance officer</h2>'
      + '<p>' + esc(CONFIG.grievanceOfficer) + '</p>'
      + '<h2>Registered office</h2>'
      + '<p>' + esc(CONFIG.legalName) + '<br>' + esc(CONFIG.address) + '</p>'
      + '<h2>Billing</h2>'
      + '<p>For invoices, refunds and plan changes, email <a href="mailto:' + esc(CONFIG.email) + '">'
      + esc(CONFIG.email) + '</a> with your account email and the payment identifier.</p>'
    },

    '/privacy': {
      title: 'Privacy Policy',
      desc: 'How Panda Praise collects, uses and protects personal data.',
      html:
        '<h1>Privacy Policy</h1>'
      + '<p class="pp-meta">Effective: ' + esc(CONFIG.effectiveDate) + ' · Controller: ' + esc(CONFIG.legalName) + '</p>'
      + '<p class="pp-note"><strong>Template notice:</strong> This policy is a starting structure, not legal advice. '
      + 'Have it reviewed against the India DPDP Act 2023 and, if you serve EU/UK/US-CA users, the GDPR/UK GDPR and '
      + 'CCPA/CPRA before publishing.</p>'
      + '<h2>1. Who we are</h2>'
      + '<p>' + esc(CONFIG.legalName) + ', ' + esc(CONFIG.address) + '. Privacy contact: '
      + '<a href="mailto:' + esc(CONFIG.privacyEmail) + '">' + esc(CONFIG.privacyEmail) + '</a>.</p>'
      + '<h2>2. Data we collect</h2>'
      + '<ul>'
      + '<li><strong>Account data:</strong> name, email, hashed password, workspace name.</li>'
      + '<li><strong>Billing data:</strong> plan, invoices, and payment identifiers from Razorpay. We do not store full card numbers.</li>'
      + '<li><strong>Content you create:</strong> testimonials, reviewer names, avatars and display settings.</li>'
      + '<li><strong>Reviewer data:</strong> name, email and testimonial text submitted through your collection forms.</li>'
      + '<li><strong>Usage &amp; device data:</strong> IP address, browser, pages viewed, and widget impressions.</li>'
      + '<li><strong>Cookies</strong> as described in section 8.</li>'
      + '</ul>'
      + '<h2>3. Why we process it (legal bases)</h2>'
      + '<ul>'
      + '<li>To provide the service and bill you — performance of contract.</li>'
      + '<li>To secure the service and prevent abuse — legitimate interests.</li>'
      + '<li>Optional analytics and marketing — your consent, withdrawable at any time.</li>'
      + '<li>To meet tax and legal obligations — legal obligation.</li>'
      + '</ul>'
      + '<h2>4. Who we share it with</h2>'
      + '<p>We share data with ' + esc(CONFIG.processors) + ', strictly to operate the service. We do not sell '
      + 'personal data. We may disclose data where required by law or to protect our legal rights.</p>'
      + '<h2>5. International transfers</h2>'
      + '<p>Some processors may store data outside India. Where that happens we rely on appropriate safeguards '
      + '(standard contractual clauses or equivalent) and limit the transfer to what is necessary.</p>'
      + '<h2>6. Retention</h2>'
      + '<p>Account and content data are kept while your account is active and for up to 90 days after deletion '
      + 'in backups. Billing records are kept for the period required by tax law.</p>'
      + '<h2>7. Your rights</h2>'
      + '<p>Subject to applicable law you may request access, correction, deletion, portability, and withdrawal of '
      + 'consent, and you may object to certain processing. Email '
      + '<a href="mailto:' + esc(CONFIG.privacyEmail) + '">' + esc(CONFIG.privacyEmail) + '</a>. You may also '
      + 'complain to your local data protection authority.</p>'
      + '<h2 id="cookies">8. Cookies</h2>'
      + '<p>We use strictly necessary cookies for authentication and security. With your consent we also use '
      + 'analytics cookies. You can change your choice at any time via “Cookie Preferences” in the footer.</p>'
      + '<h2>9. Security</h2>'
      + '<p>We use encryption in transit, hashed passwords, least-privilege access, and audit logging. No system '
      + 'is perfectly secure, and we will notify affected users and regulators of a breach where required.</p>'
      + '<h2>10. Children</h2>'
      + '<p>The service is not directed to children under 18 and we do not knowingly collect their data.</p>'
      + '<h2>11. Changes</h2>'
      + '<p>We will post material changes on this page and update the effective date. Where required, we will '
      + 'notify you by email.</p>'
      + '<h2>12. Grievance officer</h2>'
      + '<p>' + esc(CONFIG.grievanceOfficer) + '</p>'
    },

    '/terms': {
      title: 'Terms of Service',
      desc: 'The terms that govern use of Panda Praise.',
      html:
        '<h1>Terms of Service</h1>'
      + '<p class="pp-meta">Effective: ' + esc(CONFIG.effectiveDate) + ' · Provider: ' + esc(CONFIG.legalName) + '</p>'
      + '<p class="pp-note"><strong>Template notice:</strong> Not legal advice. Have counsel review before publishing.</p>'
      + '<h2>1. Acceptance</h2>'
      + '<p>By creating an account or using ' + esc(CONFIG.brand) + ' you agree to these Terms and to our '
      + '<a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the service.</p>'
      + '<h2>2. Accounts</h2>'
      + '<p>You must provide accurate information, keep credentials secure, and be at least 18. You are responsible '
      + 'for activity under your account.</p>'
      + '<h2>3. Plans, billing and refunds</h2>'
      + '<p>Paid plans are billed through Razorpay. Subscriptions renew until cancelled. The lifetime “Founding '
      + 'Member” pass is a one-time payment that grants access for the commercial life of the product; it does not '
      + 'guarantee any specific feature. Refunds are governed by the refund terms shown at checkout and by '
      + 'applicable consumer law.</p>'
      + '<h2>4. Acceptable use</h2>'
      + '<p>You must not use the service to collect testimonials without the reviewer’s consent, to publish false '
      + 'or misleading reviews, to infringe intellectual property, to upload malware, to attempt unauthorised '
      + 'access, or to break any applicable law.</p>'
      + '<h2>5. Your content and testimonials</h2>'
      + '<p>You retain ownership of content you upload. You grant us a limited licence to host and display it to '
      + 'operate the service. You are responsible for obtaining and keeping evidence of each reviewer’s consent, '
      + 'and for complying with consumer-protection and advertising rules in your jurisdiction.</p>'
      + '<h2>6. Third-party services</h2>'
      + '<p>The service integrates with third parties such as Razorpay. Their terms and privacy policies apply to '
      + 'their part of the transaction.</p>'
      + '<h2>7. Intellectual property</h2>'
      + '<p>The software, brand and documentation remain ours. These Terms do not transfer any ownership to you.</p>'
      + '<h2>8. Disclaimers</h2>'
      + '<p>The service is provided “as is”. To the maximum extent permitted by law we disclaim implied warranties '
      + 'of merchantability, fitness for a particular purpose and non-infringement.</p>'
      + '<h2>9. Limitation of liability</h2>'
      + '<p>To the maximum extent permitted by law, our aggregate liability arising out of or relating to these '
      + 'Terms will not exceed the amount you paid us in the twelve months before the claim.</p>'
      + '<h2>10. Termination</h2>'
      + '<p>You may cancel at any time. We may suspend or terminate accounts that breach these Terms or create '
      + 'risk for other users. On termination, your right to use the service ends.</p>'
      + '<h2>11. Governing law</h2>'
      + '<p>These Terms are governed by the laws of India, and the courts at ' + esc(CONFIG.jurisdiction)
      + ' have exclusive jurisdiction, subject to any mandatory consumer protections in your country of residence.</p>'
      + '<h2>12. Changes</h2>'
      + '<p>We may update these Terms. Material changes will be posted here with a new effective date and, where '
      + 'required, notified by email.</p>'
      + '<h2>13. Contact</h2>'
      + '<p>' + esc(CONFIG.legalName) + ' · <a href="mailto:' + esc(CONFIG.email) + '">' + esc(CONFIG.email) + '</a></p>'
    },

    '/roadmap': {
      title: 'Product Roadmap',
      desc: 'What is live today in Panda Praise, and what is still planned.',
      html:
        '<h1>Product Roadmap</h1>'
      + '<p class="pp-meta">We separate what is live from what is planned. Only live features are sold.</p>'
      + '<h2>Live today</h2>'
      + '<ul>'
      + '<li>Testimonial collection forms</li>'
      + '<li>Embeddable testimonial wall and widget</li>'
      + '<li>Moderation and approval workflow</li>'
      + '<li>Razorpay billing</li>'
      + '</ul>'
      + '<h2>In development</h2>'
      + '<ul>'
      + '<li>Chrome extension for one-click collection</li>'
      + '<li>Slack integration</li>'
      + '</ul>'
      + '<h2>Planned</h2>'
      + '<ul>'
      + '<li>Automated reward and gifting flows</li>'
      + '<li>Video testimonial support</li>'
      + '</ul>'
      + '<p class="pp-note">If a feature appears as “coming soon” on the marketing site, it should link here. '
      + 'Advertising unshipped features as available is a consumer-protection risk in most markets.</p>'
    },

    '/blog': {
      title: 'Blog',
      desc: 'Practical notes on collecting and displaying customer testimonials ethically.',
      html:
        '<h1>Blog</h1>'
      + '<p class="pp-meta">Practical, short, and written by the team.</p>'

      + '<article><h2>How to collect testimonials without annoying your customers</h2>'
      + '<p>The best time to ask for a testimonial is immediately after a customer experiences a clear win — '
      + 'right after a successful onboarding, a resolved support ticket, or a milestone they told you about. '
      + 'Ask one specific question (“What changed for you after switching?”) rather than a generic “Would you '
      + 'leave a review?”. Always show the person exactly how their words will be displayed, and give them a '
      + 'one-click way to withdraw consent. A testimonial collected with clear consent is worth ten collected '
      + 'in a rush.</p></article>'

      + '<article><h2>Displaying social proof without slowing down your site</h2>'
      + '<p>Testimonial widgets are a common cause of layout shift and slow Largest Contentful Paint. Reserve '
      + 'a fixed height for the widget container, lazy-load it below the fold, and serve it from a single '
      + 'cached endpoint rather than one request per testimonial. If your widget blocks the main thread, move '
      + 'it into an iframe with a fixed size. Fast pages convert better than pretty ones.</p></article>'

      + '<article><h2>Why “+34% conversions” needs a footnote</h2>'
      + '<p>Performance claims on a marketing site are advertising. In India, the US, the UK and the EU, an '
      + 'unsupported statistical claim can be treated as misleading. If you publish a number, link it to a '
      + 'named case study with the customer’s written permission, state the sample size and the measurement '
      + 'window, and update it when it stops being true. A credible small number beats an incredible big one.</p></article>'
    }
  };

  /* ─────────────────────────── ROUTER ─────────────────────────── */
  function standaloneHTML(key) {
    var page = PAGES[key];
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
      + '<meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<title>' + esc(page.title) + ' — ' + esc(CONFIG.brand) + '</title>'
      + '<meta name="description" content="' + esc(page.desc) + '">'
      + '<link rel="canonical" href="' + esc(CONFIG.siteUrl + key) + '">'
      + '<style>' + CSS + '</style></head>'
      + '<body class="pp-standalone">' + headerHTML()
      + '<main class="pp-wrap">' + page.html + '</main>'
      + footerHTML()
      + '</body></html>';
  }

  function renderStandalone(key) {
    var html = standaloneHTML(key);
    document.open();
    document.write(html);
    document.close();
  }

  /* ─────────────────────────── COOKIE CONSENT ─────────────────────────── */
  var CONSENT_KEY = 'pp_cookie_consent_v1';

  function attachCookieHandlers() {
    var banner = document.getElementById('pp-cookie');
    if (!banner) return;
    var stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (!stored) banner.hidden = false;

    var accept = document.getElementById('pp-cookie-accept');
    var reject = document.getElementById('pp-cookie-reject');
    var reset  = document.getElementById('pp-cookie-reset');

    function set(v) {
      try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
      if (banner) banner.hidden = true;
      document.dispatchEvent(new CustomEvent('pp:consent', { detail: { choice: v } }));
    }
    if (accept) accept.addEventListener('click', function () { set('all'); });
    if (reject) reject.addEventListener('click', function () { set('essential'); });
    if (reset)  reset.addEventListener('click', function () {
      try {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem('pp_cookie_consent');
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('pp:reset-cookie-consent'));
      if (banner && !banner.classList.contains('cookie-banner')) banner.hidden = false;
    });
  }

  /* ─────────────────────────── SCHEMA ─────────────────────────── */
  function injectSchema() {
    if (document.getElementById('pp-org-schema')) return;
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'pp-org-schema';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: CONFIG.legalName,
      alternateName: CONFIG.brand,
      url: CONFIG.siteUrl,
      email: CONFIG.email,
      address: { '@type': 'PostalAddress', streetAddress: CONFIG.address },
      contactPoint: [{
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: CONFIG.email,
        url: CONFIG.supportDesk
      }]
    });
    document.head.appendChild(s);
  }

  /* ─────────────────────────── BOOT ─────────────────────────── */
  injectCSS();

  var qp = '';
  try { qp = new URLSearchParams(location.search).get('page') || ''; } catch (e) {}
  var key = qp ? norm('/' + qp) : norm(location.pathname);

  // If in an SPA root that has already rendered, avoid clobbering root unless requested via query parameter
  if (PAGES[key] && !document.getElementById('root')?.hasChildNodes()) {
    renderStandalone(key);
    return;
  }

  // Regular page: append schema and handlers
  injectSchema();

  if (!document.querySelector('footer.pp-footer') && !document.querySelector('footer')) {
    var holder = document.createElement('div');
    holder.innerHTML = footerHTML();
    document.body.appendChild(holder.firstChild);
  }
  // Only inject standalone cookie banner if no React application or existing cookie banner is present
  if (!document.getElementById('pp-cookie') && !document.querySelector('.cookie-banner') && !document.querySelector('aside[aria-label="Cookie preferences"]') && !document.getElementById('root')) {
    var cb = document.createElement('div');
    cb.innerHTML = cookieHTML();
    document.body.appendChild(cb.firstChild);
  }
  if (!document.getElementById('pp-contact-fab')) {
    var fb = document.createElement('div');
    fb.innerHTML = fabHTML();
    document.body.appendChild(fb.firstChild);
  }
  attachCookieHandlers();
})();
