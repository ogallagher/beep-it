'use client'

import { Github, QuestionCircle } from 'react-bootstrap-icons'
import { About } from '@component/about/about'
import { RefObject, useContext, useEffect, useState } from 'react'
import Game from '@lib/game/game'
import { GameStateListenerKey } from '@lib/game/const'
import getStrings, { StringsNamespace } from '@lib/strings'
import { LocaleCtx } from './context'

export default function Header(
  { githubUrl, game }: {
    githubUrl: string,
    game: RefObject<Game|null>
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.Header)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [showHeader, setShowHeader] = useState(true)

  function getShowHeader() {
    if (!game.current) {
      return true
    }
    return (!game.current.getStarted() || game.current.getEnded()) && !game.current.getPreview()
  }

  useEffect(
    () => {
      if (game.current) {
        // update visibility
        game.current.addStateListener(GameStateListenerKey.Started, Header.name, () => setShowHeader(getShowHeader()))
        game.current.addStateListener(GameStateListenerKey.Ended, Header.name, () => setShowHeader(getShowHeader()))
        game.current.addStateListener(GameStateListenerKey.Preview, Header.name, () => setShowHeader(getShowHeader()))
      }
    },
    [ game ]
  )

  return (
    <>
      <header className={
        'border-b md:text-2xl text-lg '
        + (showHeader ? '' : 'hidden')
      }>
        <nav className='mx-auto flex flex-row items-center justify-between md:p-4 p-1'>
          <a href={githubUrl}>
              <Github/>
          </a>

          <span className='font-mono font-bold'>beep-it</span>
          
          <div className='flex flex-row gap-4'>
            <a href='/wordsearch' className='font-mono hover:font-bold'>wordsearch</a>

            <a href='/quizcard-generator' className='font-mono hover:font-bold'>quizcard</a>

            <button 
              title={s('title')}
              type='button' onClick={() => {
                setAboutOpen(!aboutOpen)
              }} >
                <QuestionCircle className='hover:scale-105'/>
            </button>
          </div>
        </nav>
      </header>

      <About open={aboutOpen} setOpen={setAboutOpen}/>
    </>
  )
}
