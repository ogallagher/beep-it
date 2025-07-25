'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import { Suspense, useRef } from 'react'
import Footer from './footer'
import { cookieLocale, defaultLocale, Locale } from '@lib/strings'
import { CookiesProvider, useCookies } from 'react-cookie'
import { LocaleCtx } from './context'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

function CookiesBody(
  { children }: {
    children: React.ReactNode
  }
) {
  const [cookies, setCookie] = useCookies(
    [cookieLocale],
    {
      doNotParse: true
    }
  )
  const locale = cookies.locale || defaultLocale
  const setLocale = useRef((locale: Locale) => {
    setCookie(cookieLocale, locale)
  })

  return (
    <body
      className={
        `${geistSans.variable} ${geistMono.variable} antialiased`
      } >
      <LocaleCtx value={locale}>
        <Suspense>
          {children}
        </Suspense>

        <Footer creditsUrl='https://github.com/ogallagher' setLocale={setLocale} />
      </LocaleCtx>
    </body>
  )
}

export default function Body(
  { children }: {
    children: React.ReactNode
  }
) {
  return (
    <CookiesProvider>
      <CookiesBody>
        {children}
      </CookiesBody>
    </CookiesProvider>
  )
}