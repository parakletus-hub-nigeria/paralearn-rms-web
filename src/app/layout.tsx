
import './globals.css';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import AuthStateSync from '@/components/AuthStateSync';

export const metadata = {
  title: 'ParaLearn',
  description: 'ParaLearn platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>
          <AuthStateSync />
          <main className="min-h-screen flex items-center justify-center">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
