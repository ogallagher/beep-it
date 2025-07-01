import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beep It",
  description: "Highly customizable virtual multiplayer party game inspired by Bop It.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script 
        src='/script/lame.min.js'
        strategy='lazyOnload' />
      <body
        className={
          `${geistSans.variable} ${geistMono.variable} antialiased`
        }
      >
        <Suspense>
          {children}
        </Suspense>

        {/* <Footer
          creditsUrl='https://github.com/ogallagher'/> */}
      </body>
    </html>
  );
}
