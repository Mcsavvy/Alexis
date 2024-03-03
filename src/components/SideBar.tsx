import * as React from 'react';
import { FaPlus } from 'react-icons/fa';
import storage, { UserInfo } from '../storage';

const API_URL = 'https://alexis-api-ed4af4cf5335.herokuapp.com';
('https://intranet.alxswe.com/projects/1232');

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
      src={
        picture ||
        'https://gravatar.com/avatar/b58996c504c5638798eb6b511e6f49af?s=400&d=robohash&r=x'
      }
      alt="profile picture"
    />
  );
}

type SideBarProps = {
  visible: boolean;
  active: string;
  onClose: () => void;
  activateChat: (id: string) => void;
  history: ChatHistoryDisplay[];
};

export default function SideBar({
  visible,
  history,
  active,
  activateChat,
}: SideBarProps) {
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);

  React.useEffect(() => {
    storage.getUserInfo().then((info) => {
      setUserInfo(info);
    });
  }, []);

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
            onClick={() => activateChat('new-chat')}
            className="flex w-full gap-x-4 rounded-lg border border-light-primary text-light-primary p-4 text-left text-sm font-medium transition-colors duration-200 hover:bg-light-primary hover:text-dark-text focus:outline-none">
            <FaPlus />
            New Chat
          </button>
        </div>
        {/* Previous chats container */}
        <div className="h-[80vh] space-y-4 overflow-y-auto border-b border-light-label-default px-2 py-4">
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
          <button className="flex w-full gap-x-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-light-text transition-colors duration-200 hover:bg-slate-200 focus:outline-none">
            <ProfilePicture picture={userInfo?.picture} />
            {(() => {
              if (!userInfo || !(userInfo.lastName && userInfo.firstName)) {
                return 'User';
              }
              return `${userInfo.firstName || ''} ${
                userInfo.lastName || ''
              }`.trim();
            })()}
          </button>
        </div>
      </div>
    </div>
  );
}
