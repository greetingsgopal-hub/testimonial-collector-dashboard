// extension/popup.js
// Client logic for PandaPraise Chrome Extension Popup

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

  const clipForm = document.getElementById('clip-form');
  const authorNameInput = document.getElementById('author-name');
  const authorHandleInput = document.getElementById('author-handle');
  const quoteTextInput = document.getElementById('quote-text');
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
  const apiKeyInput = document.getElementById('api-key');
  const collectionSlugInput = document.getElementById('collection-slug');
  const settingsStatus = document.getElementById('settings-status');

  // Search elements
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // 1. Tab Navigation
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

  // 2. Star Rating Selection
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

  // 3. Load Stored Configuration
  const config = await chrome.storage.local.get([
    'apiUrl',
    'projectId',
    'apiKey',
    'collectionSlug',
    'cachedReviews'
  ]);

  if (config.apiUrl) apiUrlInput.value = config.apiUrl;
  if (config.projectId) projectIdInput.value = config.projectId;
  if (config.apiKey) apiKeyInput.value = config.apiKey;
  if (config.collectionSlug) collectionSlugInput.value = config.collectionSlug;

  // 4. Capture Data from Current Web Page
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      sourceUrlInput.value = tab.url || '';

      // Check if quickClip exists from context menu
      const { quickClip } = await chrome.storage.local.get('quickClip');
      if (quickClip && (Date.now() - quickClip.timestamp < 30000)) {
        quoteTextInput.value = quickClip.text || '';
        if (quickClip.url) sourceUrlInput.value = quickClip.url;
        chrome.storage.local.remove('quickClip');
      }

      // Send message to content script to detect author/selection
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_DATA' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          // Fallback if script cannot inject (e.g. chrome:// tabs)
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
        }
      });
    }
  } catch (err) {
    platformName.textContent = 'Ready to clip';
  }

  // 5. Submit Testimonial to PandaPraise
  clipForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const apiUrl = (apiUrlInput.value || 'https://pandapraise.com').replace(/\/+$/, '');
    const projectId = projectIdInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!projectId && !apiKey) {
      switchTab(viewSettings, tabSettings);
      showStatus(settingsStatus, 'Please enter your Project ID or API Token first.', 'error');
      return;
    }

    const authorName = authorNameInput.value.trim();
    const quoteText = quoteTextInput.value.trim();
    const sourceUrl = sourceUrlInput.value.trim();
    const roleHandle = authorHandleInput.value.trim();

    saveBtn.disabled = true;
    saveText.textContent = 'Saving...';
    saveSpinner.classList.remove('hidden');
    clipStatus.classList.add('hidden');

    const reviewPayload = {
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorName,
      rating: currentRating,
      text: quoteText,
      platformUrl: sourceUrl,
      source: 'chrome_extension'
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch(`${apiUrl}/api/import/commit-reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId: projectId || undefined,
          apiKey: apiKey || undefined,
          platform: 'chrome_extension',
          sourceUrl,
          reviews: [reviewPayload]
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.importedCount)) {
        showStatus(clipStatus, '✨ Saved to Proof Vault successfully!', 'success');
        quoteTextInput.value = '';
        authorNameInput.value = '';
        authorHandleInput.value = '';
      } else {
        showStatus(clipStatus, data.error || 'Failed to save review. Please check your Project ID.', 'error');
      }
    } catch (err) {
      showStatus(clipStatus, 'Network error. Ensure your PandaPraise instance is reachable.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveText.textContent = 'Save to Proof Vault';
      saveSpinner.classList.add('hidden');
    }
  });

  // 6. Copy Collection Form Link
  copyFormLinkBtn.addEventListener('click', () => {
    const slug = collectionSlugInput.value.trim() || projectIdInput.value.trim() || 'your-brand';
    const formUrl = `https://pandapraise.com/c/${slug}`;
    navigator.clipboard.writeText(formUrl).then(() => {
      const originalText = copyFormLinkBtn.textContent;
      copyFormLinkBtn.textContent = '✓ Copied link to clipboard!';
      setTimeout(() => {
        copyFormLinkBtn.textContent = originalText;
      }, 2000);
    });
  });

  // 7. Save Settings
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
      apiUrl: apiUrlInput.value.trim(),
      projectId: projectIdInput.value.trim(),
      apiKey: apiKeyInput.value.trim(),
      collectionSlug: collectionSlugInput.value.trim()
    };

    chrome.storage.local.set(settings, () => {
      showStatus(settingsStatus, '✓ Settings saved successfully!', 'success');
      setTimeout(() => {
        switchTab(viewClip, tabClip);
      }, 1000);
    });
  });

  // 8. Search Reviews Vault (Sales Flow)
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
        // Fallback to cached reviews
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
        </div>
      </div>
    `).join('');

    // Attach copy handlers
    searchResults.querySelectorAll('.copy-mini-btn').forEach(btn => {
      btn.addEventListener('click', () => {
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
});
