import type { Metadata } from 'next'
import './globals.css'
import Body from '@component/body'

/**
 * Populates site metadata in `head.meta` tags.
 * 
 * Some tags, like `link[rel="metadata"]` and `link[rel="icon"]` are auto added when relevant files are available
 * at `src/app/`, which is why I put them there instead of `public/`.
 */
export const metadata: Metadata = {
  title: 'Beep It',
  description: 'Highly customizable virtual multiplayer party game inspired by Bop It.',
  appleWebApp: {
    title: 'BeepIt'
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {  
  return (
    <html>
      <Body>
        {children}
      </Body>
    </html>
  )
}
