import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

/**
 * Populates site metadata in `head.meta` tags.
 */
export const metadata: Metadata = {
  title: 'Beep It',
  description: 'Highly customizable virtual multiplayer party game inspired by Bop It.',
  appleWebApp: {
    title: 'BeepIt'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={
          `${geistSans.variable} ${geistMono.variable} antialiased`
        } >
        <Suspense>
          {children}
        </Suspense>

        {/* <Footer
          creditsUrl='https://github.com/ogallagher'/> */}
      </body>
    </html>
  )
}
