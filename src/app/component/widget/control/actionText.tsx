import { Input } from '@headlessui/react'
import StaticRef from '@lib/staticRef'
import { WidgetConfig } from '@lib/widget/const'
import { RefObject, useState, useRef, useEffect } from 'react'


export default function ActionText(
  { showActionChar, configRef, onAction }: {
    showActionChar: RefObject<(c: string | undefined) => void>
    configRef: RefObject<WidgetConfig> | StaticRef<WidgetConfig>
    onAction: () => void
  }) {
  const [shownActionText, setShownActionText] = useState('')
  const actionTextRef = useRef('')

  function setActionText(actionText: string) {
    setShownActionText(actionText)
    actionTextRef.current = actionText
  }

  useEffect(
    () => {
      showActionChar.current = (keyChar) => {
        if (keyChar === undefined) {
          // reset action text
          setActionText('')
        }

        const _actionText = actionTextRef.current + keyChar
        if (configRef.current.valueText!.startsWith(_actionText)) {
          if (configRef.current.valueText!.length === _actionText.length) {
            // key combination complete; submit widget action
            onAction()

            // reset for next input
            actionTextRef.current = ''
            // but display as complete
            setShownActionText(`[${_actionText}]`)
          }
          else {
            // single correct key
            setActionText(_actionText)
          }
        }
        else {
          // incorrect key; clear to start over
          setActionText('')
        }
      }
    }
  )

  return (
    <Input
      className={'rounded-lg px-3 py-1.5 font-mono bg-white/5 text-white text-center '
        + (shownActionText.length === 0 ? 'hidden' : '')}
      type='text'
      value={shownActionText}
      disabled={true} />
  )
}
