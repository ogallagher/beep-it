'use client'

import getStrings, { getLocaleName, getLocales, Locale, StringsNamespace } from '@lib/strings'
import { RefObject, useContext, useState } from 'react'
import { Globe2 } from 'react-bootstrap-icons'
import { LocaleCtx } from './context'

export default function Footer(
  { creditsUrl, setLocale }: {
    creditsUrl: string
    setLocale: RefObject<(locale: Locale) => void>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.Footer)
  const [showLocales, setShowLocales] = useState(false)

  return (
    <footer className='flex flex-row justify-between px-8 py-4'>
      <a
        className='hover:underline hover:underline-offset-4 cursor-pointer'
        href={creditsUrl}
      >
        Created by &lt;github.com/ogallagher&gt;
      </a>

      <div
        className='flex flex-row justify-center gap-2' >
        <button
          className='cursor-pointer hover:scale-110'
          type='button'
          title={s('selectLanguage')}
          onClick={() => {
            setShowLocales(!showLocales)
          }} >
          <Globe2 />
        </button>

        <div className='flex flex-col justify-center'>
          {
            showLocales
            ? (
              [...getLocales()].map(l => (
                <button 
                  className='font-mono cursor-pointer hover:font-bold hover:scale-110'
                  type='button'
                  title={l}
                  onClick={() => {
                    setShowLocales(false)
                    setLocale.current(l)
                  }}>
                  {getLocaleName(l)}
                </button>
              ))
            )
            : (
              <span className='font-mono font-bold' title={locale}>
                {getLocaleName(locale)}
              </span>
            )
          }
        </div>
      </div>
    </footer>
  )
}