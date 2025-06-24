import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { Dispatch, RefObject, SetStateAction } from 'react'
import { ChevronBarDown, PatchPlus } from 'react-bootstrap-icons'

export default function WidgetsDrawerControl(
  { widgetsDrawerOpen, setWidgetsDrawerOpen, game }: {
    widgetsDrawerOpen: boolean,
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>,
    game: StaticRef<Game> | RefObject<Game>,
  }
) {
  // TODO state event listener for start

  return (
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
  )
}