import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import ShareGame from './share'
import SaveConfig from './save'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import GameDevices from './devices'
import GamePlayers from './players'
import BoardMode from './boardMode'
import TurnMode from './turnMode'
import WidgetsDrawerControl from './widgets'
import GamePlay from './play'
import RejoinGame from './rejoin'
import { GameStateListenerKey } from '@lib/game/const'

export default function GameControls(
  { widgetsDrawerOpen, setWidgetsDrawerOpen, startGame, game, deviceId, gameEventSource, onGameEvent, closeGameEventSource } : {
    widgetsDrawerOpen: boolean
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>
    startGame: () => void
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
    gameEventSource: RefObject<EventSource | undefined>
    onGameEvent: RefObject<(e: MessageEvent, onJoin: () => void) => void>
    closeGameEventSource: RefObject<() => void>
  }
) {
  const [showControls, setShowControls] = useState(true)

  function getShowControls() {
    return !game.current.getStarted() || game.current.getEnded()
  }

  useEffect(
    () => {
      // update visibility
      game.current.addStateListener(GameStateListenerKey.Started, GameControls.name, () => setShowControls(getShowControls()))
      game.current.addStateListener(GameStateListenerKey.Ended, GameControls.name, () => setShowControls(getShowControls()))
    },
    [ game ]
  )

  return (
    <div 
      className={
        'gameControls flex flex-row flex-wrap gap-4 justify-between w-full '
        + 'md:text-xl text-sm py-2 px-4 md:p-2 bg-gray-800 not-dark:bg-gray-100 '
        + (showControls ? '' : 'hidden')
      }>
      <div className='flex flex-row flex-wrap gap-2'>
         <SaveConfig game={game} />

        <ShareGame game={game} />
      </div>
     
      <div className='flex flex-row flex-wrap gap-2'>
        <GameDevices game={game} clientDeviceId={deviceId}  />

        <GamePlayers game={game} deviceId={deviceId} />
      </div>

      <div className='flex flex-row flex-wrap gap-2'>
        <BoardMode game={game} deviceId={deviceId} />

        <TurnMode game={game} deviceId={deviceId} />
      </div>

      <div className='flex flex-row gap-2'>
        <WidgetsDrawerControl 
          game={game} 
          widgetsDrawerOpen={widgetsDrawerOpen} setWidgetsDrawerOpen={setWidgetsDrawerOpen} />

        <GamePlay game={game} startGame={startGame} />

        <RejoinGame 
          game={game} 
          clientDeviceId={deviceId} 
          gameEventSource={gameEventSource} onGameEvent={onGameEvent} closeGameEventSource={closeGameEventSource} />
      </div>
    </div>
  )
}