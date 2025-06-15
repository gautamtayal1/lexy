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
      <body>
        <div className="relative w-screen h-screen">
          <ReduxProvider>
            <ThemeBackground />
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </ReduxProvider>
        </div>
      </body>
    </html>
  );
} 