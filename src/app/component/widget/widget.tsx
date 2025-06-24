import { XCircle } from 'react-bootstrap-icons'
import WidgetConfig from './config'
import { defaultWidgetLabel, defaultWidgetCommands } from '../../lib/widget/const'
import WidgetControl from './control'
import WidgetLabel from './label'
import StaticRef from '@lib/staticRef'
import { WidgetExport } from '@lib/widget/widgetExport'

export interface WidgetParams extends WidgetExport {
  id: string
  labelEditable?: boolean
  onClick?: (params: WidgetParams) => void
  onDelete?: (id: string) => void
  className?: string
}

export default function Widget(
  { id, type, label, labelEditable, command, onClick, onDelete, className }: WidgetParams
) {
  // something about how widgets can be dynamically added to the board
  // means I can't call useRef here
  const labelRef = new StaticRef(label || defaultWidgetLabel(type))
  const configRef = new StaticRef({
    command: command || defaultWidgetCommands(type)[0]
  })

  return (
    <div 
      key={id} 
      className={
        'flex-1 border border-white/10 border-solid '
        + (className === undefined ? '' : className)
      } >
      <WidgetControl 
        type={type}
        onClick={
          onClick === undefined 
          ? undefined 
          : () => onClick({id, type, command: configRef.current.command})
        }
        />

      <WidgetLabel 
        valueRef={labelRef} 
        disabled={!labelEditable} />

      <WidgetConfig type={type} configRef={configRef} />

      <div className='w-full text-right'>
        <button type='button'
          className={
            'cursor-pointer hover:scale-105 text-4xl '
            + (onDelete === undefined ? 'hidden' : '')
          }
          title={`Remove ${label || id} from the board`}
          onClick={
            onDelete === undefined
            ? undefined
            : () => onDelete(id)
          } >
          <XCircle />
        </button>
      </div>
    </div>
  )
}


