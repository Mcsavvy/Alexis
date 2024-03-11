import './styles.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import NotSupported from './components/NotSupported';
import NotLoggedIn from './components/NotLoggedIn';
import NotProject from './components/NotProject';
import ChatPage from './components/ChatPage';
import {onLoginStatusChange} from "./utils";

const INTRANET_ORIGIN = process.env.INTRANET_ORIGIN as string;

function App() {
  const [supported, setSupported] = React.useState(true);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [tabId, setTabId] = React.useState(0);
  const [isProject, setIsProject] = React.useState(false);

  onLoginStatusChange((loggedIn: boolean) => setLoggedIn(loggedIn));

  chrome.tabs.onUpdated.addListener((changedTabId, changeInfo) => {
    if (changedTabId !== tabId) return;
    if (changeInfo.url) {
      const url = new URL(changeInfo.url);
      if (url.origin !== INTRANET_ORIGIN) {
        setSupported(false);
      }
      setIsProject(url.pathname.match(/^\/projects\/\d+/) !== null);
    }
  });

  useEffect(() => {
    (async () => {
      const tab = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setTabId(tab[0].id);
      const url = new URL(tab[0].url);
      if (url.origin !== INTRANET_ORIGIN) {
        setSupported(false);
      }
      setIsProject(url.pathname.match(/^\/projects\/\d+/) !== null);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { loggedIn } = await chrome.storage.session.get('loggedIn');
      setLoggedIn(loggedIn || false);
    })();
  }, []);

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
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
