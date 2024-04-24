import * as React from 'react';
import { FaPlus } from 'react-icons/fa';
import { UserInfo, environ, getUserInfo } from '../utils';
import { getFullName } from '../utils';
import { getProfilePicture } from '../utils';

const API_URL = environ.API_URL;
const USER_DEFAULT_IMAGE = environ.USER_DEFAULT_IMAGE;

export type Thread = {
  id: string;
  title: string;
  project: string;
};

export interface ChatHistoryDisplay extends Thread {
  display: boolean;
}

interface ChatHistoryProps extends ChatHistoryDisplay {
  activateChat: (id: string) => void;
}

function ChatHistory(props: ChatHistoryProps & { active: boolean }) {
  return (
    <button
      onClick={() => props.activateChat(props.id)}
      className={
        'flex w-full flex-col gap-y-2 rounded-lg px-3 py-2 text-left transition-colors duration-200 hover:bg-slate-200 focus:outline-none' +
        (props.active ? ' border-l-4 shadow-lg border-light-primary' : '')
      }
    >
      <h1 className="text-sm font-medium capitalize text-light-text">
        {props.title}
      </h1>
    </button>
  );
}

function ProfilePicture({ picture }: { picture?: string }) {
  return (
    <img
      className="h-5 w-5 rounded-full"
      src={ picture || USER_DEFAULT_IMAGE }
      alt="profile picture"
    />
  );
}

type SideBarProps = {
  user: UserInfo | null;
  visible: boolean;
  active: string;
  onClose: () => void;
  activateChat: (id: string) => void;
  history: ChatHistoryDisplay[];
};

export default function SideBar({
  user,
  visible,
  history,
  active,
  activateChat,
}: SideBarProps) {
  return (
    <div
      style={{ width: 'fit-content', display: visible ? 'block' : 'none' }}
      className="shadow-lg fixed top-0 left-0 h-full w-64 bg-white border-l border-gray-200 overflow-auto z-10"
    >
      <div className="flex h-[100vh] w-60 flex-col overflow-y-auto bg-slate-50 pt-4 sm:h-[100vh] sm:w-64">
        <div className="flex px-4">
          <img src="/icons/icon48.png" alt="Logo" className="mr-2 h-8 w-8" />{' '}
          <h1 className="text-lg font-medium text-light-text">History</h1>
        </div>
        {/* New chat button */}
        <div className="mx-2 mt-8">
          <button
            className="flex w-full gap-x-4 rounded-lg border border-alx-red text-alx-red p-4 text-left text-sm font-medium transition-colors duration-200 hover:bg-alx-red hover:text-dark-text focus:outline-none">
            <FaPlus />
            New Chat
          </button>
        </div>
        {/* Previous chats container */}
        <div className="h-[80vh] space-y-4 overflow-y-auto border-b border-gray-500 px-2 py-4">
          {history.map((thread, index) => (thread.display ? (
            <ChatHistory
              key={index}
              {...thread}
              active={thread.id === active}
              activateChat={activateChat}
            />
          ) : null
          ))}
        </div>
        {/* User and settings buttons */}
        <div className="mt-auto w-full space-y-4 px-2 py-4">
          <button className="flex w-full gap-x-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-black transition-colors duration-200 hover:bg-slate-200 focus:outline-none">
            <ProfilePicture picture={user ? getProfilePicture(user) : ''} />
            {user ? getFullName(user) : 'Loading...'}
          </button>
        </div>
      </div>
    </div>
  );
}
