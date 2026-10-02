// extension/content.js
// Runs on web pages to extract praise, tweets, and user selections

function detectSocialContext() {
  const url = window.location.href;
  const selection = window.getSelection() ? window.getSelection().toString().trim() : '';

  // 1. Twitter / X tweet detection
  if (url.includes('twitter.com') || url.includes('x.com')) {
    const tweetEl = document.querySelector('article[data-testid="tweet"]');
    if (tweetEl) {
      const nameEl = tweetEl.querySelector('[data-testid="User-Name"]');
      const textEl = tweetEl.querySelector('[data-testid="tweetText"]');
      const avatarEl = tweetEl.querySelector('img[src*="profile_images"]');

      let authorName = '';
      let handle = '';
      if (nameEl) {
        const textParts = nameEl.innerText.split('\n');
        authorName = textParts[0] || '';
        handle = textParts[1] || '';
      }

      const tweetText = textEl ? textEl.innerText.trim() : '';
      const avatarUrl = avatarEl ? avatarEl.src : '';

      return {
        platform: 'twitter',
        author: authorName || 'X User',
        handle: handle || '@user',
        text: selection || tweetText,
        url: url,
        avatar: avatarUrl
      };
    }
  }

  // 2. LinkedIn detection
  if (url.includes('linkedin.com')) {
    const authorEl = document.querySelector('.update-components-actor__name, .feed-shared-actor__name');
    const authorName = authorEl ? authorEl.innerText.trim() : '';

    return {
      platform: 'linkedin',
      author: authorName || 'LinkedIn Connection',
      handle: '',
      text: selection,
      url: url,
      avatar: ''
    };
  }

  // 3. WhatsApp Web detection
  if (url.includes('web.whatsapp.com')) {
    const headerTitleEl = document.querySelector('header span[title]');
    const sender = headerTitleEl ? headerTitleEl.getAttribute('title') : 'Client';

    return {
      platform: 'whatsapp',
      author: sender || 'WhatsApp Client',
      handle: 'WhatsApp',
      text: selection,
      url: url,
      avatar: ''
    };
  }

  // 4. Slack detection
  if (url.includes('slack.com')) {
    return {
      platform: 'slack',
      author: 'Slack Team / Client',
      handle: 'Slack',
      text: selection,
      url: url,
      avatar: ''
    };
  }

  // 5. Generic Web Page Fallback
  return {
    platform: 'web',
    author: '',
    handle: '',
    text: selection,
    url: url,
    avatar: ''
  };
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_DATA') {
    const data = detectSocialContext();
    sendResponse({
      title: document.title,
      ...data
    });
  }
  return true;
});
