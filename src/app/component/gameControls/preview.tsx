import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import { Eye, Gear } from 'react-bootstrap-icons'

export default function Preview(
  { game, setWidgetsDrawerOpen }: {
    game: RefObject<Game>
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>
  }
) {
  const [previewPlay, setPreviewPlay] = useState(game.current?.getPreview() || false)

  useEffect(
    () => {
      game.current.addStateListener(GameStateListenerKey.Preview, Preview.name, setPreviewPlay)
    },
    [ game ]
  )

  return (
    <div 
      className='flex flex-col justify-center' >
        <button 
          className='cursor-pointer hover:scale-105'
          type='button'
          onClick={() => {
            const _previewPlay = !previewPlay
            game.current.setPreview(_previewPlay)
            if (_previewPlay) {
              setWidgetsDrawerOpen(false)
            }
          }}
          title={
            previewPlay ? 'Open game controls, close preview.' : 'Preview board during gameplay.'
          } >
          {previewPlay ? <Gear /> : <Eye />}
        </button>
    </div>
  )
}