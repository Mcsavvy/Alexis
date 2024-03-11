import * as React from 'react'

export default function NotSupported() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <a href={process.env.INTRANET_ORIGIN as string} className="text-blue-500 underline">
        intranet.alxswe
      </a>
    </div>
  );
}
