import * as React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function NotProject() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-4">Project Page Required</h1>
      <p className="mb-4">
        You're on a supported website, but you need to be on a project page to
        use Alexis.
      </p>
      <p>Please navigate to a project page and try again.</p>
    </div>
  );
}
