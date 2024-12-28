import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Too Many Bridges',
  description:
    'No more scavenging for bridges. Find your perfect bridge that supports the chains you want.',
  openGraph: {
    title: 'Too Many Bridges',
    description:
      'No more scavenging for bridges. Find your perfect bridge that supports the chains you want.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://too-many-bridges.vercel.app/og',
        width: 1200,
        height: 630,
        alt: 'Too Many Bridges',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Too Many Bridges',
    description:
      'No more scavenging for bridges. Find your perfect bridge that supports the chains you want.',
    creator: '@0xJim',
  },
  keywords:
    '✨ bridges, crypto bridges, web3, defi, cross-chain, blockchain, y2k vibes ✨',
  themeColor: '#9333ea', // purple-600
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
