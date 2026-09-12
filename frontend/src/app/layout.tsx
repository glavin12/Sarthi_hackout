import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Saarthi — Your Banking Guide',
  description: 'AI-powered personal banking that understands your financial life',
};

/**
 * RootLayout component
 * Sets up global typography (Inter font), metadata, and HTML wrapper.
 * Kept simple as per instructions; page shells are rendered per page or template.
 */
function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-saarthi-bg text-saarthi-text-primary antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;

