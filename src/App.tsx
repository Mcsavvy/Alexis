import './styles.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import NotSupported from './components/NotSupported';
import NotLoggedIn from './components/NotLoggedIn';
import NotProject from './components/NotProject';
import ChatPage from './components/ChatPage';
import {UserInfo, getUserInfo, onLoginStatusChange} from "./utils";
import * as Sentry from '@sentry/react';
import { isLoggedIn } from './utils';
import { getFullName } from './utils';


Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});

const INTRANET_ORIGIN = process.env.INTRANET_ORIGIN as string;

function App() {
  const [supported, setSupported] = React.useState(true);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [tabId, setTabId] = React.useState(0);
  const [isProject, setIsProject] = React.useState(false);

  onLoginStatusChange((loggedIn: boolean) => setLoggedIn(loggedIn));

  // @ts-ignore
  chrome.tabs.onUpdated.addListener((changedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (changedTabId !== tabId) return;
    Sentry.withScope(scope => {
      scope.setTransactionName('tabUpdated');
      handleTabUpdate({ id: changedTabId, url: changeInfo.url });
    });
  });

  function handleTabUpdate(tab: { id?: number, url?: string }) {
    if (!(tab.url && tab.id)) return;
    const url = new URL(tab.url);
    Sentry.setTag('tabId', tab.id.toString());
    Sentry.setTag('url', tab.url);
    if (url.origin !== INTRANET_ORIGIN) {
      Sentry.setTag('isSupported', 'false');
      setSupported(false);
    } else {
      Sentry.setTag('isSupported', 'true');
      setSupported(true);
    }
    if (url.pathname.match(/^\/projects\/\d+/) === null) {
      Sentry.setTag('isProject', 'false');
      setIsProject(false);
    } else {
      Sentry.setTag('isProject', 'true');
      setIsProject(true);
    }
  }

  useEffect(() => {
    Sentry.getCurrentScope()?.setTransactionName('App');
    Sentry.withScope(async(scope) => {
      scope.setTransactionName('getActiveTab');
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length === 0) {
        Sentry.captureMessage('No active tab', "warning");
        return;
      } else if (!tabs[0].id) {
        Sentry.captureMessage('No tab ID', "warning");
        return;
      }
      setTabId(tabs[0].id);
      handleTabUpdate(tabs[0]);
    });
  }, []);

  useEffect(() => {
    Sentry.withScope(async(scope) => {
      scope.setTransactionName('getLoggedIn');
      const loggedIn = isLoggedIn();
      console.log("loggedIn:", loggedIn);
      setLoggedIn(loggedIn || false);
    });
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      Sentry.setUser(null);
    } else {
      getUserInfo().then((userInfo) => {
        Sentry.setUser({
          username: getFullName(userInfo),
          email: userInfo.email,
        });
      });
    }
  }, [loggedIn]);

  if (!supported) {
    return <NotSupported />;
  } else if (!loggedIn) {
    return <NotLoggedIn />;
  } else if (!isProject) {
    return <NotProject />;
  }
  return <ChatPage />;
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('No root element found');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
