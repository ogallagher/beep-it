import WidgetConfig from './config'
import WidgetControl from './control'
import WidgetLabel from './label'
import StaticRef from '@lib/staticRef'
import { WidgetExport } from '@lib/widget/const'
import WidgetDelete from './delete'

/**
 * Inputs to widget UI component.
 */
export interface WidgetParams {
  widget: WidgetExport
  labelEditable?: boolean
  configurable: boolean
  onClick?: (params: WidgetExport) => void
  onDelete?: (id: string) => void
  className?: string
}

/**
 * @param widgetParams 
 * @returns Widget UI component.
 */
export default function WidgetCmp(
  { widget, labelEditable, configurable, onClick, onDelete, className }: WidgetParams
) {
  // something about how widgets can be dynamically added to the board
  // means I can't call useRef here
  const labelRef = new StaticRef(widget.label)
  const configRef = new StaticRef({
    command: widget.command
  })

  return (
    <div 
      key={widget.id} 
      className={
        'flex-1 border border-white/10 border-solid '
        + (className === undefined ? '' : className)
      } >
      <WidgetControl 
        type={widget.type}
        onClick={
          onClick === undefined 
          ? undefined 
          : () => {
            widget.command = configRef.current.command
            onClick(widget)
          }
        }
        />

      <WidgetLabel 
        valueRef={labelRef} 
        disabled={!labelEditable} />

      <WidgetConfig 
        type={widget.type} 
        configRef={configRef}
        disabled={!configurable} />

      <WidgetDelete 
        onDelete={onDelete} widgetLabel={labelRef.current} widgetId={widget.id}
        disabled={!configurable} />
    </div>
  )
}


