import * as React from 'react'

export default function NotSupported() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4 text-light-primary">This URL is not supported</h1>
      <p className="mb-4">Please go to the following URL to work with the extension:</p>
      <a href="http://intranet.alxswe" className="text-blue-500 underline">intranet.alxswe</a>
    </div>
  );
}
