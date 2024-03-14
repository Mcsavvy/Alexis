'use strict';
import {handleCookieChange, authenticate} from "./utils";
import * as Sentry from '@sentry/browser';


const API_URL = process.env.API_URL;
const INTRANET_ORIGIN = process.env.INTRANET_ORIGIN;

Sentry.WINDOW.document = {
  visibilityState: 'hidden',
  addEventListener: () => {},
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [Sentry.browserTracingIntegration()],
});


chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => {
    const transaction = Sentry.startSpan({name: 'setPanelBehavior', op: 'background'});
    Sentry.withScope((scope) => {
      scope.setTransactionName('setPanelBehavior');
      Sentry.captureException(error);
    });
    console.error('Error setting panel behavior:', error);
  });


chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  Sentry.withScope(async(scope) => {
    scope.setTransactionName('tabUpdated');
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
});


// Listen for message from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  Sentry.withScope((scope) => {
    scope.setTransactionName('runtimeMessage');
    scope.setContext('message', message);
    scope.setContext('sender', sender);
    if (message.type === 'open_side_panel') {
      const url = new URL(sender.tab.url);
      if (url.origin !== INTRANET_ORIGIN) {
        console.log('Not opening side panel on non-intranet page');
        return;
      }
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  });
});

(async () => {
  authenticate();
  chrome.cookies.onChanged.addListener(handleCookieChange);
})();
