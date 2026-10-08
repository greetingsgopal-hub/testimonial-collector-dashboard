import { WorkerEnv } from '../types';

export function handleEmbedScript(_request: Request, _env: WorkerEnv): Response {
  const scriptContent = `/**
 * Panda Praise — Wall of Love Embed Runtime
 * High-speed, responsive, zero-layout-shift social proof widget generator.
 */
(function () {
  'use strict';

  var API_BASE = 'https://pandapraise.com';
  // Security: HTML escaping to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // Security: Whitelist of allowed themes
  var ALLOWED_THEMES = {
    'light_gradient': true,
    'light': true,
    'dark': true,
    'minimalist': true
  };

  function sanitizeTheme(theme) {
    return ALLOWED_THEMES[theme] ? theme : 'light_gradient';
  }

  // Security: Validate avatar URL (must be https)
  function sanitizeAvatarUrl(url) {
    if (!url || typeof url !== 'string') return '';
    var trimmed = url.trim();
    if (trimmed.indexOf('https://') !== 0) return '';
    return trimmed;
  }


  // Platform Icons SVG Helpers
  var ICONS = {
    star: '<svg class="pp-star" viewBox="0 0 20 20" fill="#f59e0b"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>',
    google: '<svg class="pp-source-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>',
    linkedin: '<svg class="pp-source-icon" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>',
    instagram: '<svg class="pp-source-icon" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#E4405F"/><path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1zm4.9-8.1a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" fill="#FFF"/></svg>',
    facebook: '<svg class="pp-source-icon" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    verified: '<svg class="pp-verified-icon" viewBox="0 0 20 20" fill="#10B981"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
    heart: '<svg class="pp-heart" viewBox="0 0 20 20" fill="#E11D48"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/></svg>',
  };

  function injectStyles() {
    if (document.getElementById('panda-praise-embed-styles')) return;

    var style = document.createElement('style');
    style.id = 'panda-praise-embed-styles';
    style.textContent = \`
      .pp-wall-container {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 24px 16px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .pp-wall-masonry {
        column-count: 3;
        column-gap: 20px;
        width: 100%;
      }
      @media (max-width: 1024px) {
        .pp-wall-masonry { column-count: 2; }
      }
      @media (max-width: 640px) {
        .pp-wall-masonry { column-count: 1; }
      }
      .pp-card {
        break-inside: avoid;
        margin-bottom: 20px;
        border-radius: 20px;
        padding: 24px;
        box-sizing: border-box;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      }
      .pp-card:hover {
        transform: translateY(-3px);
      }

      /* ── THEME: LIGHT GRADIENT (Default) ── */
      .pp-theme-light_gradient .pp-card,
      .pp-theme-light .pp-card {
        background: #ffffff;
        border: 1px solid rgba(103, 1, 230, 0.12);
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
        color: #1e293b;
      }
      .pp-theme-light_gradient .pp-card:hover,
      .pp-theme-light .pp-card:hover {
        border-color: rgba(103, 1, 230, 0.35);
        box-shadow: 0 12px 30px -4px rgba(103, 1, 230, 0.12);
      }
      .pp-theme-light_gradient .pp-text,
      .pp-theme-light .pp-text {
        color: #334155;
      }
      .pp-theme-light_gradient .pp-author-name,
      .pp-theme-light .pp-author-name {
        color: #0f172a;
      }
      .pp-theme-light_gradient .pp-author-sub,
      .pp-theme-light .pp-author-sub {
        color: #64748b;
      }

      /* ── THEME: DARK MODE ── */
      .pp-theme-dark .pp-card {
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
        color: #f8fafc;
      }
      .pp-theme-dark .pp-card:hover {
        border-color: rgba(147, 51, 234, 0.5);
        box-shadow: 0 12px 30px -4px rgba(147, 51, 234, 0.25);
      }
      .pp-theme-dark .pp-text {
        color: #cbd5e1;
      }
      .pp-theme-dark .pp-author-name {
        color: #ffffff;
      }
      .pp-theme-dark .pp-author-sub {
        color: #94a3b8;
      }

      /* ── THEME: MINIMALIST ── */
      .pp-theme-minimalist .pp-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        box-shadow: none;
        color: #0f172a;
      }
      .pp-theme-minimalist .pp-card:hover {
        border-color: #0f172a;
      }
      .pp-theme-minimalist .pp-text {
        color: #475569;
      }
      .pp-theme-minimalist .pp-author-name {
        color: #0f172a;
      }
      .pp-theme-minimalist .pp-author-sub {
        color: #94a3b8;
      }

      /* Elements */
      .pp-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .pp-stars {
        display: flex;
        align-items: center;
        gap: 3px;
      }
      .pp-star {
        width: 16px;
        height: 16px;
      }
      .pp-source-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(0, 0, 0, 0.04);
      }
      .pp-theme-dark .pp-source-badge {
        background: rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
      }
      .pp-source-icon {
        width: 14px;
        height: 14px;
        display: inline-block;
      }
      .pp-text {
        font-size: 14px;
        line-height: 1.6;
        margin: 0 0 18px 0;
        font-weight: 400;
        word-break: break-word;
      }
      .pp-author-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 14px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }
      .pp-theme-dark .pp-author-row {
        border-top-color: rgba(255, 255, 255, 0.08);
      }
      .pp-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        background: #e2e8f0;
        flex-shrink: 0;
      }
      .pp-avatar-fallback {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6701e6, #a855f7);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        flex-shrink: 0;
      }
      .pp-author-meta {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .pp-author-name-line {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .pp-author-name {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .pp-verified-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }
      .pp-author-sub {
        font-size: 11px;
        margin: 2px 0 0 0;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .pp-footer-badge {
        text-align: center;
        margin-top: 30px;
      }
      .pp-footer-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-decoration: none;
        padding: 6px 14px;
        border-radius: 9999px;
        background: rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
      }
      .pp-theme-dark .pp-footer-link {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        color: #94a3b8;
      }
      .pp-footer-link:hover {
        color: #6701e6;
        border-color: rgba(103, 1, 230, 0.3);
      }
      .pp-heart {
        width: 13px;
        height: 13px;
      }
      .pp-skeleton {
        height: 140px;
        border-radius: 20px;
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 200% 100%;
        animation: pp-shimmer 1.5s infinite;
        margin-bottom: 20px;
      }
      .pp-theme-dark .pp-skeleton {
        background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
        background-size: 200% 100%;
      }
      @keyframes pp-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* ── LAYOUT: SPOTLIGHT (single card) ── */
      .pp-spotlight {
        max-width: 560px;
        margin: 0 auto;
      }

      /* ── LAYOUT: CAROUSEL ── */
      .pp-carousel {
        max-width: 600px;
        margin: 0 auto;
      }
      .pp-carousel-slide {
        display: none;
      }
      .pp-carousel-slide.pp-active {
        display: block;
        animation: pp-fade 0.4s ease;
      }
      @keyframes pp-fade {
        from { opacity: 0; transform: translateX(10px); }
        to { opacity: 1; transform: none; }
      }
      .pp-carousel-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-top: 16px;
      }
      .pp-carousel-btn {
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: #ffffff;
        cursor: pointer;
        font-size: 15px;
        line-height: 1;
        color: #334155;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .pp-carousel-btn:hover {
        border-color: #6701e6;
        color: #6701e6;
      }
      .pp-theme-dark .pp-carousel-btn {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
      }
      .pp-theme-dark .pp-carousel-btn:hover {
        border-color: #a855f7;
        color: #d8b4fe;
      }
      .pp-carousel-dots {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .pp-carousel-dot {
        width: 7px;
        height: 7px;
        border-radius: 9999px;
        background: rgba(100, 116, 139, 0.3);
        cursor: pointer;
        border: none;
        padding: 0;
        transition: all 0.2s ease;
      }
      .pp-carousel-dot.pp-active {
        background: #6701e6;
      }
      .pp-theme-dark .pp-carousel-dot.pp-active {
        background: #a855f7;
      }

      /* ── LAYOUT: TRUST BADGE ── */
      .pp-badge {
        display: block;
        max-width: 320px;
        margin: 0 auto;
        text-align: center;
        text-decoration: none;
        padding: 24px 20px;
        cursor: pointer;
      }
      .pp-badge-stars {
        display: flex;
        justify-content: center;
        gap: 3px;
        margin-bottom: 10px;
      }
      .pp-badge-stars .pp-star {
        width: 20px;
        height: 20px;
      }
      .pp-badge-rating {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 3px;
      }
      .pp-badge-count {
        font-size: 12px;
        opacity: 0.65;
        margin-bottom: 12px;
      }
      .pp-badge-brand {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 600;
        color: #6701e6;
      }
      .pp-theme-dark .pp-badge-brand {
        color: #c084fc;
      }
      .pp-badge-brand .pp-heart {
        width: 12px;
        height: 12px;
      }
    \`;
    document.head.appendChild(style);
  }

  function getInitials(name) {
    if (!name) return 'U';
    var parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function renderStars(rating) {
    var count = Math.min(Math.max(rating || 5, 1), 5);
    var stars = '';
    for (var i = 0; i < count; i++) {
      stars += ICONS.star;
    }
    return stars;
  }

  function renderSourceBadge(source) {
    var s = (source || '').toLowerCase();
    if (s === 'google') {
      return '<span class="pp-source-badge">' + ICONS.google + ' Google</span>';
    } else if (s === 'linkedin') {
      return '<span class="pp-source-badge">' + ICONS.linkedin + ' LinkedIn</span>';
    } else if (s === 'instagram') {
      return '<span class="pp-source-badge">' + ICONS.instagram + ' Instagram</span>';
    } else if (s === 'facebook') {
      return '<span class="pp-source-badge">' + ICONS.facebook + ' Facebook</span>';
    }
    return '';
  }

  function renderEmpty(container) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;font-size:13px;">No testimonials approved yet.</div>';
  }

  function renderCard(r) {
    var safeAvatar = sanitizeAvatarUrl(r.authorAvatar);
    var avatarHtml = '';
    if (safeAvatar) {
      avatarHtml = '<img src="' + safeAvatar + '" alt="' + escapeHtml(r.authorName || 'Avatar') + '" class="pp-avatar" onerror="this.remove()" />';
    } else {
      avatarHtml = '<div class="pp-avatar-fallback">' + escapeHtml(getInitials(r.authorName)) + '</div>';
    }

    var subtext = [r.authorTitle, r.authorCompany].filter(Boolean).map(escapeHtml).join(' • ');

    var html = '<div class="pp-card">';
    html += '  <div class="pp-top-row">';
    html += '    <div class="pp-stars">' + renderStars(r.rating) + '</div>';
    html += '    ' + renderSourceBadge(r.source);
    html += '  </div>';
    html += '  <p class="pp-text">"' + escapeHtml(r.text || '') + '"</p>';
    html += '  <div class="pp-author-row">';
    html += '    ' + avatarHtml;
    html += '    <div class="pp-author-meta">';
    html += '      <div class="pp-author-name-line">';
    html += '        <span class="pp-author-name">' + escapeHtml(r.authorName || 'Anonymous') + '</span>';
    if (r.verified) {
      html += ICONS.verified;
    }
    html += '      </div>';
    if (subtext) {
      html += '      <span class="pp-author-sub">' + subtext + '</span>';
    }
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
    return html;
  }

  function renderFooterBadge() {
    var html = '<div class="pp-footer-badge">';
    html += '  <a href="https://pandapraise.com" target="_blank" rel="noopener" class="pp-footer-link">';
    html += '    ' + ICONS.heart + ' Verified with Panda Praise';
    html += '  </a>';
    html += '</div>';
    return html;
  }

  function renderWall(container, data, theme) {
    var reviews = data.testimonials || [];
    if (reviews.length === 0) {
      renderEmpty(container);
      return;
    }

    var html = '<div class="pp-wall-container pp-theme-' + sanitizeTheme(theme) + '">';
    html += '<div class="pp-wall-masonry">';
    for (var i = 0; i < reviews.length; i++) {
      html += renderCard(reviews[i]);
    }
    html += '</div>';
    html += renderFooterBadge();
    html += '</div>';

    container.innerHTML = html;
  }

  function renderSpotlight(container, data, theme) {
    var reviews = data.testimonials || [];
    if (reviews.length === 0) {
      renderEmpty(container);
      return;
    }

    var html = '<div class="pp-wall-container pp-theme-' + sanitizeTheme(theme) + '">';
    html += '<div class="pp-spotlight">' + renderCard(reviews[0]) + '</div>';
    html += renderFooterBadge();
    html += '</div>';

    container.innerHTML = html;
  }

  function renderCarousel(container, data, theme) {
    var reviews = data.testimonials || [];
    if (reviews.length === 0) {
      renderEmpty(container);
      return;
    }

    var html = '<div class="pp-wall-container pp-theme-' + sanitizeTheme(theme) + '">';
    html += '<div class="pp-carousel">';
    for (var i = 0; i < reviews.length; i++) {
      html += '<div class="pp-carousel-slide' + (i === 0 ? ' pp-active' : '') + '">' + renderCard(reviews[i]) + '</div>';
    }
    if (reviews.length > 1) {
      html += '<div class="pp-carousel-nav">';
      html += '<button type="button" class="pp-carousel-btn pp-prev" aria-label="Previous review">&#8249;</button>';
      html += '<div class="pp-carousel-dots">';
      for (var d = 0; d < reviews.length; d++) {
        html += '<button type="button" class="pp-carousel-dot' + (d === 0 ? ' pp-active' : '') + '" aria-label="Go to review ' + (d + 1) + '"></button>';
      }
      html += '</div>';
      html += '<button type="button" class="pp-carousel-btn pp-next" aria-label="Next review">&#8250;</button>';
      html += '</div>';
    }
    html += '</div>';
    html += renderFooterBadge();
    html += '</div>';

    container.innerHTML = html;

    if (reviews.length <= 1) return;

    var idx = 0;
    var slides = container.querySelectorAll('.pp-carousel-slide');
    var dots = container.querySelectorAll('.pp-carousel-dot');

    function show(n) {
      idx = ((n % reviews.length) + reviews.length) % reviews.length;
      for (var s = 0; s < slides.length; s++) {
        slides[s].className = 'pp-carousel-slide' + (s === idx ? ' pp-active' : '');
        if (dots[s]) {
          dots[s].className = 'pp-carousel-dot' + (s === idx ? ' pp-active' : '');
        }
      }
    }

    var timer = null;
    function start() {
      stop();
      timer = setInterval(function () { show(idx + 1); }, 5000);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    var prev = container.querySelector('.pp-prev');
    var next = container.querySelector('.pp-next');
    if (prev) prev.addEventListener('click', function () { show(idx - 1); start(); });
    if (next) next.addEventListener('click', function () { show(idx + 1); start(); });
    for (var d2 = 0; d2 < dots.length; d2++) {
      (function (n) {
        dots[n].addEventListener('click', function () { show(n); start(); });
      })(d2);
    }
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    start();
  }

  function renderBadge(container, data, theme) {
    var total = typeof data.totalCount === 'number' ? data.totalCount : (data.testimonials || []).length;
    if (!total) {
      renderEmpty(container);
      return;
    }

    var avg = parseFloat(data.averageRating || '0') || 0;
    var projectId = container.getAttribute('data-project-id') || container.getAttribute('data-project') || '';
    var href = projectId
      ? 'https://pandapraise.com/w/' + encodeURIComponent(projectId)
      : 'https://pandapraise.com';

    var html = '<div class="pp-wall-container pp-theme-' + sanitizeTheme(theme) + '">';
    html += '<a class="pp-card pp-badge" href="' + href + '" target="_blank" rel="noopener">';
    html += '  <div class="pp-badge-stars">' + renderStars(Math.round(avg)) + '</div>';
    html += '  <div class="pp-badge-rating">' + escapeHtml(avg.toFixed(1)) + ' out of 5</div>';
    html += '  <div class="pp-badge-count">Based on ' + total + ' verified review' + (total === 1 ? '' : 's') + '</div>';
    html += '  <div class="pp-badge-brand">' + ICONS.heart + ' Panda Praise</div>';
    html += '</a>';
    html += '</div>';

    container.innerHTML = html;
  }

  var ALLOWED_LAYOUTS = { wall: true, carousel: true, spotlight: true, badge: true };

  function sanitizeLayout(layout) {
    return ALLOWED_LAYOUTS[layout] ? layout : 'wall';
  }

  function renderWidget(container, data, theme, layout) {
    switch (sanitizeLayout(layout)) {
      case 'carousel':
        return renderCarousel(container, data, theme);
      case 'spotlight':
        return renderSpotlight(container, data, theme);
      case 'badge':
        return renderBadge(container, data, theme);
      default:
        return renderWall(container, data, theme);
    }
  }

  function initContainers() {
    injectStyles();

    var scriptEl = document.currentScript;
    var scriptProj = scriptEl ? (scriptEl.getAttribute('data-project-id') || scriptEl.getAttribute('data-project')) : null;

    var targets = document.querySelectorAll('#panda-praise-wall, [data-panda-praise], .panda-praise-wall');
    if (!targets.length && scriptEl && scriptEl.parentNode) {
      var autoDiv = document.createElement('div');
      autoDiv.id = 'panda-praise-wall';
      if (scriptProj) autoDiv.setAttribute('data-project-id', scriptProj);
      scriptEl.parentNode.insertBefore(autoDiv, scriptEl);
      targets = [autoDiv];
    }
    if (!targets.length) return;

    for (var i = 0; i < targets.length; i++) {
      (function (container) {
        var projectId = container.getAttribute('data-project-id') || container.getAttribute('data-project') || scriptProj || 'default';
        var theme = container.getAttribute('data-theme') || 'light_gradient';
        var minRating = container.getAttribute('data-min-rating') || '0';
        var sources = container.getAttribute('data-sources') || 'google,linkedin,instagram,facebook,direct';
        var limit = container.getAttribute('data-max-count') || '18';
        var widgetType = sanitizeLayout(container.getAttribute('data-widget-type') || 'wall');

        // Skeleton loading state
        container.innerHTML = '<div class="pp-wall-container pp-theme-' + sanitizeTheme(theme) + '"><div class="pp-wall-masonry"><div class="pp-skeleton"></div><div class="pp-skeleton"></div><div class="pp-skeleton"></div><div class="pp-skeleton"></div><div class="pp-skeleton"></div><div class="pp-skeleton"></div></div></div>';

        var query = '?projectId=' + encodeURIComponent(projectId) +
          '&minRating=' + encodeURIComponent(minRating) +
          '&sources=' + encodeURIComponent(sources) +
          '&limit=' + encodeURIComponent(limit);

        fetch(API_BASE + '/api/embed/testimonials' + query)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            renderWidget(container, data, theme, widgetType);
          })
          .catch(function (err) {
            console.warn('[PandaPraise] Failed to load testimonials:', err);
            // Fallback rendering
            renderWidget(container, { testimonials: [] }, theme, widgetType);
          });
      })(targets[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContainers);
  } else {
    initContainers();
  }

  window.PandaPraise = {
    init: initContainers,
  };
})();
`;

  return new Response(scriptContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200',
    },
  });
}
