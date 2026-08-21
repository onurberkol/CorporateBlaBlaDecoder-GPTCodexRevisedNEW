import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corporate BlaBla Decoder · Admin',
  description: 'Admin console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
