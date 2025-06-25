import { Dispatch, RefObject, SetStateAction } from 'react'
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
  { widgetsDrawerOpen, setWidgetsDrawerOpen, startGame, game, deviceId } : {
    widgetsDrawerOpen: boolean
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>
    startGame: () => void
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  return (
    <div 
      className={
        'gameControls flex flex-wrap gap-2 justify-between bg-green-900 w-full '
        + 'md:text-xl text-sm md:p-2 p-1'
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