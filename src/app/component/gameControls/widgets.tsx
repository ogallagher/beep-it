import { LocaleCtx } from '@component/context'
import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import getStrings, { StringsNamespace } from '@lib/strings'
import { Dispatch, RefObject, SetStateAction, useContext, useEffect, useState } from 'react'
import { ChevronBarDown, PatchPlus } from 'react-bootstrap-icons'

export default function WidgetsDrawerControl(
  { widgetsDrawerOpen, setWidgetsDrawerOpen, game }: {
    widgetsDrawerOpen: boolean
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.WidgetsDrawerControl)
  const [ gameStarted, setGameStarted ] = useState(game.current.getStarted())
  const [ gameEnded, setGameEnded ] = useState(game.current.getEnded())
  const [ gamePreview, setGamePreview ] = useState(game.current.getPreview())
  
  useEffect(
    () => {
      // state event listener for start
      game.current.addStateListener(GameStateListenerKey.Started, WidgetsDrawerControl.name, (started: boolean) => {
        if (started) {
          setWidgetsDrawerOpen(false)
        }
        
        setGameStarted(started)
      })

      // game event listener for end
      game.current.addStateListener(GameStateListenerKey.Ended, WidgetsDrawerControl.name, setGameEnded)

      // hide on preview
      game.current.addStateListener(GameStateListenerKey.Preview, WidgetsDrawerControl.name, setGamePreview)
    },
    []
  )

  return (
    <div 
      className={
        'flex flex-col justify-center '
        + ((gameStarted && !gameEnded) || gamePreview ? 'hidden' : '')
      } >
      <button
        className='cursor-pointer hover:scale-105'
        type='button' onClick={() => setWidgetsDrawerOpen(!widgetsDrawerOpen)}
        title={
          widgetsDrawerOpen ? s('close') : s('open')
        } >
        {widgetsDrawerOpen ? <ChevronBarDown className='rotate-180' /> : <PatchPlus />}
      </button>
    </div>
  )
}