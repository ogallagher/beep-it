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

export default function GameControls(
  { widgetsDrawerOpen, setWidgetsDrawerOpen, startGame, game, deviceId, gameStarted, gameEnded } : {
    widgetsDrawerOpen: boolean
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>
    startGame: () => void
    game: StaticRef<Game> | RefObject<Game>
    gameStarted: boolean
    gameEnded: boolean
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  return (
    <div 
      className={
        'gameControls flex flex-row flex-wrap gap-4 justify-between w-full '
        + 'md:text-xl text-sm py-2 px-4 md:p-2 bg-gray-800 '
        + (gameStarted && !gameEnded ? 'hidden' : '')
      }>
      <div className='flex flex-row gap-2'>
         <SaveConfig game={game} />

        <ShareGame game={game} />
      </div>
     
      <div className='flex flex-row gap-2'>
        <GameDevices game={game} clientDeviceId={deviceId}  />

        <GamePlayers game={game} deviceId={deviceId} />
      </div>

      <div className='flex flex-row gap-2'>
        <BoardMode game={game} deviceId={deviceId} />

        <TurnMode game={game} deviceId={deviceId} />
      </div>

      <div className='flex flex-row gap-2'>
        <WidgetsDrawerControl 
          game={game} 
          widgetsDrawerOpen={widgetsDrawerOpen} setWidgetsDrawerOpen={setWidgetsDrawerOpen} />

        <GamePlay game={game} startGame={startGame} />

        <RejoinGame />
      </div>
    </div>
  )
}