import './globals.css';

import type { Metadata } from 'next';
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
          <MapFilter />
          <div className="p-8">{children}</div>
        </NuqsAdapter>
      </body>
    </html>
  );
}
