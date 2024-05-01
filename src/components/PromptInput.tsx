import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { BsFillArrowUpSquareFill, BsStopCircle } from 'react-icons/bs';
import { RiHistoryLine } from "react-icons/ri";
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import {
  IoHeart, IoHeartOutline,
  IoMail, IoMailOutline,
  IoHelpCircle, IoHelpCircleOutline
} from 'react-icons/io5';
import { CgReadme } from 'react-icons/cg';
import { HoverableIcon } from './utils';
import { getUserInfo, UserInfo } from '../utils';
import { getFullName } from '../utils';


type PromptInputProps = {
  sendQuery: (input: string) => void;
  stopGenerating: () => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  generating: boolean;
  setGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PromptInput({
  sendQuery,
  stopGenerating,
  input,
  setInput,
  generating,
  setGenerating,
  setShowSidebar,
}: PromptInputProps) {

  const userInfo = React.useRef<UserInfo>();

  React.useEffect(() => {
    getUserInfo().then((info) => {
      userInfo.current = info;
    });
  }, []);

  return (
    <div
      className="w-full pt-2 md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:w-[calc(100%-.5rem)]"
      style={{ paddingLeft: '0px', paddingRight: '0px' }}
    >
      <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 flex-col">
          <div className="absolute bottom-full left-0 right-0"></div>
          <div className="flex w-full items-center">
            <div className="overflow-hidden group-focus:shadow-md border-gray-500 flex flex-col w-full flex-grow relative border dark:text-white rounded-2xl">
              <TextareaAutosize
                id="chat"
                value={input}
                minRows={1}
                maxRows={4}
                readOnly={generating}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-full w-full rounded-md border-none p-2 text-base text-slate-900 placeholder-slate-400 focus:border-none focus:outline-none"
                disabled={generating}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
                      sendQuery(input);
                      setInput('');
                    } else if (e.ctrlKey || e.shiftKey) {
                      setInput((prev) => prev + '\n');
                    }
                  }
                }}
              />
              <button
                className="absolute bottom-1.5 right-2 rounded-lg bg-white p-0.5 text-primary transition-colors disabled:text-black disabled:opacity-50 md:bottom-3 md:right-3"
                disabled={!input.trim() && !generating}
                onClick={(e) => {
                  e.preventDefault();
                  if (generating) {
                    stopGenerating();
                    setGenerating(false);
                  } else if (input.trim()) {
                    setGenerating(true);
                    sendQuery(input.trim());
                    setInput('');
                  }
                }}
              >
                {generating ? (
                  <BsStopCircle className="h-6 w-6 text-alx-red" />
                ) : (
                  <BsFillArrowUpSquareFill className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      <div className="flex w-full py-3 relative max-w-[790px] items-center justify-between px-4 mx-auto">
        <div className="w-full">
          <button
            className="flex text-secondary"
            onClick={() => setShowSidebar((current) => !current)}
          >
            <RiHistoryLine className="w-5 h-5" />
            <span className="ml-2 font-semibold">Chat History</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <a
            title="Documentation"
            className="hover:text-secondary"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.alexis.futurdevs.tech"
          >
            <CgReadme className="w-4 h-4" />
          </a>
          <a
            title="Give us a 5-star"
            className="hover:text-red-500"
            target="_blank"
            rel="noopener noreferrer"
            href="https://chromewebstore.google.com/detail/alexis/bcdcedchebekmpdhodipimoikhoblgfa"
          >
            <HoverableIcon
              icon={FaRegHeart}
              props={{ className: 'w-3 h-3' }}
              hoverIcon={FaHeart}
            />
          </a>
          <a
            title="Get Help"
            className="hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
            href="mailto:futurdevsalexis@gmail.com?subject=Help%20for%20Alexis"
          >
            <HoverableIcon
              icon={IoHelpCircleOutline}
              props={{ className: 'w-4 h-4' }}
              hoverIcon={IoHelpCircle}
            />
          </a>
          <a
            title="Feedback"
            className="hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
            href={((): string => {
              const name = userInfo.current ? getFullName(userInfo.current) : '';
              const id = userInfo.current?.email;
              return `https://oobv13emqx4.typeform.com/to/t7Ls8WMm#user_id=${id}&name=${name}`;
            })()}
          >
            <HoverableIcon
              icon={IoMailOutline}
              props={{ className: 'w-4 h-4' }}
              hoverIcon={IoMail}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
