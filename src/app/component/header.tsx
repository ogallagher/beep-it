'use client'

import { Github, QuestionCircle } from 'react-bootstrap-icons'
import { About } from '@component/about/about'
import { RefObject, useEffect, useState } from 'react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { GameStateListenerKey } from '@lib/game/const'

export default function Header(
  { githubUrl, game }: {
    githubUrl: string,
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [showHeader, setShowHeader] = useState(true)

  function getShowHeader() {
    return (!game.current.getStarted() || game.current.getEnded()) && !game.current.getPreview()
  }

  useEffect(
    () => {
      // update visibility
      game.current.addStateListener(GameStateListenerKey.Started, Header.name, () => setShowHeader(getShowHeader()))
      game.current.addStateListener(GameStateListenerKey.Ended, Header.name, () => setShowHeader(getShowHeader()))
      game.current.addStateListener(GameStateListenerKey.Preview, Header.name, () => setShowHeader(getShowHeader()))
    },
    [ game ]
  )

  return (
    <>
      <header className={
        'border-b md:text-2xl text-lg '
        + (showHeader ? '' : 'hidden')
      }>
        <nav className='mx-auto flex items-center justify-between md:p-4 p-1'>
          <div className='flex'>
            <a href={githubUrl}>
              <Github/>
            </a>
          </div>
          
          <div className='flex'>
            <button 
              title='Help'
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
