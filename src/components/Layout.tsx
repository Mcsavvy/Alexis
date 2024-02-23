import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import * as React from 'react';

export interface Action {
  title: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

const defaultActions: Action[] = [
  {
    title: 'Chat',
    href: '/chat',
    active: true
  },
  {
    title: 'Features',
    href: '#',
  },
  {
    title: 'Support',
    href: '#',
  },
  {
    title: 'Sign In',
    href: '/login',
  },
];

export default function Layout({
  children,
  actions,
  joinButton,
}: {
  children: React.ReactNode;
  actions?: Action[];
  joinButton?: boolean;
}) {
  const navActions = actions || defaultActions;
  if (joinButton === undefined) {
    joinButton = true;
  }
  return (
    <div className="font-sans flex flex-col min-h-screen">
      <header className="bg-gray-100">
        <div className="container mx-auto flex justify-between items-center p-5">
          <img src="/icons/icon48.png" alt="Alexis Logo" className="h-10" />
          <nav>
            <ul className="flex space-x-4">
              {navActions.map((action, index) => (
                <li key={index}>
                  <Link
                    to={action.href}
                    onClick={action.onClick}
                    className={
                      'text-gray-600 hover:text-light-primary' +
                      (action.active ? ' text-light-primary' : '')
                    }
                  >
                    {action.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {children}
      <footer className="bg-gray-200 py-5 mt-auto">
        <div className="container mx-auto text-center">
          <ul className="flex justify-center space-x-4">
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
            </li>
          </ul>
          {joinButton && (
            <Link
              to="/login"
              className="mt-5 inline-block border-2 border-light-primary text-light-primary hover:text-white hover:bg-light-primary font-bold py-2 px-4 rounded"
            >
              Join Alexis Today
            </Link>
          )}
        </div>
        <div className="flex justify-center space-x-4 py-2">
          <a href="https://www.github.com/mcsavvy" className="text-black">
            <FaGithub />
          </a>
          <a href="https://www.twitter.com/davemcsavvy" className="text-black">
            <FaXTwitter />
          </a>
          <a
            href="https://www.linkedin.com/in/david-john-148a211a5/"
            className="text-blue-800"
          >
            <FaLinkedin />
          </a>
        </div>
      </footer>
    </div>
  );
}
