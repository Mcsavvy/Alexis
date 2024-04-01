import * as React from 'react';
import { FiSidebar } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { LuArrowUpSquare } from 'react-icons/lu';
// import { FiThumbsUp, FiThumbsDown, FiSidebar } from 'react-icons/fi';
// import { MdContentCopy } from 'react-icons/md';
import SideBar, { Thread, ChatHistoryDisplay } from './SideBar';
import { UserInfo, environ, getAccessToken, getUserInfo } from '../utils';
import Markdown, { Components } from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { saveCurrentThread } from '../utils';
import { getCurrentThread } from '../utils';
import socket, { SocketIO, ChatInfo, addHandler } from './Socket';
import * as Sentry from '@sentry/react';
import { getFullName } from '../utils';
import { getProfilePicture } from '../utils';

const API_URL = environ.API_URL;
const INTRANET_ORIGIN = environ.INTRANET_ORIGIN;

const Components: Components = {
  a: ({ node, href, ...props }) => {
    const url = new URL(href);
    if (url.origin === 'https://rltoken') {
      href = INTRANET_ORIGIN + '/rltoken' + url.pathname;
    }
    return <a href={href} {...props} target="_blank" />;
  },
};

interface BaseMessageProps {
  message: ChatMessage;
  msgRef?: React.LegacyRef<HTMLDivElement>;
}

interface HumanMessageProps extends BaseMessageProps {
  picture?: string;
}

interface AIMessageProps extends BaseMessageProps {}

export function HumanMessage({ message, picture, msgRef }: HumanMessageProps) {
  return message.content ? (
    <div className="flex flex-row px-4 py-8 sm:px-6" ref={msgRef}>
      <img
        className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
        src={picture}
      />

      <div className="flex max-w-3xl items-center">
        <Markdown className="chat-message human-chat" components={Components}>
          {message.content}
        </Markdown>
      </div>
    </div>
  ) : null;
}

export function AIMessage({ message, msgRef}: AIMessageProps) {
  return message.content ? (
    <div className="flex bg-white px-4 py-8 sm:px-6" ref={msgRef}>
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
  return await Sentry.withScope(async (scope) => {
    const accessToken = await getAccessToken();
    scope.setTransactionName('fetchThreads');
    const response = await fetch(`${API_URL}/chat/threads/${project}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data: Thread[] = await response.json();
    console.log('fetched threads:', data);
    return data;
  });
}

async function fetchMessages(thread: string): Promise<ChatMessage[]> {
  return await Sentry.withScope(async (scope) => {
    scope.setTransactionName('fetchThreadMessages');
    scope.setTag('thread', thread);
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
  });
}

type ChatMessage = {
  id: string;
  content: string;
  type: 'human' | 'ai';
};

type ChatPageProps = {
  user?: UserInfo;
}

export default function ChatPage({ user }: ChatPageProps) {
  const [project, setProject] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<ChatHistoryDisplay[]>(
    []
  );
  const queryIdRef = React.useRef('fakeQueryID');
  const responseIdRef = React.useRef('fakeResponseID');
  const [response, _setResponse] = React.useState('');
  const [query, _setQuery] = React.useState('');
  const responseRef = React.useRef(response);
  const queryRef = React.useRef(query);
  const [activeChatID, _setActiveChatID] = React.useState<string>();
  const activeChatIdRef = React.useRef<string | null>(activeChatID);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [activeThread, setActiveThread] = React.useState<Thread | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const isNewThread = React.useRef(false);
  const lastChatMessageRef = React.useRef<HTMLDivElement>(null);
  const tempHumanMessageRef = React.useRef<HTMLDivElement>(null);
  const tempAIMessageRef = React.useRef<HTMLDivElement>(null);
  const responseTokenCountRef = React.useRef(0);

  function setActiveChatID(id: string | ((id: string) => string)) {
    _setActiveChatID((prev) => {
      console.log('Setting active chat to:', id);
      let newId;
      if (typeof id === 'function') newId = id(prev);
      else newId = id;
      activeChatIdRef.current = newId;
      Sentry.setTag('activeThread', newId);
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

  function setQuery(q: string | ((r: string) => string)) {
    _setQuery((prev) => {
      let newQuery;
      if (typeof q === 'function') newQuery = q(prev);
      else newQuery = q;
      queryRef.current = newQuery;
      return newQuery;
    });
  }

  function handleChatInfo(info: ChatInfo) {
    tempHumanMessageRef.current?.scrollIntoView({behavior: "smooth"});
    Sentry.withScope((scope) => {
      scope.setTransactionName('handleChatInfo');
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
        queryIdRef.current = info.query_id;
        responseIdRef.current = info.response_id;
      } else {
        console.log('Already active chat');
      }
    });
  }

  function handleReponse({ chunk }: { chunk: string }) {
    Sentry.withScope((scope) => {
      scope.setTransactionName('handleResponse');
      setResponse((response) => response + chunk);
      responseTokenCountRef.current++;
    });
    if (responseTokenCountRef.current % 20 == 0) {
      // scroll into view after every 20 tokens
      tempAIMessageRef.current?.scrollIntoView({behavior: "smooth"})
    }
  }

  function afterSend() {
    setTyping(false);
    console.log('got response:', responseRef.current);
    const aiResponse = responseRef.current;
    const humanQuery = queryRef.current;
    setMessages((messages) => [
      ...messages,
      { id: queryIdRef.current, content: humanQuery, type: 'human' },
      { id: responseIdRef.current, content: aiResponse, type: 'ai' },
    ]);
    setResponse('');
    setQuery('');
  }

  function handleSend() {
    const msg = input.trim();
    if (!msg) return;
    setQuery(msg);
    setInput('');
    const payload: { query: string; thread_id?: string } = { query: msg };
    if (activeChatID !== 'new-chat') payload['thread_id'] = activeChatID;
    else isNewThread.current = true;
    console.log('sending query with payload:', payload);
    setTyping(true);
    socket.emit('query', payload, afterSend);
  }

  async function initialSetup() {
    const tab = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    Sentry.getCurrentScope().setTransactionName('Chat');
    const url = new URL(tab[0].url);
    const projectId = url.pathname.match(/^\/projects\/(\d+)/)[1];
    setProject(projectId);
    Sentry.setTag('projectId', projectId);
    user && Sentry.setUser({
      username: getFullName(user),
      email: user.email,
    });
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
    const handlers = [
      addHandler('chat_info', handleChatInfo),
      addHandler('response', handleReponse),
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
    lastChatMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-[100vh] w-full flex-col">
      {/* SideBar */}
      <SocketIO />
      <SideBar
        user={user}
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
              picture={user ? getProfilePicture(user) : ''}
            />
          ) : (
            <AIMessage
              key={index}
              message={msg}
              msgRef={index == messages.length - 1 ? lastChatMessageRef : null}
            />
          )
        )}
        <HumanMessage
          message={{ id: '', content: query, type: 'human' }}
          picture={user ? getProfilePicture(user) : ''}
          msgRef={tempHumanMessageRef}
        />
        <AIMessage
          message={{ id: '', content: response, type: 'ai' }}
          msgRef={tempAIMessageRef}
        />
      </div>

      {/* Prompt message input */}
      <form className="fixed bottom-0 left-0 right-0  flex w-full items-end rounded-b-md border-t border-slate-300 bg-slate-200 p-2">
        <label htmlFor="chat" className="sr-only">
          Enter your prompt
        </label>
        <TextareaAutosize
          id="chat"
          value={input}
          readOnly={typing}
          onChange={(e) => setInput(e.target.value)}
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
            disabled={!input || typing}
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
