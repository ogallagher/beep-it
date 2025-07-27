'use client'

import getStrings, { getLocaleName, getLocales, Locale, StringsNamespace } from '@lib/strings'
import { RefObject, useContext, useState } from 'react'
import { Globe2 } from 'react-bootstrap-icons'
import { LocaleCtx, SetLocaleCtx } from './context'

export default function LocaleSelector() {
  const locale = useContext(LocaleCtx)
  const setLocale = useContext(SetLocaleCtx)
  const s = getStrings(locale, StringsNamespace.LocaleSelector)
  const [showLocales, setShowLocales] = useState(false)

  return (
    <div
      className='flex flex-row justify-center gap-2 text-sm' >
      <button
        className='cursor-pointer hover:scale-110'
        type='button'
        title={s('selectLanguage')}
        onClick={() => {
          setShowLocales(!showLocales)
        }} >
        <Globe2 />
      </button>

      <div className='flex flex-col justify-center text-nowrap'>
        {
          showLocales
          ? (
            [...getLocales()].map(l => (
              <button 
                key={l}
                className='font-mono cursor-pointer hover:font-bold hover:scale-110'
                type='button'
                title={l}
                onClick={() => {
                  setShowLocales(false)
                  setLocale(l)
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
  )
}