import './globals.css';

import type { Metadata } from 'next';
import Link from 'next/link';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { MapFilter } from './MapFilter';

export const metadata: Metadata = {
  title: "MettaMap viewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NuqsAdapter>
          <div className="px-8 py-2 font-bold border-b border-gray-200 bg-gray-100">
            <Link href="/">MettaMap Viewer</Link>
          </div>
          <div>
            <MapFilter />
            <div className="p-8">{children}</div>
          </div>
        </NuqsAdapter>
      </body>
    </html>
  );
}
