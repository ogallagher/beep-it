import { Dispatch, RefObject, SetStateAction } from 'react'
import { PatchPlus, ChevronBarDown, PlayCircle } from 'react-bootstrap-icons'
import ShareGame from './share'
import SaveConfig from './save'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import GameDevices from './devices'
import GamePlayers from './players'
import BoardMode from './boardMode'

export default function GameControls(
  { widgetsDrawerOpen, setWidgetsDrawerOpen, startGame, game, deviceId } : {
    widgetsDrawerOpen: boolean,
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>,
    startGame: () => void,
    game: StaticRef<Game> | RefObject<Game>,
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  return (
    <div 
      className='flex flex-wrap gap-4 justify-between bg-green-900 w-full text-2xl py-2 px-2'>
      <SaveConfig game={game} />

      <ShareGame game={game} />

      <GameDevices game={game} />

      <GamePlayers game={game} deviceId={deviceId} />

      <BoardMode game={game} deviceId={deviceId} />

      <div className='flex flex-col justify-center'>
        <button 
          className='cursor-pointer hover:scale-105 text-4xl'
          type='button' onClick={() => setWidgetsDrawerOpen(!widgetsDrawerOpen)}
          title={
            widgetsDrawerOpen ? 'Close widgets drawer' : 'Add widgets to the board'
          } >
          {widgetsDrawerOpen ? <ChevronBarDown className='rotate-180' /> : <PatchPlus />}
        </button>
      </div>
      
      <div className='flex flex-col justify-center'>
        <button 
          className='cursor-pointer hover:scale-105 text-4xl'
          type='button' onClick={startGame}
          title='Start new game' >
          <PlayCircle />
        </button>
      </div>
    </div>
  )
}