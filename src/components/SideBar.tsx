import * as React from 'react'
import { FaPlus, FaUser } from 'react-icons/fa';
import { GiBroom } from 'react-icons/gi';
import { IoIosLogOut } from 'react-icons/io';
import { MdCancel } from 'react-icons/md';

const chatHistory = [
  {
    title: 'Tailwind Classes',
    date: '12 Mar',
  },
  {
    title: 'explain quantum computing',
    date: '10 Feb',
  },
  {
    title: 'How to create ERP Diagram',
    date: '22 Jan',
  },
  {
    title: 'API Scaling Strategies',
    date: '1 Jan',
  },
  {
    title: 'What is GPT UI?',
    date: '1 Jan',
  },
  {
    title: 'How to use Tailwind components?',
    date: '1 Jan',
  },
];

const ChatThread = ({ title, date, active }: { title: string; date: string, active: boolean }) => {
  return (
    <button className={
      "flex w-full flex-col gap-y-2 rounded-lg px-3 py-2 text-left transition-colors duration-200 hover:bg-slate-200 focus:outline-none" +
      (active ? ' border-l-4 shadow-lg border-light-primary' : '')
      }>
      <h1 className="text-sm font-medium capitalize text-light-text">{title}</h1>
      <p className="text-xs text-light-label-default">{date}</p>
    </button>
  );
}

function ProfilePicture() {
  return (
    <img
      className="h-5 w-5 rounded-full"
      src="https://www.electricallicenserenewal.com/app-assets/images/user/12.jpg"
      alt="settings"
    />
  );
}

export default function SideBar({ visible=true }: { visible: boolean }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    setShow(visible);
  }, [visible]);
  return (
    <aside
      style={{ width: 'fit-content', display: show ? 'block' : 'none' }}
      className="shadow-lg"
    >
      <div className="flex h-[100svh] w-60 flex-col overflow-y-auto bg-slate-50 pt-8 sm:h-[100vh] sm:w-64">
        <div className="flex px-4">
          <img className="h-7 w-7" src="/icons/icon48.png" alt="logo" />
          <h2 className="px-5 text-lg font-medium text-light-text">History</h2>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => setShow(false)}
          >
            {/* @ts-ignore */}
            <MdCancel className="h-5 w-5 text-light-primary" />
          </button>
        </div>
        {/* New chat button */}
        <div className="mx-2 mt-8">
          <button className="flex w-full gap-x-4 rounded-lg border border-light-primary text-light-primary p-4 text-left text-sm font-medium transition-colors duration-200 hover:bg-light-primary hover:text-dark-text focus:outline-none">
            <FaPlus />
            New Chat
          </button>
        </div>
        {/* Previous chats container */}
        <div className="h-1/2 space-y-4 overflow-y-auto border-b border-light-label-default px-2 py-4">
          {chatHistory.map((chat, index) => (
            <ChatThread
              key={index}
              title={chat.title}
              date={chat.date}
              active={index === 0}
            />
          ))}
        </div>
        {/* User and settings buttons */}
        <div className="mt-auto w-full space-y-4 px-2 py-4">
          <button className="flex w-full gap-x-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-light-text transition-colors duration-200 hover:bg-slate-200 focus:outline-none">
            <ProfilePicture />
            Jane Doe
          </button>
          <button className="flex w-full gap-x-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-light-text transition-colors duration-200 hover:bg-slate-200 focus:outline-none">
            <GiBroom />
            Clear History
          </button>
          <button className="flex w-full gap-x-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-light-text transition-colors duration-200 hover:bg-slate-200 focus:outline-none">
            <IoIosLogOut />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
