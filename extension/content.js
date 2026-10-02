// extension/content.js
// Advanced multi-platform DOM extractor & in-page clipper
// Supports: WhatsApp Web (Native In-Chat), Twitter/X, LinkedIn, Slack, and PandaPraise Auto-Auth Sync

(function () {
  const currentUrl = window.location.href;

  // ─────────────────────────────────────────────────────────────
  // 1. AUTO-AUTH SYNC WITH PANDAPRAISE DASHBOARD
  // ─────────────────────────────────────────────────────────────
  if (currentUrl.includes('pandapraise.com') || currentUrl.includes('localhost:5173')) {
    function syncPandaSession() {
      try {
        const storedProjectId = localStorage.getItem('pandapraise_project_id') ||
                                sessionStorage.getItem('pandapraise_project_id');
        const storedSlug = localStorage.getItem('pandapraise_collection_slug') ||
                           sessionStorage.getItem('pandapraise_collection_slug');

        if (storedProjectId) {
          chrome.storage.local.set({
            projectId: storedProjectId,
            collectionSlug: storedSlug || storedProjectId,
            apiUrl: window.location.origin
          }, () => {
            console.log('[PandaPraise Extension] Synced active project:', storedProjectId);
          });
        }
      } catch (e) {
        // Ignored in cross-origin / sandbox
      }
    }

    // Sync on page load and on custom window messages
    syncPandaSession();
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PANDAPRAISE_AUTH_SYNC') {
        chrome.storage.local.set({
          projectId: event.data.projectId,
          collectionSlug: event.data.slug || event.data.projectId,
          apiUrl: window.location.origin
        }, () => {
          showPandaToast('🐼 PandaPraise Extension connected to your project!');
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. IN-PAGE TOAST NOTIFICATION
  // ─────────────────────────────────────────────────────────────
  function showPandaToast(message, isSuccess = true) {
    const existing = document.getElementById('pandapraise-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pandapraise-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${isSuccess ? '#1e1b4b' : '#881337'};
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
      z-index: 9999999;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    `;

    toast.innerHTML = `
      <span style="font-size: 16px;">🐼</span>
      <span>${escapeHtml(message)}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. WHATSAPP WEB IN-CHAT CLIPPER (INDIA UNFAIR ADVANTAGE)
  // ─────────────────────────────────────────────────────────────
  if (currentUrl.includes('web.whatsapp.com')) {
    console.log('[PandaPraise] WhatsApp Web native praise clipper active');

    function checkUpiPayment(text) {
      if (!text) return false;
      const lower = text.toLowerCase();
      return /(upi|utr|₹|rs\.?|inr|gpay|phonepe|paytm|payment received|payment sent|credited)/i.test(lower);
    }

    function extractWhatsAppSender() {
      // 1. Check active chat header
      const headerTitle = document.querySelector('header span[title]');
      if (headerTitle) {
        return headerTitle.getAttribute('title') || headerTitle.innerText.trim();
      }
      return 'WhatsApp Client';
    }

    function attachWhatsAppHoverButtons() {
      const messages = document.querySelectorAll('div.message-in:not([data-pandapraise-hooked]), div[data-pre-plain-text]:not([data-pandapraise-hooked])');
      
      messages.forEach(msg => {
        msg.setAttribute('data-pandapraise-hooked', 'true');
        
        msg.addEventListener('mouseenter', () => {
          if (msg.querySelector('.pandapraise-wa-btn')) return;

          const btn = document.createElement('button');
          btn.className = 'pandapraise-wa-btn';
          btn.innerHTML = '🐼 Clip';
          btn.title = 'Clip this praise to PandaPraise Proof Vault';
          btn.style.cssText = `
            position: absolute;
            top: 2px;
            right: 4px;
            background: #6701e6;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 2px 7px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0.9;
            transition: all 0.15s ease;
          `;

          btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1.05)'; });
          btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.9'; btn.style.transform = 'scale(1)'; });

          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            // Extract message text
            const textEl = msg.querySelector('span.selectable-text') || msg.querySelector('span[dir="ltr"]') || msg;
            const messageText = (textEl ? textEl.innerText : msg.innerText).trim();

            // Extract sender name from metadata attribute if present
            let sender = extractWhatsAppSender();
            const prePlainText = msg.getAttribute('data-pre-plain-text');
            if (prePlainText) {
              const match = prePlainText.match(/\]\s*([^:]+):/);
              if (match && match[1]) sender = match[1].trim();
            }

            const hasPaymentProof = checkUpiPayment(messageText);

            chrome.storage.local.set({
              quickClip: {
                text: messageText,
                author: sender,
                handle: 'WhatsApp' + (hasPaymentProof ? ' • Verified UPI' : ''),
                platform: 'whatsapp',
                isPaymentProof: hasPaymentProof,
                url: window.location.href,
                timestamp: Date.now()
              }
            }, () => {
              showPandaToast(hasPaymentProof ? '💳 Payment & Praise Clipped! Open Panda extension to save' : '✨ WhatsApp Praise Clipped! Open Panda extension to save');
            });
          });

          // Ensure container is positioned
          if (window.getComputedStyle(msg).position === 'static') {
            msg.style.position = 'relative';
          }
          msg.appendChild(btn);
        });

        msg.addEventListener('mouseleave', () => {
          const btn = msg.querySelector('.pandapraise-wa-btn');
          if (btn) btn.remove();
        });
      });
    }

    // Run periodically to catch newly incoming messages
    setInterval(attachWhatsAppHoverButtons, 1500);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. TWITTER / X IN-FEED CLIPPER
  // ─────────────────────────────────────────────────────────────
  if (currentUrl.includes('twitter.com') || currentUrl.includes('x.com')) {
    function attachTwitterButtons() {
      const actionGroups = document.querySelectorAll('article[data-testid="tweet"] div[role="group"]:not([data-pandapraise-hooked])');
      actionGroups.forEach(group => {
        group.setAttribute('data-pandapraise-hooked', 'true');

        const btn = document.createElement('div');
        btn.role = 'button';
        btn.tabIndex = 0;
        btn.title = 'Clip Tweet to PandaPraise';
        btn.innerHTML = '<span style="font-size: 15px; cursor: pointer;">🐼</span>';
        btn.style.cssText = `
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          cursor: pointer;
          transition: transform 0.15s ease;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();

          const tweetArticle = group.closest('article[data-testid="tweet"]');
          if (!tweetArticle) return;

          const nameEl = tweetArticle.querySelector('[data-testid="User-Name"]');
          const textEl = tweetArticle.querySelector('[data-testid="tweetText"]');
          const avatarEl = tweetArticle.querySelector('img[src*="profile_images"]');
          const linkEl = tweetArticle.querySelector('a[href*="/status/"]');

          let author = 'X User';
          let handle = '@user';
          if (nameEl) {
            const parts = nameEl.innerText.split('\n');
            author = parts[0] || author;
            handle = parts[1] || handle;
          }

          const tweetText = textEl ? textEl.innerText.trim() : '';
          const tweetUrl = linkEl ? linkEl.href : window.location.href;
          const avatarUrl = avatarEl ? avatarEl.src : '';

          chrome.storage.local.set({
            quickClip: {
              text: tweetText,
              author,
              handle,
              avatar: avatarUrl,
              platform: 'twitter',
              url: tweetUrl,
              timestamp: Date.now()
            }
          }, () => {
            showPandaToast(`✨ Tweet from ${author} clipped! Click Panda to save.`);
          });
        });

        group.appendChild(btn);
      });
    }

    setInterval(attachTwitterButtons, 2000);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. LINKEDIN IN-FEED CLIPPER
  // ─────────────────────────────────────────────────────────────
  if (currentUrl.includes('linkedin.com')) {
    function attachLinkedInButtons() {
      const actionBars = document.querySelectorAll('.feed-shared-social-actions:not([data-pandapraise-hooked]), .feed-shared-social-action-bar:not([data-pandapraise-hooked])');
      actionBars.forEach(bar => {
        bar.setAttribute('data-pandapraise-hooked', 'true');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary';
        btn.innerHTML = '<span style="margin-right: 4px;">🐼</span><span style="font-size: 12px; font-weight: 600;">Clip Praise</span>';
        btn.style.cssText = `
          display: inline-flex;
          align-items: center;
          padding: 6px 8px;
          color: #6701e6;
          cursor: pointer;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();

          const postEl = bar.closest('.feed-shared-update-v2, .occludable-update, article');
          let author = 'LinkedIn Member';
          let postText = '';

          if (postEl) {
            const nameEl = postEl.querySelector('.update-components-actor__name, .feed-shared-actor__name');
            if (nameEl) author = nameEl.innerText.trim();

            const textEl = postEl.querySelector('.feed-shared-update-v2__description, .update-components-text');
            if (textEl) postText = textEl.innerText.trim();
          }

          chrome.storage.local.set({
            quickClip: {
              text: postText || window.getSelection().toString(),
              author,
              handle: 'LinkedIn',
              platform: 'linkedin',
              url: window.location.href,
              timestamp: Date.now()
            }
          }, () => {
            showPandaToast(`✨ LinkedIn post from ${author} clipped!`);
          });
        });

        bar.appendChild(btn);
      });
    }

    setInterval(attachLinkedInButtons, 2500);
  }

  // ─────────────────────────────────────────────────────────────
  // 6. GENERAL CONTEXT DETECTOR & MESSAGE DISPATCH
  // ─────────────────────────────────────────────────────────────
  function detectSocialContext() {
    const url = window.location.href;
    const selection = window.getSelection() ? window.getSelection().toString().trim() : '';

    if (url.includes('twitter.com') || url.includes('x.com')) {
      const tweetEl = document.querySelector('article[data-testid="tweet"]');
      if (tweetEl) {
        const nameEl = tweetEl.querySelector('[data-testid="User-Name"]');
        const textEl = tweetEl.querySelector('[data-testid="tweetText"]');
        const avatarEl = tweetEl.querySelector('img[src*="profile_images"]');

        let authorName = '';
        let handle = '';
        if (nameEl) {
          const parts = nameEl.innerText.split('\n');
          authorName = parts[0] || '';
          handle = parts[1] || '';
        }

        return {
          platform: 'twitter',
          author: authorName || 'X User',
          handle: handle || '@user',
          text: selection || (textEl ? textEl.innerText.trim() : ''),
          url,
          avatar: avatarEl ? avatarEl.src : ''
        };
      }
    }

    if (url.includes('web.whatsapp.com')) {
      const headerTitle = document.querySelector('header span[title]');
      return {
        platform: 'whatsapp',
        author: headerTitle ? headerTitle.getAttribute('title') : 'WhatsApp Client',
        handle: 'WhatsApp',
        text: selection,
        url,
        avatar: ''
      };
    }

    if (url.includes('linkedin.com')) {
      const authorEl = document.querySelector('.update-components-actor__name, .feed-shared-actor__name');
      return {
        platform: 'linkedin',
        author: authorEl ? authorEl.innerText.trim() : 'LinkedIn Connection',
        handle: 'LinkedIn',
        text: selection,
        url,
        avatar: ''
      };
    }

    return {
      platform: 'web',
      author: '',
      handle: '',
      text: selection,
      url,
      avatar: ''
    };
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_DATA') {
      sendResponse({
        title: document.title,
        ...detectSocialContext()
      });
      return true;
    }

    // PASTE_INTO_CHAT: Sales tool drops social proof directly into WhatsApp / LinkedIn
    if (request.type === 'PASTE_INTO_CHAT') {
      const quoteText = request.text;
      if (!quoteText) return;

      // WhatsApp Web composer
      if (currentUrl.includes('web.whatsapp.com')) {
        const composer = document.querySelector('footer div[contenteditable="true"]') ||
                         document.querySelector('div[data-tab="10"]');
        if (composer) {
          composer.focus();
          document.execCommand('insertText', false, quoteText);
          showPandaToast('✓ Social proof pasted into WhatsApp message!');
          sendResponse({ success: true });
          return true;
        }
      }

      // LinkedIn or generic contenteditable
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable || activeEl.tagName === 'INPUT')) {
        if (activeEl.isContentEditable) {
          document.execCommand('insertText', false, quoteText);
        } else {
          activeEl.value += (activeEl.value ? '\n\n' : '') + quoteText;
        }
        showPandaToast('✓ Testimonial pasted into input!');
        sendResponse({ success: true });
        return true;
      }

      showPandaToast('Click inside the message box first, then drop quote.', false);
      sendResponse({ success: false });
      return true;
    }

    return true;
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
