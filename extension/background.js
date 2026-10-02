// extension/background.js
// Service worker for PandaPraise extension context menus and shortcuts

chrome.runtime.onInstalled.addListener(() => {
  // Create right-click context menu
  chrome.contextMenus.create({
    id: 'pandapraise-clip-selection',
    title: 'Send highlighted quote to PandaPraise',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'pandapraise-clip-page',
    title: 'Clip this page to PandaPraise',
    contexts: ['page', 'link']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pandapraise-clip-selection') {
    const selectedText = info.selectionText || '';
    const pageUrl = tab ? tab.url : '';
    const pageTitle = tab ? tab.title : '';

    // Cache the quick clip data so popup can consume it immediately
    chrome.storage.local.set({
      quickClip: {
        text: selectedText,
        url: pageUrl,
        title: pageTitle,
        timestamp: Date.now()
      }
    }, () => {
      // Open popup or notify
      chrome.action.openPopup().catch(() => {
        // If openPopup is not allowed programmatically in this browser context, badge it
        chrome.action.setBadgeText({ text: '1', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#6701e6' });
      });
    });
  }
});
