import { Input } from '@headlessui/react'
import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useRef, useState } from 'react'
import { Share } from 'react-bootstrap-icons'

export default function ShareGame(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const [gameLinkOpen, setGameLinkOpen] = useState(false)
  const shareUrl = useRef(new URL(window.location.href))
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())

  useEffect(
    () => {
      // render on game state.start
      game.current.addStateListener(GameStateListenerKey.Started, setGameStarted)
    },
    [ game ]
  )

  return (
    <div 
      className={
        'flex flex-col justify-center '
        + (gameStarted ? 'hidden' : '')
      } >
      <div className='flex flex-row justify-center gap-2'>
        <button
          className='cursor-pointer hover:scale-105'
          title='Share game link to add devices to the board.'
          type='button' onClick={() => {
            if (!gameLinkOpen) {
              // update share url before render
              const shareUrlParams = new URLSearchParams()
              Game.saveGameId(game.current.id, shareUrlParams)
              
              shareUrl.current.search = shareUrlParams.toString()
            }

            setGameLinkOpen(!gameLinkOpen)
          }}>
          <Share />
        </button>
        <Input 
            title={shareUrl.current.toString()}
            size={shareUrl.current.toString().length}
            className={
              'rounded-lg bg-white/5 text-white min-w-auto px-3 py-1.5 text-xs '
              + (gameLinkOpen ? '' : 'hidden')
            }
            disabled
            value={shareUrl.current.toString()} />
      </div>
    </div>
  )
}
