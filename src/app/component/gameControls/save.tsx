import { Input } from '@headlessui/react'
import Game from 'app/_lib/game/game'
import StaticRef from 'app/_lib/staticRef'
import { RefObject, useRef, useState } from 'react'
import { BookmarkPlus } from 'react-bootstrap-icons'

export default function SaveConfig(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const [saveLinkOpen, setSaveLinkOpen] = useState(false)
  const saveUrl = useRef(
    typeof window === 'undefined' ? undefined : new URL(window.location.href)
  )

  return (
    <div className='flex flex-col justify-center'>
      <div className='flex flex-row justify-center gap-2'>
        <button
          className='cursor-pointer hover:scale-105'
          title='Save game config link to load the same board later.'
          type='button' onClick={() => {
            if (!saveLinkOpen && saveUrl.current) {
              // update save url before render
              const saveUrlParams = game.current.save()
              saveUrl.current.search = saveUrlParams.toString()
            }

            setSaveLinkOpen(!saveLinkOpen)
          }}>
          <BookmarkPlus />
        </button>
        <Input 
          suppressHydrationWarning={true}
          title={saveUrl.current?.toString()}
          size={Math.min(saveUrl.current?.toString().length || 5, 50)}
          className={
            'rounded-lg bg-white/5 text-white not-dark:bg-black/5 not-dark:text-black min-w-auto px-3 py-1.5 text-xs '
            + (saveLinkOpen ? '' : 'hidden')
          }
          readOnly={true}
          value={saveUrl.current?.toString()}
          onFocus={e => e.target.setSelectionRange(0, e.target.value.length)} />
      </div>
    </div>
  )
}