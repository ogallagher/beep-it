import { Dialog, DialogPanel } from '@headlessui/react'
import { Dispatch, SetStateAction, Suspense, useContext, useEffect, useMemo, useRef } from 'react'
import Readme from '@component/about/readme'
import { getMarkdown } from '@lib/markdown'
import { websiteBasePath } from '@api/const'
import { XCircle } from 'react-bootstrap-icons'
import getStrings, { StringsNamespace } from '@lib/strings'
import { LocaleCtx } from '@component/context'

export function About(
  { open, setOpen }: {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.About)
  const renderCount = useRef(0)
  const readmePromise = useMemo(
    () => {
      // this complex workaround is to prevent attempting to call getMarkdown in server
      if (renderCount.current > 0) {
        return getMarkdown(s('readmePath'), websiteBasePath)
      }
      else {
        return Promise.resolve({
          fileHtml: 'readme.md not yet loaded'
        })
      }
    },
    [renderCount.current, locale]
  )

  useEffect(
    () => {
      renderCount.current++
    },
    []
  )

  return (
    <Dialog 
      open={open} onClose={() => setOpen(false)} 
      className='relative z-10 cursor-default'>
      <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center py-4 text-center'>
          <DialogPanel 
            className='relative transform overflow-hidden text-left bg-background border-y'>
            <div className='px-4 pt-5 pb-4'>
              <Suspense
                fallback={
                  <div>
                    Loading from <pre>readme.md</pre>
                  </div>
                }>
                  <Readme fileHtmlPromise={readmePromise!}/>
              </Suspense>
            </div>
          </DialogPanel>
        </div>
        <button
          className='text-4xl cursor-pointer hover:scale-105 fixed top-8 right-8 bg-background rounded-2xl'
          type='button' title='Close help'
          onClick={() => setOpen(false)} >
          <XCircle />
        </button>
      </div>
    </Dialog>
  )
}