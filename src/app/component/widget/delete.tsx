import { XCircle } from 'react-bootstrap-icons'

export default function WidgetDelete(
  { widgetLabel, widgetId, onDelete }: {
    onDelete?: (id: string) => void
    widgetLabel: string
    widgetId: string
  }
) {
  return (
    <div className='w-full text-right'>
      <button type='button'
        className={
          'cursor-pointer hover:scale-105 text-4xl '
          + (onDelete === undefined ? 'hidden' : '')
        }
        title={`Remove ${widgetLabel} from the board`}
        onClick={
          onDelete === undefined
            ? undefined
            : () => onDelete(widgetId)
        } >
        <XCircle />
      </button>
    </div>
  )
}