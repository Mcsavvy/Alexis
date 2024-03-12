import { io, Socket } from 'socket.io-client';
import * as React from 'react';
import { getAccessToken } from '../utils';

const socket = io(process.env.API_URL, {
  autoConnect: false,
  transports: ['websocket'],
});
socket.auth = async (cb: (data: object) => void) => {
  const currentTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const url = new URL(currentTab[0].url);
  const projectID = url.pathname.match(/^\/projects\/(\d+)/)[1];
  const accessToken = await getAccessToken();
  cb({ projectID, accessToken });
}

export default socket;

export function addHandler(
  event: string,
  handler: (...args: any[]) => void
): () => void {
  if (socket.listeners(event).filter((l) => l === handler).length > 0) {
    return () => {};
  }
  socket.on(event, handler);
  return () => socket.off(event, handler);
}

export type ChatInfo = {
  thread_id: string;
  thread_title: string;
  query_id: string;
  response_id: string;
};

export function SocketIO() {

  function onConnect() {
    console.log('connected');
  }

  function onDisconnect(reason: string) {
    console.log('disconnected', reason);
  }

  function onError(err: any) {
    console.error(err);
  }

  React.useEffect(() => {
    const handlers = [
      addHandler('connect', onConnect),
      addHandler('disconnect', onDisconnect),
      addHandler('error', onError),
    ];
    socket.connect();

    return () => {
      handlers.forEach((h) => h());
      socket.disconnect();
    };
  }, []);

  return <div />;
}
