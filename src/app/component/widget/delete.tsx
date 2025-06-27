import { XCircle } from 'react-bootstrap-icons'

export default function WidgetDelete(
  { widgetLabel, widgetId, onDelete, disabled }: {
    onDelete?: (id: string) => void
    widgetLabel: string
    widgetId: string
    disabled: boolean
  }
) {
  return (
    <div 
      className={disabled ? 'hidden' : ''} >
      <button type='button'
        className={
          'absolute top-0 right-0 m-2 cursor-pointer hover:scale-105 text-4xl '
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