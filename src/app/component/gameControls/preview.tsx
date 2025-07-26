import { LocaleCtx } from '@component/context'
import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import getStrings, { StringsNamespace } from '@lib/strings'
import { Dispatch, RefObject, SetStateAction, useContext, useEffect, useState } from 'react'
import { Eye, Gear } from 'react-bootstrap-icons'

export default function Preview(
  { game, setWidgetsDrawerOpen }: {
    game: RefObject<Game>
    setWidgetsDrawerOpen: Dispatch<SetStateAction<boolean>>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.Preview)
  const [previewPlay, setPreviewPlay] = useState(game.current?.getPreview() || false)

  useEffect(
    () => {
      // TODO this seems redundant if game.state.preview is not synchronized across clients
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
            previewPlay ? s('closePreview') : s('openPreview')
          } >
          {previewPlay ? <Gear /> : <Eye />}
        </button>
    </div>
  )
}