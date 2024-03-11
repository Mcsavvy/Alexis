import * as React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function NotLoggedIn() {
  const loginUrl = process.env.LOGIN_URL as string;

  const handleLogin = () => {
    window.open(loginUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-4">You are not logged in</h1>
      <p className="mb-4">Please log in to access this page.</p>
      <button
        onClick={handleLogin}
        className="bg-light-primary text-white gap-y-2 rounded-lg px-3 py-2 text-center"
      >
        Login
      </button>
    </div>
  );
}
