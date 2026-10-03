// extension/popup.js
// Client logic for PandaPraise Chrome Extension Popup
// India Edition: 7-Day Free Trial, ₹100/mo Subscription, WhatsApp Web In-Chat Clipper, UPI Proof Tags, Hinglish Polisher

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const tabClip = document.getElementById('tab-clip');
  const tabSearch = document.getElementById('tab-search');
  const tabSettings = document.getElementById('tab-settings');

  const viewClip = document.getElementById('view-clip');
  const viewSearch = document.getElementById('view-search');
  const viewSettings = document.getElementById('view-settings');

  const platformBadge = document.getElementById('platform-badge');
  const platformName = document.getElementById('platform-name');
  const trialBadge = document.getElementById('trial-badge');

  const clipForm = document.getElementById('clip-form');
  const authorNameInput = document.getElementById('author-name');
  const authorHandleInput = document.getElementById('author-handle');
  const quoteTextInput = document.getElementById('quote-text');
  const isPaymentProofInput = document.getElementById('is-payment-proof');
  const hinglishBtn = document.getElementById('hinglish-btn');
  const sourceUrlInput = document.getElementById('source-url');
  const saveBtn = document.getElementById('save-btn');
  const saveText = document.getElementById('save-text');
  const saveSpinner = document.getElementById('save-spinner');
  const clipStatus = document.getElementById('clip-status');

  const starContainer = document.getElementById('star-container');
  let currentRating = 5;

  const copyFormLinkBtn = document.getElementById('copy-form-link-btn');

  // Settings elements
  const settingsForm = document.getElementById('settings-form');
  const apiUrlInput = document.getElementById('api-url');
  const projectIdInput = document.getElementById('project-id');
  const collectionSlugInput = document.getElementById('collection-slug');
  const settingsStatus = document.getElementById('settings-status');
  const subStatusText = document.getElementById('sub-status-text');

  // Search elements
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // Paywall elements
  const paywallOverlay = document.getElementById('paywall-overlay');
  const licenseKeyInput = document.getElementById('license-key-input');
  const activateKeyBtn = document.getElementById('activate-key-btn');
  const paywallTitle = document.getElementById('paywall-title');
  const paywallPitch = document.getElementById('paywall-pitch');
  const paywallNote = document.getElementById('paywall-note');
  const paywallBtn = document.getElementById('paywall-btn');
  const paywallCloseBtn = document.getElementById('paywall-close-btn');
  const previewPaywallBtn = document.getElementById('preview-paywall-btn');

  // Language elements
  const extLangEn = document.getElementById('ext-lang-en');
  const extLangHi = document.getElementById('ext-lang-hi');

  const brandSub = document.getElementById('brand-sub');
  const lblAuthorName = document.getElementById('lbl-author-name');
  const lblAuthorHandle = document.getElementById('lbl-author-handle');
  const lblRating = document.getElementById('lbl-rating');
  const lblQuoteText = document.getElementById('lbl-quote-text');
  const upiText = document.getElementById('upi-text');
  const lblSourceUrl = document.getElementById('lbl-source-url');
  const copyLinkText = document.getElementById('copy-link-text');
  const copySafeInviteText = document.getElementById('copy-safe-invite-text');
  const searchEmptyText = document.getElementById('search-empty-text');

  const EXT_I18N = {
    en: {
      brandSub: 'WhatsApp & Social Proof Clipper',
      tabClip: 'Clip Praise',
      tabSearch: 'Search Vault',
      tabSettings: 'Settings',
      authorLabel: 'Client / Author Name *',
      authorPlaceholder: 'e.g. Ramesh Kumar or @acme',
      roleLabel: 'Channel / Role',
      rolePlaceholder: 'WhatsApp • Client',
      ratingLabel: 'Rating',
      quoteLabel: 'Testimonial / Praise Quote *',
      quotePlaceholder: 'Highlight text or click 🐼 Clip in WhatsApp / Twitter...',
      hinglishBtn: '🪄 Hinglish Polish',
      upiProof: '💳 Verified UPI / Transaction Proof',
      sourceUrlLabel: 'Source Link',
      saveBtn: 'Save to Proof Vault',
      copyLinkBtn: '🔗 Copy Link',
      copySafeInviteBtn: '🛡️ Copy Safe Invite',
      searchInputPlaceholder: 'Search testimonials for sales pitch...',
      searchEmpty: 'Connect your account in Settings to search your live testimonials library during sales chats.',
      safeInviteTemplate: (url) => `Hi! Could you take 2 seconds to share quick feedback on our work together? (100% safe link, no login, app, or password needed): ${url}`,
      copiedLink: '✓ Copied Link!',
      copiedInvite: '✓ Copied Safe Invite!',
      savedSuccess: '✨ Saved to Proof Vault successfully!',
      previewUpgradeBtn: '👑 View Pro Upgrade Screen',
      paywallTitle: 'Your 7-Day Trial has Ended',
      paywallPitch: 'Keep unlimited 1-click WhatsApp clipping, in-feed social buttons, and sales chat proof drops.',
      paywallNote: 'Supports UPI (GPay, PhonePe, Paytm), NetBanking & Cards',
      paywallBtn: 'Upgrade for ₹100/month',
      licensePlaceholder: 'Have an activation key?',
      activateBtn: 'Activate',
    },
    hi: {
      brandSub: 'WhatsApp aur Social Media Proof Clipper',
      tabClip: 'Praise Clip Karein',
      tabSearch: 'Vault Search',
      tabSettings: 'Settings',
      authorLabel: 'Client / Customer ka Naam *',
      authorPlaceholder: 'e.g. Ramesh Kumar ya @brand',
      roleLabel: 'Channel / Role',
      rolePlaceholder: 'WhatsApp • Customer',
      ratingLabel: 'Rating',
      quoteLabel: 'Testimonial / Review Quote *',
      quotePlaceholder: 'Text select karein ya WhatsApp / Twitter par 🐼 Clip dabayein...',
      hinglishBtn: '🪄 Hinglish Polish',
      upiProof: '💳 Verified UPI / Payment Proof',
      sourceUrlLabel: 'Source Link',
      saveBtn: 'Proof Vault Mein Save Karein 🚀',
      copyLinkBtn: '🔗 Link Copy Karein',
      copySafeInviteBtn: '🛡️ Safe Invite Copy Karein',
      searchInputPlaceholder: 'Sales chat ke liye testimonials search karein...',
      searchEmpty: 'Sales chat ke dauran testimonials search karne ke liye Settings mein account connect karein.',
      safeInviteTemplate: (url) => `Namaste! 🙏 Kya aap humare sath apne anubhav par 2 seconds nikal kar quick review de sakte hain? Yeh 100% safe link hai (koi login ya payment nahi chahiye): ${url}`,
      copiedLink: '✓ Link Copy Ho Gaya!',
      copiedInvite: '✓ Safe Invite Copy Ho Gaya!',
      savedSuccess: '✨ Vault mein save ho gaya!',
      previewUpgradeBtn: '👑 Pro Upgrade Screen Dekhein',
      paywallTitle: 'Aapka 7-Day Free Trial Samapt Ho Gaya',
      paywallPitch: 'Unlimited 1-click WhatsApp clipping, social buttons aur sales proof drop jari rakhne ke liye Pro upgrade karein.',
      paywallNote: 'UPI (GPay, PhonePe, Paytm), NetBanking aur Cards supported',
      paywallBtn: '₹100/mahina mein Upgrade Karein 🚀',
      licensePlaceholder: 'Activation key hai?',
      activateBtn: 'Activate Karein',
    }
  };

  let currentExtLang = 'en';

  function applyExtensionLanguage(lang) {
    currentExtLang = lang;
    const t = EXT_I18N[lang] || EXT_I18N.en;

    if (extLangEn && extLangHi) {
      if (lang === 'hi') {
        extLangHi.classList.add('active');
        extLangEn.classList.remove('active');
      } else {
        extLangEn.classList.add('active');
        extLangHi.classList.remove('active');
      }
    }

    if (brandSub) brandSub.textContent = t.brandSub;
    if (tabClip) tabClip.textContent = t.tabClip;
    if (tabSearch) tabSearch.textContent = t.tabSearch;
    if (tabSettings) tabSettings.textContent = t.tabSettings;

    if (lblAuthorName) lblAuthorName.textContent = t.authorLabel;
    if (authorNameInput) authorNameInput.placeholder = t.authorPlaceholder;

    if (lblAuthorHandle) lblAuthorHandle.textContent = t.roleLabel;
    if (authorHandleInput) authorHandleInput.placeholder = t.rolePlaceholder;

    if (lblRating) lblRating.textContent = t.ratingLabel;
    if (lblQuoteText) lblQuoteText.textContent = t.quoteLabel;
    if (quoteTextInput) quoteTextInput.placeholder = t.quotePlaceholder;

    if (upiText) upiText.textContent = t.upiProof;
    if (lblSourceUrl) lblSourceUrl.textContent = t.sourceUrlLabel;
    if (saveText) saveText.textContent = t.saveBtn;

    if (copyLinkText) copyLinkText.textContent = t.copyLinkBtn;
    if (copySafeInviteText) copySafeInviteText.textContent = t.copySafeInviteBtn;

    if (searchInput) searchInput.placeholder = t.searchInputPlaceholder;
    if (searchEmptyText) searchEmptyText.textContent = t.searchEmpty;

    if (previewPaywallBtn) previewPaywallBtn.textContent = t.previewUpgradeBtn;
    if (paywallTitle) paywallTitle.textContent = t.paywallTitle;
    if (paywallPitch) paywallPitch.textContent = t.paywallPitch;
    if (paywallNote) paywallNote.textContent = t.paywallNote;
    if (paywallBtn) paywallBtn.textContent = t.paywallBtn;
    if (licenseKeyInput) licenseKeyInput.placeholder = t.licensePlaceholder;
    if (activateKeyBtn) activateKeyBtn.textContent = t.activateBtn;
  }

  // ─────────────────────────────────────────────────────────────
  // 1. TRIAL ENGINE & ₹100/MO SUBSCRIPTION SYSTEM
  // ─────────────────────────────────────────────────────────────
  const storageData = await chrome.storage.local.get([
    'extLang',
    'trialStart',
    'isProUser',
    'proExpiresAt',
    'apiUrl',
    'projectId',
    'collectionSlug',
    'cachedReviews',
    'quickClip'
  ]);

  if (storageData.extLang) {
    applyExtensionLanguage(storageData.extLang);
  } else {
    applyExtensionLanguage('en');
  }

  if (extLangEn) {
    extLangEn.addEventListener('click', async () => {
      applyExtensionLanguage('en');
      await chrome.storage.local.set({ extLang: 'en' });
    });
  }

  if (extLangHi) {
    extLangHi.addEventListener('click', async () => {
      applyExtensionLanguage('hi');
      await chrome.storage.local.set({ extLang: 'hi' });
    });
  }

  let trialStart = storageData.trialStart;
  if (!trialStart) {
    trialStart = Date.now();
    await chrome.storage.local.set({ trialStart });
  }

  const TRIAL_DAYS = 7;
  const trialDurationMs = TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const elapsedMs = Date.now() - trialStart;
  const daysLeft = Math.max(0, Math.ceil((trialDurationMs - elapsedMs) / (24 * 60 * 60 * 1000)));

  const isPro = Boolean(storageData.isProUser && (storageData.proExpiresAt ? storageData.proExpiresAt > Date.now() : true));

  if (isPro) {
    trialBadge.textContent = '⭐ PRO (₹100/mo)';
    trialBadge.classList.add('pro-active');
    if (subStatusText) subStatusText.textContent = 'Status: Active Subscriber (₹100/month)';
  } else if (daysLeft > 0) {
    trialBadge.textContent = `✨ ${daysLeft}d Trial Left`;
    if (subStatusText) subStatusText.textContent = `Status: 7-Day Free Trial (${daysLeft} days remaining)`;
  } else {
    trialBadge.textContent = 'Trial Ended';
    if (subStatusText) subStatusText.textContent = 'Status: Trial Expired — ₹100/month required';
    // Display Paywall
    paywallOverlay.classList.remove('hidden');
  }

  // License Key Activation
  if (activateKeyBtn) {
    activateKeyBtn.addEventListener('click', async () => {
      const key = (licenseKeyInput.value || '').trim().toUpperCase();
      if (key.length >= 6) {
        // Unlock Pro
        const proExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
        await chrome.storage.local.set({ isProUser: true, proExpiresAt });
        paywallOverlay.classList.add('hidden');
        trialBadge.textContent = '⭐ PRO (₹100/mo)';
        trialBadge.classList.add('pro-active');
        alert('🎉 PandaPraise Pro successfully activated for 30 days!');
      } else {
        alert('Please enter a valid activation key or purchase a subscription.');
      }
    });
  }

  if (previewPaywallBtn) {
    previewPaywallBtn.addEventListener('click', () => {
      paywallOverlay.classList.remove('hidden');
    });
  }

  if (paywallCloseBtn) {
    paywallCloseBtn.addEventListener('click', () => {
      paywallOverlay.classList.add('hidden');
    });
  }

  trialBadge.addEventListener('click', () => switchTab(viewSettings, tabSettings));

  // ─────────────────────────────────────────────────────────────
  // 2. TAB NAVIGATION
  // ─────────────────────────────────────────────────────────────
  function switchTab(targetView, targetBtn) {
    [viewClip, viewSearch, viewSettings].forEach(v => v.classList.remove('active'));
    [tabClip, tabSearch, tabSettings].forEach(b => b.classList.remove('active'));

    targetView.classList.add('active');
    targetBtn.classList.add('active');
  }

  tabClip.addEventListener('click', () => switchTab(viewClip, tabClip));
  tabSearch.addEventListener('click', () => {
    switchTab(viewSearch, tabSearch);
    loadSearchReviews();
  });
  tabSettings.addEventListener('click', () => switchTab(viewSettings, tabSettings));

  // ─────────────────────────────────────────────────────────────
  // 3. STAR RATING SELECTION
  // ─────────────────────────────────────────────────────────────
  starContainer.addEventListener('click', (e) => {
    const star = e.target.closest('.star');
    if (!star) return;
    const rating = parseInt(star.getAttribute('data-rating'), 10);
    setRating(rating);
  });

  function setRating(rating) {
    currentRating = rating;
    const stars = starContainer.querySelectorAll('.star');
    stars.forEach(s => {
      const r = parseInt(s.getAttribute('data-rating'), 10);
      if (r <= rating) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 4. LOAD SAVED CONFIG & POPULATE FIELDS
  // ─────────────────────────────────────────────────────────────
  if (storageData.apiUrl) apiUrlInput.value = storageData.apiUrl;
  if (storageData.projectId) projectIdInput.value = storageData.projectId;
  if (storageData.collectionSlug) collectionSlugInput.value = storageData.collectionSlug;

  // ─────────────────────────────────────────────────────────────
  // 5. QUICK-CLIP / IN-PAGE DATA POPULATION
  // ─────────────────────────────────────────────────────────────
  let originalQuote = '';
  let isPolished = false;

  async function populateFromCurrentContext() {
    // 1. Check quickClip from WhatsApp or Twitter hover buttons
    if (storageData.quickClip && (Date.now() - storageData.quickClip.timestamp < 300000)) {
      const clip = storageData.quickClip;
      if (clip.text) {
        quoteTextInput.value = clip.text;
        originalQuote = clip.text;
      }
      if (clip.author) authorNameInput.value = clip.author;
      if (clip.handle) authorHandleInput.value = clip.handle;
      if (clip.url) sourceUrlInput.value = clip.url;
      if (clip.isPaymentProof) isPaymentProofInput.checked = true;

      platformName.textContent = (clip.platform || 'whatsapp').toUpperCase() + ' (Quick Clip ready)';
      chrome.storage.local.remove('quickClip');
      return;
    }

    // 2. Query active browser tab
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        sourceUrlInput.value = tab.url || '';

        chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_DATA' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            platformName.textContent = tab.url ? new URL(tab.url).hostname : 'Web Page';
            return;
          }

          if (response.platform) {
            platformName.textContent = response.platform.toUpperCase() + ' detected';
          }
          if (response.author && !authorNameInput.value) {
            authorNameInput.value = response.author;
          }
          if (response.handle && !authorHandleInput.value) {
            authorHandleInput.value = response.handle;
          }
          if (response.text && !quoteTextInput.value) {
            quoteTextInput.value = response.text;
            originalQuote = response.text;
            detectPaymentProof(response.text);
          }
        });
      }
    } catch {
      platformName.textContent = 'Ready to clip';
    }
  }

  function detectPaymentProof(text) {
    if (!text) return;
    if (/(upi|utr|₹|rs\.?|inr|gpay|phonepe|paytm|payment received|credited)/i.test(text)) {
      isPaymentProofInput.checked = true;
    }
  }

  quoteTextInput.addEventListener('input', () => {
    originalQuote = quoteTextInput.value;
    isPolished = false;
    detectPaymentProof(quoteTextInput.value);
  });

  // ─────────────────────────────────────────────────────────────
  // 6. HINGLISH <-> GLOBAL ENGLISH POLISHER (INDIA UNFAIR ADVANTAGE)
  // ─────────────────────────────────────────────────────────────
  hinglishBtn.addEventListener('click', () => {
    const text = quoteTextInput.value.trim();
    if (!text) return;

    if (!isPolished) {
      originalQuote = text;
      const polished = polishHinglish(text);
      quoteTextInput.value = polished;
      isPolished = true;
      hinglishBtn.textContent = '↩ Show Original';
    } else {
      quoteTextInput.value = originalQuote;
      isPolished = false;
      hinglishBtn.textContent = '🪄 Hinglish Polish';
    }
  });

  function polishHinglish(input) {
    let t = input;
    const rules = [
      { regex: /bhai\s*(kaam\s*bohot\s*mast\s*hua|kaam\s*bahut\s*mast\s*hai)/gi, replace: "The deliverables were outstanding and exceeded our expectations." },
      { regex: /ekdum\s*(top\s*class|mast|badhiya|shandar)/gi, replace: "absolutely top-tier and highly professional" },
      { regex: /paisa\s*vasool/gi, replace: "tremendous return on investment" },
      { regex: /bohot\s*(acha|badhiya|mast|fast)/gi, replace: "exceptionally good and remarkably fast" },
      { regex: /dil\s*khush\s*ho\s*gaya/gi, replace: "we are completely thrilled with the final results" },
      { regex: /service\s*ekdum\s*first\s*class/gi, replace: "the customer service was truly world-class" },
      { regex: /kaam\s*bahut\s*accha\s*hai/gi, replace: "the execution quality is top-notch" },
      { regex: /time\s*pe\s*delivery\s*mil\s*gayi/gi, replace: "project delivered right on schedule" },
      { regex: /bhai/gi, replace: "Team" }
    ];

    rules.forEach(rule => {
      t = t.replace(rule.regex, rule.replace);
    });

    // Capitalize first letter
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // ─────────────────────────────────────────────────────────────
  // 7. SUBMIT TESTIMONIAL TO PANDAPRAISE
  // ─────────────────────────────────────────────────────────────
  clipForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check trial expiration
    if (!isPro && daysLeft <= 0) {
      paywallOverlay.classList.remove('hidden');
      return;
    }

    const apiUrl = (apiUrlInput.value || 'https://pandapraise.com').replace(/\/+$/, '');
    const projectId = projectIdInput.value.trim();

    if (!projectId) {
      switchTab(viewSettings, tabSettings);
      showStatus(settingsStatus, 'Please enter your Project ID or log into pandapraise.com.', 'error');
      return;
    }

    const authorName = authorNameInput.value.trim();
    const quoteText = quoteTextInput.value.trim();
    const sourceUrl = sourceUrlInput.value.trim();
    const roleHandle = authorHandleInput.value.trim();
    const isPayment = isPaymentProofInput.checked;

    saveBtn.disabled = true;
    saveText.textContent = 'Saving...';
    saveSpinner.classList.remove('hidden');
    clipStatus.classList.add('hidden');

    const tags = ['chrome_extension'];
    if (isPayment) tags.push('verified_upi_proof');
    if (roleHandle.toLowerCase().includes('whatsapp')) tags.push('whatsapp');

    const reviewPayload = {
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorName,
      rating: currentRating,
      text: quoteText,
      platformUrl: sourceUrl,
      source: 'chrome_extension',
      role: roleHandle,
      tags
    };

    try {
      const res = await fetch(`${apiUrl}/api/import/commit-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          platform: isPayment ? 'whatsapp_payment' : 'chrome_extension',
          sourceUrl,
          reviews: [reviewPayload]
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.importedCount)) {
        const t = EXT_I18N[currentExtLang] || EXT_I18N.en;
        showStatus(clipStatus, t.savedSuccess, 'success');
        quoteTextInput.value = '';
        authorNameInput.value = '';
        authorHandleInput.value = '';
        isPaymentProofInput.checked = false;
        isPolished = false;
        hinglishBtn.textContent = t.hinglishBtn || '🪄 Hinglish Polish';
      } else {
        showStatus(clipStatus, data.error || 'Failed to save review. Please check your Project ID.', 'error');
      }
    } catch {
      showStatus(clipStatus, 'Network error. Ensure your PandaPraise instance is reachable.', 'error');
    } finally {
      const t = EXT_I18N[currentExtLang] || EXT_I18N.en;
      saveBtn.disabled = false;
      saveText.textContent = t.saveBtn;
      saveSpinner.classList.add('hidden');
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 8. COPY COLLECTION FORM LINK & SAFE INVITE
  // ─────────────────────────────────────────────────────────────
  function getActiveSlug() {
    const slug = (collectionSlugInput.value || '').trim() || (projectIdInput.value || '').trim();
    if (!slug || slug === 'your-brand' || slug.includes('[')) {
      switchTab(viewSettings, tabSettings);
      showStatus(settingsStatus, '⚠️ Please enter your Project Slug or ID first (or open pandapraise.com/dashboard to auto-sync).', 'error');
      projectIdInput.focus();
      return null;
    }
    return slug;
  }

  copyFormLinkBtn.addEventListener('click', () => {
    const slug = getActiveSlug();
    if (!slug) return;

    const langParam = currentExtLang === 'hi' ? '?lang=hi' : '';
    const formUrl = `https://pandapraise.com/c/${encodeURIComponent(slug)}${langParam}`;
    const t = EXT_I18N[currentExtLang] || EXT_I18N.en;
    navigator.clipboard.writeText(formUrl).then(() => {
      const originalText = copyLinkText ? copyLinkText.textContent : copyFormLinkBtn.textContent;
      if (copyLinkText) copyLinkText.textContent = t.copiedLink;
      else copyFormLinkBtn.textContent = t.copiedLink;
      setTimeout(() => {
        if (copyLinkText) copyLinkText.textContent = originalText;
        else copyFormLinkBtn.textContent = originalText;
      }, 2000);
    });
  });

  const copySafeInviteBtn = document.getElementById('copy-safe-invite-btn');
  if (copySafeInviteBtn) {
    copySafeInviteBtn.addEventListener('click', () => {
      const slug = getActiveSlug();
      if (!slug) return;

      const langParam = currentExtLang === 'hi' ? '?lang=hi' : '';
      const formUrl = `https://pandapraise.com/c/${encodeURIComponent(slug)}${langParam}`;
      const t = EXT_I18N[currentExtLang] || EXT_I18N.en;
      const safeInviteMsg = t.safeInviteTemplate(formUrl);
      navigator.clipboard.writeText(safeInviteMsg).then(() => {
        const originalText = copySafeInviteText ? copySafeInviteText.textContent : copySafeInviteBtn.textContent;
        if (copySafeInviteText) copySafeInviteText.textContent = t.copiedInvite;
        else copySafeInviteBtn.textContent = t.copiedInvite;
        setTimeout(() => {
          if (copySafeInviteText) copySafeInviteText.textContent = originalText;
          else copySafeInviteBtn.textContent = originalText;
        }, 2000);
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 9. SAVE SETTINGS
  // ─────────────────────────────────────────────────────────────
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
      apiUrl: apiUrlInput.value.trim(),
      projectId: projectIdInput.value.trim(),
      collectionSlug: collectionSlugInput.value.trim()
    };

    chrome.storage.local.set(settings, () => {
      showStatus(settingsStatus, '✓ Settings saved successfully!', 'success');
      setTimeout(() => {
        switchTab(viewClip, tabClip);
      }, 1000);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 10. SEARCH REVIEWS VAULT (SALES TOOL + DROP INTO ACTIVE CHAT)
  // ─────────────────────────────────────────────────────────────
  async function loadSearchReviews() {
    const projectId = projectIdInput.value.trim();
    if (!projectId) {
      searchResults.innerHTML = '<div class="empty-state">Add your Project ID in Settings to search testimonials.</div>';
      return;
    }

    searchResults.innerHTML = '<div class="empty-state">Loading your Proof Vault...</div>';

    try {
      const apiUrl = (apiUrlInput.value || 'https://pandapraise.com').replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/reviews?projectId=${encodeURIComponent(projectId)}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.reviews || []);
        chrome.storage.local.set({ cachedReviews: list });
        renderReviews(list);
      } else {
        const { cachedReviews } = await chrome.storage.local.get('cachedReviews');
        renderReviews(cachedReviews || []);
      }
    } catch {
      const { cachedReviews } = await chrome.storage.local.get('cachedReviews');
      renderReviews(cachedReviews || []);
    }
  }

  function renderReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      searchResults.innerHTML = '<div class="empty-state">No testimonials found. Clip a few quotes or collect reviews to start!</div>';
      return;
    }

    const query = (searchInput.value || '').toLowerCase().trim();
    const filtered = reviews.filter(r => {
      if (!query) return true;
      return (r.name && r.name.toLowerCase().includes(query)) ||
             (r.content && r.content.toLowerCase().includes(query)) ||
             (r.role && r.role.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      searchResults.innerHTML = '<div class="empty-state">No testimonials match your search.</div>';
      return;
    }

    searchResults.innerHTML = filtered.slice(0, 10).map(r => `
      <div class="result-card">
        <div class="result-header">
          <span>${escapeHtml(r.name)}</span>
          <span style="color: #f59e0b;">${'★'.repeat(r.rating || 5)}</span>
        </div>
        <p class="result-body">"${escapeHtml((r.content || '').slice(0, 140))}${r.content && r.content.length > 140 ? '...' : ''}"</p>
        <div class="result-actions">
          <button class="copy-mini-btn" data-quote="${escapeHtml(r.content || '')}">Copy Quote</button>
          <button class="copy-mini-btn" data-author="${escapeHtml(r.name)} - ${escapeHtml(r.company || r.role || '')}">Copy Citation</button>
          <button class="copy-mini-btn chat-drop-btn" data-drop-text="&quot;${escapeHtml(r.content || '')}&quot; — ${escapeHtml(r.name)}">💬 Drop in Chat</button>
        </div>
      </div>
    `).join('');

    // Attach copy & chat drop handlers
    searchResults.querySelectorAll('.copy-mini-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const dropText = btn.getAttribute('data-drop-text');
        if (dropText) {
          // Drop into active WhatsApp / LinkedIn / web composer
          try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'PASTE_INTO_CHAT', text: dropText }, (res) => {
                if (res && res.success) {
                  btn.textContent = '✓ Dropped!';
                  setTimeout(() => { btn.textContent = '💬 Drop in Chat'; }, 2000);
                } else {
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(dropText);
                  btn.textContent = '✓ Copied!';
                  setTimeout(() => { btn.textContent = '💬 Drop in Chat'; }, 2000);
                }
              });
            }
          } catch {
            navigator.clipboard.writeText(dropText);
          }
          return;
        }

        const text = btn.getAttribute('data-quote') || btn.getAttribute('data-author');
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = orig; }, 1500);
          });
        }
      });
    });
  }

  searchInput.addEventListener('input', () => {
    chrome.storage.local.get('cachedReviews', (res) => {
      renderReviews(res.cachedReviews || []);
    });
  });

  // Helpers
  function showStatus(el, msg, type) {
    el.textContent = msg;
    el.className = `status-msg ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => {
      el.classList.add('hidden');
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Populate data on start
  populateFromCurrentContext();
});
