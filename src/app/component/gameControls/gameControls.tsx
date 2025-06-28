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
        'gameControls flex flex-wrap gap-2 justify-between w-full '
        + 'md:text-xl text-sm py-2 px-4 md:p-2 bg-gray-800 '
        + (gameStarted && !gameEnded ? 'hidden' : '')
      }>
      <SaveConfig game={game} />

      <ShareGame game={game} />

      <GameDevices game={game} />

      <GamePlayers game={game} deviceId={deviceId} />

      <BoardMode game={game} deviceId={deviceId} />

      <TurnMode game={game} deviceId={deviceId} />

      <WidgetsDrawerControl 
        game={game} 
        widgetsDrawerOpen={widgetsDrawerOpen} setWidgetsDrawerOpen={setWidgetsDrawerOpen} />
      
      <GamePlay game={game} startGame={startGame} />
    </div>
  )
}