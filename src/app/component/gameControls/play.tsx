import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject } from 'react'
import { PlayCircle } from 'react-bootstrap-icons'

export default function GamePlay(
  { startGame, game }: {
    startGame: () => void
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  // TODO state event listener for start

  return (
    <div className='flex flex-col justify-center'>
      <button
        className='cursor-pointer hover:scale-105 text-4xl'
        type='button' onClick={startGame}
        title='Start new game' >
        <PlayCircle />
      </button>
    </div>
  )
}