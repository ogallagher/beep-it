import { LocaleCtx } from '@component/context'
import { getFormatters, StringsNamespace } from '@lib/strings'
import { useContext } from 'react'
import { XCircle } from 'react-bootstrap-icons'

export default function WidgetDelete(
  { widgetLabel, widgetId, onDelete }: {
    onDelete?: (id: string) => void
    widgetLabel: string
    widgetId: string
  }
) {
  const f = getFormatters(useContext(LocaleCtx), StringsNamespace.WidgetDelete)

  return (
    <button type='button'
      className='cursor-pointer hover:scale-105 text-4xl'
      title={f('title')(widgetLabel)}
      onClick={
        onDelete === undefined
          ? undefined
          : () => onDelete(widgetId)
      } >
      <XCircle />
    </button>
  )
}