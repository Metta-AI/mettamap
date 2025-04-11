import './globals.css';

import type { Metadata } from 'next';

import { MapList } from './MapList';

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
        <div className="grid grid-cols-[250px_1fr] min-h-screen">
          <div className="bg-gray-100 p-6 border-r">
            <h2 className="font-semibold mb-4">All Maps</h2>
            <MapList />
          </div>
          <div className="p-8">{children}</div>
        </div>
      </body>
    </html>
  );
}
