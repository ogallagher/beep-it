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
  const shareUrl = useRef(
    typeof window === 'undefined' ? undefined : new URL(window.location.href)
  )
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())
  const [gameEnded, setGameEnded] = useState(game.current.getEnded())

  useEffect(
    () => {
      // render on game start and end
      game.current.addStateListener(GameStateListenerKey.Started, setGameStarted)
      game.current.addStateListener(GameStateListenerKey.Ended, setGameEnded)
    },
    [ game ]
  )

  return (
    <div 
      className={
        'flex flex-col justify-center '
        + (gameStarted && !gameEnded ? 'hidden' : '')
      } >
      <div className='flex flex-row justify-center gap-2'>
        <button
          className='cursor-pointer hover:scale-105'
          title='Share game link to add devices to the board.'
          type='button' onClick={() => {
            if (!gameLinkOpen && shareUrl.current) {
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
          suppressHydrationWarning={true}
          title={shareUrl.current?.toString() || ''}
          size={shareUrl.current?.toString().length || 5}
          className={
            'rounded-lg bg-white/5 text-white not-dark:bg-black/5 not-dark:text-black min-w-auto px-3 py-1.5 text-xs '
            + (gameLinkOpen ? '' : 'hidden')
          }
          readOnly={true}
          value={shareUrl.current?.toString()}
          onFocus={e => e.target.setSelectionRange(0, e.target.value.length)} />
      </div>
    </div>
  )
}
