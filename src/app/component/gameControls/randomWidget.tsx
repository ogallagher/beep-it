import Game from '@lib/game/game'
import { generateRandomWidget } from '@lib/widget/random'
import { RefObject } from 'react'
import { LightningFill } from 'react-bootstrap-icons'

export default function RandomWidget(
  { game, deviceId }: {
    game: RefObject<Game>
    deviceId: RefObject<string>
  }
) {
  return (
    <div 
      className='flex flex-col justify-center' >
      <button
        className='cursor-pointer hover:scale-105' type='button'
        onClick={() => generateRandomWidget(game, deviceId)}
        title='Add a random widget to the board' >
        <LightningFill />
      </button>
    </div>
  )
}