'use strict';
import utils from "./utils";
const API_URL = 'https://alexis-api-ed4af4cf5335.herokuapp.com';
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

(async () => {
  utils.authenticate();
  chrome.cookies.onChanged.addListener(utils.handleCookieChange);
})();
