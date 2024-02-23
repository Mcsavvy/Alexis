'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const INTRANET_ORIGIN = 'https://intranet.alxswe.com';

chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => {
    console.error('Error setting panel behavior:', error);
  });


chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  console.log('origin:', url.origin);
  // only enable when the tab is fully loaded
  if (info.status !== 'complete') return;
  // Enables the side panel on the intranet
  if (url.origin === INTRANET_ORIGIN) {
    console.log('Enabling side panel');
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true,
    });
  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message) {
    console.log('Received message from %s:', message.from, message.message);
    // Further processing or relaying the message

    // Send a response back to the content script (optional)
    sendResponse({ response: 'pong', from: 'background' });
  }
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.update) {
//     // Find the relevant side panel based on sender or other identifier
//     chrome.runtime.sendMessage(sender.tab.id, { update: message.update });
//   }
// });

// Listen for message from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'open_side_panel') {
    const url = new URL(sender.tab.url);
    if (url.origin !== INTRANET_ORIGIN) {
      console.log('Not opening side panel on non-intranet page');
      return;
    }
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
});
