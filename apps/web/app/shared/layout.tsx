import React from 'react';
import ConvexClientProvider from '../ConvexProviderWithClerk';
import { ReduxProvider } from '../providers/ReduxProvider';
import ThemeBackground from '../components/ThemeBackground';
import '../globals.css';

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <div className="relative w-screen min-h-screen">
          <ReduxProvider>
            <ThemeBackground />
            <ConvexClientProvider>
              <div className="relative z-10">
                {children}
              </div>
            </ConvexClientProvider>
          </ReduxProvider>
        </div>
      </body>
    </html>
  );
} 