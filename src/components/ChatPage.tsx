import * as React from 'react';
import { FiSidebar } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { LuArrowUpSquare } from 'react-icons/lu';
// import { FiThumbsUp, FiThumbsDown, FiSidebar } from 'react-icons/fi';
// import { MdContentCopy } from 'react-icons/md';
import SideBar, { Thread, ChatHistoryDisplay } from './SideBar';
import { UserInfo, getAccessToken, getUserInfo } from '../utils';
import Markdown, { Components } from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { saveCurrentThread } from '../utils';
import { getCurrentThread } from '../utils';
import socket, { SocketIO, ChatInfo, addHandler } from './Socket';

const API_URL = process.env.API_URL as string;
const USER_DEFAULT_IMAGE = process.env.USER_DEFAULT_IMAGE as string;
const INTRANET_ORIGIN = process.env.INTRANET_ORIGIN as string;

const Components: Components = {
  a: ({ node, href, ...props }) => {
    const url = new URL(href);
    if (url.origin === 'https://rltoken') {
      href = INTRANET_ORIGIN + '/rltoken' + url.pathname;
    }
    return <a href={href} {...props} target="_blank" />;
  },
};

export function HumanMessage({
  message,
  picture,
}: {
  message: ChatMessage;
  picture?: string;
}) {
  return message.content ? (
    <div className="flex flex-row px-4 py-8 sm:px-6">
      <img
        className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
        src={picture || USER_DEFAULT_IMAGE}
      />

      <div className="flex max-w-3xl items-center">
        <Markdown className="chat-message human-chat" components={Components}>
          {message.content}
        </Markdown>
      </div>
    </div>
  ) : null;
}

export function AIMessage({ message }: { message: ChatMessage }) {
  return message.content ? (
    <div className="flex bg-white px-4 py-8 sm:px-6">
      <img
        className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
        src="/icons/icon48.png"
      />

      <div className="flex w-full flex-col items-start lg:flex-row lg:justify-between">
        <Markdown
          className="max-w-3xl chat-message ai-chat"
          components={Components}
        >
          {message.content}
        </Markdown>
        {/* <div className="mt-4 flex flex-row justify-start gap-x-2 text-slate-500 lg:mt-0">
          <button className="hover:text-light-primary">
            <FiThumbsUp />
          </button>
          <button className="hover:text-light-primary" type="button">
            <FiThumbsDown />
          </button>
          <button className="hover:text-light-primary" type="button">
            <MdContentCopy />
          </button>
        </div> */}
      </div>
    </div>
  ) : null;
}

async function fetchThreads(project: string): Promise<Thread[]> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_URL}/chat/threads/${project}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data: Thread[] = await response.json();
  console.log('fetched threads:', data);
  return data;
}

async function fetchMessages(thread: string): Promise<ChatMessage[]> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_URL}/chat/threads/${thread}/messages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data: any[] = await response.json();
  console.log('fetched messages:', data);
  return data.map((message) => ({
    id: message.id,
    content: message.content,
    type: message.chat_type.toLowerCase() == 'query' ? 'human' : 'ai',
  }));
}

type ChatMessage = {
  id: string;
  content: string;
  type: 'human' | 'ai';
};

export default function ChatPage() {
  const [project, setProject] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<ChatHistoryDisplay[]>(
    []
  );
  const queryId = React.useRef('fakeQueryID');
  const responseId = React.useRef('fakeResponseID');
  const userInfo = React.useRef<UserInfo | null>(null);
  const [response, _setResponse] = React.useState('');
  const responseRef = React.useRef(response);
  const [activeChatID, _setActiveChatID] = React.useState<string>();
  const activeChatIdRef = React.useRef<string | null>(activeChatID);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [activeThread, setActiveThread] = React.useState<Thread | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [query, setQuery] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const isNewThread = React.useRef(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  function setActiveChatID(id: string | ((id: string) => string)) {
    _setActiveChatID((prev) => {
      console.log('Setting active chat to:', id);
      let newId;
      if (typeof id === 'function') newId = id(prev);
      else newId = id;
      activeChatIdRef.current = newId;
      return newId;
    });
  }

  function setResponse(res: string | ((res: string) => string)) {
    _setResponse((prev) => {
      let newResponse;
      if (typeof res === 'function') newResponse = res(prev);
      else newResponse = res;
      responseRef.current = newResponse;
      return newResponse;
    });
  }

  function handleSend() {
    const msg = query.trim();
    if (!msg) return;
    setMessages((messages) => [
      ...messages,
      { id: queryId.current, content: query, type: 'human' },
    ]);
    setQuery('');
    const payload: { query: string; thread_id?: string } = { query: msg };
    if (activeChatID !== 'new-chat') payload['thread_id'] = activeChatID;
    else isNewThread.current = true;
    console.log('sending query with payload:', payload);
    setTyping(true);
    socket.emit('query', payload, () => {
      setTyping(false);
      console.log('got response:', responseRef.current);
      const aiResponse = responseRef.current;
      setMessages((messages) => [
        ...messages,
        { id: responseId.current, content: aiResponse, type: 'ai' },
      ]);
      setResponse('');
    });
  }

  async function initialSetup() {
    const tab = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = new URL(tab[0].url);
    const projectId = url.pathname.match(/^\/projects\/(\d+)/)[1];
    setProject(projectId);
    userInfo.current = await getUserInfo();
    const threads = await fetchThreads(projectId);
    setChatHistory([
      { id: 'new-chat', title: 'New Chat', display: false, project: projectId },
      ...threads.map((thread) => ({
        ...thread,
        display: true,
        active: false,
      })),
    ]);
    const threadId = await getCurrentThread(projectId);
    if (threadId && threads.find((thread) => thread.id === threadId)) {
      setActiveChatID(threadId);
    } else {
      setActiveChatID('new-chat');
    }
  }

  // Setup
  React.useEffect(() => {
    initialSetup();

    function onChatInfo(info: ChatInfo) {
      console.log('Got chat info:', info);
      console.log('Active chat:', activeChatIdRef.current);
      if (info.thread_id !== activeChatIdRef.current) {
        const thread: Thread = {
          id: info.thread_id,
          title: info.thread_title,
          project: project,
        };
        setActiveChatID(thread.id);
        setChatHistory((history) => [
          { ...thread, display: true, active: true },
          ...history,
        ]);
      } else {
        console.log('Already active chat');
      }
    }

    function onReponse({ chunk }: { chunk: string }) {
      setResponse((response) => response + chunk);
    }

    const handlers = [
      addHandler('chat_info', onChatInfo),
      addHandler('response', onReponse),
    ];
    return () => {
      handlers.forEach((h) => h());
    };
  }, []);

  // Fetch messages for the active chat
  React.useEffect(() => {
    if (!activeChatID) return;
    const active = chatHistory.find((chat) => chat.id === activeChatID);
    setActiveThread({
      id: active.id,
      title: active.title,
      project: active.project,
    });
    if (activeChatID === 'new-chat') {
      setMessages([]);
    } else {
      saveCurrentThread(active.id, active.project);
      !isNewThread.current &&
        fetchMessages(active.id).then((messages) => {
          setMessages(messages);
        });
    }
  }, [activeChatID]);

  // Scroll to the bottom of the chat
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, response]);

  return (
    <div className="flex h-[100vh] w-full flex-col">
      {/* SideBar */}
      <SocketIO />
      <SideBar
        visible={showSidebar}
        history={chatHistory}
        onClose={() => setShowSidebar(false)}
        active={activeChatID}
        activateChat={setActiveChatID}
      />
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-slate-100 text-black shadow-lg">
        <div className="flex items-center">
          <img src="/icons/icon48.png" alt="Logo" className="mr-2 h-8 w-8" />{' '}
          <h1 className="text-lg font-medium text-light-text">
            {activeThread ? activeThread.title : 'Loading...'}
          </h1>{' '}
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className=" hover:text-light-primary"
        >
          <FiSidebar className="w-5 h-5" />
        </button>
      </nav>

      {/* Prompt Messages */}
      <div className="flex-1 overflow-y-auto pb-20 bg-light-panel text-sm leading-6 text-slate-900 shadow-md sm:text-base sm:leading-7">
        {messages.map((msg, index) =>
          msg.type === 'human' ? (
            <HumanMessage
              key={index}
              message={msg}
              picture={userInfo.current?.picture}
            />
          ) : (
            <AIMessage key={index} message={msg} />
          )
        )}
        <AIMessage
          message={{ id: responseId.current, content: response, type: 'ai' }}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt message input */}
      <form className="fixed bottom-0 left-0 right-0  flex w-full items-end rounded-b-md border-t border-slate-300 bg-slate-200 p-2">
        <label htmlFor="chat" className="sr-only">
          Enter your prompt
        </label>
        <TextareaAutosize
          id="chat"
          value={query}
          readOnly={typing}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-h-full w-full rounded-md border border-slate-300 bg-slate-50 p-2 text-base text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          placeholder={
            activeThread
              ? activeThread.id == 'new-chat'
                ? `What's on your mind?`
                : `Talking about ${activeThread.title}`
              : 'Ready to chat?'
          }
          // send message on ctrl+enter
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div>
          <button
            disabled={!query || typing}
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="inline-flex sm:p-2"
          >
            {typing ? (
              <CgSpinner className="animate-spin h-8 w-8 text-light-primary" />
            ) : (
              <LuArrowUpSquare className="w-8 h-8" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
