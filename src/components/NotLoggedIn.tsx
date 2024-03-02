import * as React from 'react';

export default function NotLoggedIn() {
  const loginUrl = 'https://alexis.futurdevs.tech';

  const handleLogin = () => {
    window.open(loginUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
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
