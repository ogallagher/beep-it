import { ActionValueTextCtx } from '@component/context'
import { Input } from '@headlessui/react'
import { WidgetId } from '@lib/widget/const'
import { useState, useRef, useEffect, useContext } from 'react'

export default function ActionText() {
  const [shownActionText, setShownActionText] = useState('')
  const valueTextCtx = useContext(ActionValueTextCtx)

  function setActionText(actionText: string, widgetId?: WidgetId) {
    setShownActionText(actionText)

    if (widgetId) {
      valueTextCtx.actionText.set(widgetId, actionText)
    }
    else {
      for (const key of valueTextCtx.actionText.keys()) {
        valueTextCtx.actionText.set(key, actionText)
      }
    }
  }

  useEffect(
    () => {
      valueTextCtx.showActionChar = (keyChar, widgetId) => {
        if (keyChar === undefined) {
          // reset action text
          setActionText('', widgetId)
          return
        }

        if (widgetId) {
          valueTextCtx.activeWidgetId = widgetId
        }
        if (valueTextCtx.activeWidgetId) {
          const _actionText = (valueTextCtx.actionText.get(valueTextCtx.activeWidgetId) || '') + keyChar
          const valueText = valueTextCtx.valueText.get(valueTextCtx.activeWidgetId)!

          if (valueText.startsWith(_actionText)) {
            if (valueText.length === _actionText.length) {
              // key combination complete; submit widget action
              valueTextCtx.onAction.get(valueTextCtx.activeWidgetId)!()

              // reset all for next input
              valueTextCtx.actionText.set(valueTextCtx.activeWidgetId, '')
              // but display current as complete
              setShownActionText(`[${_actionText}]`)
            }
            else {
              // single correct key
              setActionText(_actionText, valueTextCtx.activeWidgetId)
            }
          }
          else {
            // incorrect key; clear to start over
            setActionText('', widgetId)
          }
        }
      }
    },
    [ valueTextCtx ]
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
