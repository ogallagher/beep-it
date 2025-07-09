import { GameStateListenerKey } from 'app/_lib/game/const'
import Game from 'app/_lib/game/game'
import StaticRef from 'app/_lib/staticRef'
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import { ChevronBarDown, PatchPlus } from 'react-bootstrap-icons'

export default function WidgetsDrawerControl(
  { widgetsDrawerOpen, setWidgetsDrawerOpen, game }: {
    widgetsDrawerOpen: boolean
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>
    game: StaticRef<Game> | RefObject<Game>
  }
) {
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
          widgetsDrawerOpen ? 'Close widgets drawer' : 'Add widgets to the board'
        } >
        {widgetsDrawerOpen ? <ChevronBarDown className='rotate-180' /> : <PatchPlus />}
      </button>
    </div>
  )
}