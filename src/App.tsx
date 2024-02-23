import './styles.css';
import * as React from 'react'
import { createRoot } from "react-dom/client";
import { useEffect } from 'react'
import LandingPage from './components/LandingPage';
import NotSupported from './components/NotSupported';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/Signup';
import SideBar from './components/SideBar';

const INTRANET_ORIGIN = 'https://intranet.alxswe.com';


const router = createMemoryRouter([
  {
    path: "/",
    element: <LandingPage />,
    index: true,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/chat",
    element: <SideBar visible={true} />,
  },
]);


function App() {
  const [supported, setSupported] = React.useState(true);
  useEffect(() => {
    (async () => {
        const tab = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = new URL(tab[0].url);
        console.log("sidepanel loaded on:", tab[0].url);
        if (url.origin !== INTRANET_ORIGIN) {
            setSupported(false);
        }
    })();
  }, []);
  return (
    supported ? <RouterProvider router={router}/> : <NotSupported />
  );
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.update) {
    console.log('Received update from background script:', message.update);
    // Update the side panel UI based on the received information
    // document.getElementById('messageDisplay').textContent = message.update;
  }
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
