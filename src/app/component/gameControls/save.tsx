import { Input } from '@headlessui/react'
import Game from '@lib/game/game'
import { clipboardWrite } from '@lib/page'
import StaticRef from '@lib/staticRef'
import { RefObject, useRef, useState } from 'react'
import { BookmarkPlus, ClipboardCheck } from 'react-bootstrap-icons'

export default function SaveConfig(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const [saveLinkOpen, setSaveLinkOpen] = useState(false)
  const saveUrl = useRef(
    typeof window === 'undefined' ? undefined : new URL(window.location.href)
  )
  const [confirmClipboard, setConfirmClipboard] = useState(false)

  return (
    <div className='flex flex-col justify-center'>
      <div className='flex flex-row justify-center gap-2'>
        <button
          className='cursor-pointer hover:scale-105'
          title='Save game config link to load the same board later.'
          type='button' onClick={async () => {
            if (!saveLinkOpen && saveUrl.current) {
              // update save url before render
              const saveUrlParams = game.current.save()
              saveUrl.current.search = saveUrlParams.toString()

              // copy to clipboard
              try {
                await clipboardWrite(saveUrl.current.toString())
                
                // show clipboard confirmation
                setConfirmClipboard(true)
                setTimeout(() => {setConfirmClipboard(false)}, 800)
              }
              catch (err) {
                console.log(`failed to copy share link to clipboard. ${err}`)
              }
            }

            setSaveLinkOpen(!saveLinkOpen)
          }}>
          {confirmClipboard ? <ClipboardCheck /> : <BookmarkPlus />}
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
          onFocus={e => e.target.select()} />
      </div>
    </div>
  )
}