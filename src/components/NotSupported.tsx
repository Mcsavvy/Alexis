import * as React from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'
import { environ } from '../utils';

export default function NotSupported() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-4 text-alx-red">
        This URL is not supported
      </h1>
      <p className="mb-4">
        Please go to the following URL to work with the extension:
      </p>
      <a href={environ.INTRANET_ORIGIN} className="text-blue-500 underline">
        intranet.alxswe
      </a>
    </div>
  );
}
