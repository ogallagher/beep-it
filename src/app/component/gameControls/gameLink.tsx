import { Input } from '@headlessui/react'
import { clipboardWrite } from '@lib/page'
import { ReactNode, useRef, useState } from 'react'
import { ClipboardCheck } from 'react-bootstrap-icons'

export default function GameLink(
  { title, updateUrl, icon }: {
    title: string
    updateUrl: ((url: URL) => void)
    icon: ReactNode
  }
) {
  const [linkOpen, setLinkOpen] = useState(false)
  const linkUrl = useRef(
    typeof window === 'undefined' ? undefined : new URL(window.location.href)
  )
  const [confirmClipboard, setConfirmClipboard] = useState(false)

  return (
    <div className='flex flex-col justify-center'>
      <div className='flex flex-row justify-center gap-2'>
        <button
          className='cursor-pointer hover:scale-105'
          title={title}
          type='button' 
          onClick={async () => {
            if (!linkOpen && linkUrl.current) {
              // update save url before render
              updateUrl(linkUrl.current)

              // copy to clipboard
              try {
                await clipboardWrite(linkUrl.current.toString())
                
                // show clipboard confirmation
                setConfirmClipboard(true)
                setTimeout(() => {setConfirmClipboard(false)}, 800)
              }
              catch (err) {
                console.log(`failed to copy game link to clipboard. ${err}`)
              }
            }

            setLinkOpen(!linkOpen)
          }}>
          {confirmClipboard ? <ClipboardCheck /> : icon}
        </button>
        <Input 
          suppressHydrationWarning={true}
          title={linkUrl.current?.toString()}
          size={Math.min(linkUrl.current?.toString().length || 5, 50)}
          className={
            'rounded-lg bg-white/5 text-white not-dark:bg-black/5 not-dark:text-black min-w-auto px-3 py-1.5 text-xs '
            + (linkOpen ? '' : 'hidden')
          }
          readOnly={true}
          value={linkUrl.current?.toString()}
          onFocus={e => e.target.select()} />
      </div>
    </div>
  )
}