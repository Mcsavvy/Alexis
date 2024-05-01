import * as React from 'react';
import { UserInfo, environ, getUserInfo } from '../utils';
import { getFullName } from '../utils';
import { getProfilePicture } from '../utils';
import { FiEdit } from 'react-icons/fi';
import { MdClose } from "react-icons/md";
import { MdEdit, MdDelete } from "react-icons/md";
import { TimeAgo } from './utils';
import { getAccessToken } from '../utils';

const API_URL = environ.API_URL;
const USER_DEFAULT_IMAGE = environ.USER_DEFAULT_IMAGE;

export type Thread = {
  id: string;
  title: string;
  project: string;
  created_at: string;
  description: string;
};

export interface ChatHistoryDisplay extends Thread {
  display: boolean;
}

interface ChatHistoryProps extends ChatHistoryDisplay {
  activateChat: (id: string) => void;
  deleteChat: (id: string) => void;
  editChat: (id: string, data: {title: string}) => void;
}


async function editChat(id: string, data: {title: string}): Promise<Thread> {
  const accessToken = await getAccessToken();
  try {
    const response = await fetch(`${API_URL}/chat/threads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  } catch (error) {
    throw error;
  }
}

async function deleteChat(id: string): Promise<void> {
  const accessToken = await getAccessToken();
  try {
    const response = await fetch(`${API_URL}/chat/threads/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    throw error;
  }
}

function ChatHistory({
  id,
  activateChat,
  title,
  created_at,
  description,
  deleteChat,
  editChat,
}: ChatHistoryProps & { active: boolean }) {

  const [editing, setEditing] = React.useState(false);
  const [chatTitle, setTitle] = React.useState(title);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  function startEditing() {
    setEditing(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  }

  function finishEditing() {
    setEditing(false);
    if (chatTitle !== title) {
      if (chatTitle.trim().length) {
        editChat(id, { title: chatTitle });
      } else {
        setTitle(title);
      }
    }
  }

  return (
    <div
      className="flex w-full flex-col p-2 group/chat my-0 hover:bg-slate-200 border-t group-first:border-t-0  border-gray-200"
      onClick={() => activateChat(id)}
    >
      <div className="flex justify-between items-start">
        {editing ? (
          <input
            ref={titleInputRef}
            value={chatTitle}
            onChange={(e) => setTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="border border-blue-400 rounded-sm text-sm"
            onBlur={finishEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                finishEditing();
              }
            }}
          />
        ) : (
          <h1
            className="text-sm font-medium text-black whitespace-nowrap max-w-[65%] overflow-hidden text-ellipsis"
            onDoubleClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
          >
            {chatTitle}
          </h1>
        )}
        <p className="text-xs text-gray-500">
          <TimeAgo date={created_at} />
        </p>
      </div>
      <div className="flex items-start justify-between">
        <p className="text-xs text-gray-500 whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
          {description}
        </p>
        <div className="flex items-start">
          <button
            title="Edit Title"
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            disabled={editing}
            className="text-xs hidden group-hover/chat:block text-gray-500 hover:text-blue-500"
          >
            <MdEdit className="w-4 h-4" />
          </button>
          <button
            title="Delete Chat"
            onClick={(e) => {
              e.stopPropagation();
              deleteChat(id);
            }}
            className="text-xs hidden group-hover/chat:block text-gray-500 hover:text-red-500"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePicture({ picture }: { picture?: string }) {
  return (
    <img
      className="h-6 w-6 rounded-full"
      src={ picture || USER_DEFAULT_IMAGE }
      alt="profile picture"
    />
  );
}

type SideBarProps = {
  user: UserInfo | null;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  active: string;
  onClose: () => void;
  activateChat: (id: string) => void;
  history: ChatHistoryDisplay[];
  setHistory: React.Dispatch<React.SetStateAction<ChatHistoryDisplay[]>>;
};

export default function SideBar({
  user,
  visible,
  history,
  active,
  activateChat,
  setVisible,
  setHistory,
}: SideBarProps) {

  const sidebarRef = React.useRef<HTMLDivElement>(null);


  function handleEditChat(id: string, data: {title: string}) {
    editChat(id, data).then((thread) => {
      setHistory((history) =>
        history.map((t) => (t.id === thread.id ? { ...t, ...thread } : t))
      );
    });
  }

  function handleDeleteChat(id: string) {
    deleteChat(id).then(() => {
      setHistory((history) => history.filter((t) => t.id !== id));
    });
    if (active === id) {
      activateChat('new-chat');
    }
  }

  function handleActivateChat(id: string) {
    setVisible(false);
    activateChat(id);
  }


  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div
    style={{ display: visible ? 'block' : 'none' }}
    className="fixed top-0 left-0 h-full w-full bg-[#00000080] overflow-auto z-10"
    >
      <div
        className="flex h-full w-[75%] bg-white flex-col overflow-y-auto px-4 pt-4"
        id="sidebar"
        ref={sidebarRef}
      >
        <div className="flex justify-between">
          <div className="flex items-start">
            <div className="border border-gray-200 rounded-full mr-0.5">
              <img
                src="/icons/icon48.png"
                alt="Logo"
                className="h-6 w-6 p-0.5"
              />
            </div>
            <h1 className="text-lg font-medium text-black">Alexis</h1>
          </div>
          <button onClick={() => setVisible(false)} title="Close Menu">
            <MdClose className="w-5 h-5 hover:text-alx-red text-black" />
          </button>
        </div>
        {/* Previous chats container */}
        <div className="h-[80vh] placeholder:backdrop:mt-6">
          <div className="text-center text-black text-lg font-bold mb-2">
            Chat History
            {' '}
            <span className='font-normal text-gray-600'>({history.length})</span>
          </div>
          <div className='overflow-y-auto h-full w-full'>
            {history.map((thread, index) =>
              thread.display ? (
                <ChatHistory
                  key={index}
                  {...thread}
                  active={thread.id === active}
                  activateChat={handleActivateChat}
                  deleteChat={handleDeleteChat}
                  editChat={handleEditChat}
                />

              ) : null
            )}
          </div>
        </div>
        <div className="flex items-start justify-between mt-auto w-full mb-2">
          <div className="flex items-start justify-start">
            <ProfilePicture picture={user ? getProfilePicture(user) : ''} />
            <span className='font-bold ml-2 pt-1'>{user ? getFullName(user) : 'Loading...'}</span>
          </div>
          <button title='New Chat' className="text-black" onClick={() => activateChat('new-chat')}>
            <FiEdit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
