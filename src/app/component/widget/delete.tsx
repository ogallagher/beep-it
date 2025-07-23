import { XCircle } from 'react-bootstrap-icons'

export default function WidgetDelete(
  { widgetLabel, widgetId, onDelete }: {
    onDelete?: (id: string) => void
    widgetLabel: string
    widgetId: string
  }
) {
  return (
    <button type='button'
      className='cursor-pointer hover:scale-105 text-4xl'
      title={`Remove ${widgetLabel} from the board`}
      onClick={
        onDelete === undefined
          ? undefined
          : () => onDelete(widgetId)
      } >
      <XCircle />
    </button>
  )
}