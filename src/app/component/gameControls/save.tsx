import { Input } from '@headlessui/react'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject, useRef, useState } from 'react'
import { BookmarkPlus } from 'react-bootstrap-icons'

export default function SaveConfig(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const [saveLinkOpen, setSaveLinkOpen] = useState(false)
  const saveUrl = useRef(new URL(window.location.href))

  return (
    <div className='flex flex-col justify-center'>
      <div className='flex flex-row justify-center gap-2'>
        <button
          className='cursor-pointer hover:scale-105 text-4xl'
          title='Save game config link to load the same board later.'
          type='button' onClick={() => {
            if (!saveLinkOpen) {
              // update save url before render
              const saveUrlParams = game.current.save()
              saveUrl.current.search = saveUrlParams.toString()
            }

            setSaveLinkOpen(!saveLinkOpen)
          }}>
          <BookmarkPlus />
        </button>
        <Input 
            title={saveUrl.current.toString()}
            size={Math.min(saveUrl.current.toString().length, 50)}
            className={
              'rounded-lg bg-white/5 text-white min-w-auto px-3 py-1.5 text-sm '
              + (saveLinkOpen ? '' : 'hidden')
            }
            disabled
            value={saveUrl.current.toString()} />
      </div>
    </div>
  )
}