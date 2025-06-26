import { Dialog, DialogPanel } from '@headlessui/react'
import { Dispatch, SetStateAction, Suspense, useEffect, useMemo, useRef } from 'react'
import Readme from '@component/about/readme'
import { getMarkdown } from '@lib/markdown'
import { websiteBasePath } from '@api/const'

export function About(
  { open, setOpen }: {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
  }
) {
  const renderCount = useRef(0)
  const readmePromise = useMemo(
    () => {
      // this complex workaround is to prevent attempting to call getMarkdown in server
      if (renderCount.current > 0) {
        return getMarkdown('readme.md', websiteBasePath)
      }
      else {
        return Promise.resolve({
          fileHtml: 'readme.md not yet loaded'
        })
      }
    },
    [renderCount.current]
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
        <div className='flex min-h-full items-center justify-center p-4 text-center'>
          <DialogPanel 
            className='relative transform overflow-hidden text-left bg-background border cursor-help'>
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
      </div>
    </Dialog>
  )
}