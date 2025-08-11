'use client';

import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import TopBar from '../components/TopBar';
import ProtectedRoute from '@/contexts/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NotificationContainer from '@/components/NotificationContainer';
import { Analytics } from "@vercel/analytics/react"
// import { PostHogProvider } from '@/contexts/PostHogContext';
// import { PostHogErrorBoundary } from '@/components/PostHogErrorBoundary';

const geist = Geist({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={geist.className}>
        <Analytics mode="auto" />
        <ErrorBoundary>
          <NotificationProvider>
            {/* <PostHogErrorBoundary>
              <PostHogProvider> */}
            <AuthProvider>
              <ProtectedRoute>
                <TopBar />
                <main>{children}</main>
                <NotificationContainer />
              </ProtectedRoute>
            </AuthProvider>
            {/* </PostHogProvider>
            </PostHogErrorBoundary> */}
          </NotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
