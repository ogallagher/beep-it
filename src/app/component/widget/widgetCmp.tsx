import WidgetConfig, { Config } from './config/config'
import WidgetControl from './control'
import WidgetLabel from './label'
import StaticRef from '@lib/staticRef'
import { widgetActionMinDelay, WidgetExport } from '@lib/widget/const'
import WidgetDelete from './delete'
import Game from '@lib/game/game'
import { RefObject } from 'react'
import { ApiRoute, gameServerPort, websiteBasePath } from '@api/const'
import { DoWidgetEvent, GameEvent, GameEventType } from '@lib/game/gameEvent'

/**
 * Inputs to widget UI component.
 */
export interface WidgetParams {
  widget: WidgetExport
  labelEditable: boolean
  configurable: boolean
  onClick?: (params: WidgetExport) => void
  onDelete?: (id: string) => void
  className?: string
  game: RefObject<Game> | StaticRef<Game>
  deviceId: StaticRef<string> | RefObject<string>
}

/**
 * @param widgetParams 
 * @returns Widget UI component.
 */
export default function WidgetCmp(
  { widget, labelEditable, configurable, onClick, onDelete, className, game, deviceId }: WidgetParams
) {
  // something about how widgets can be dynamically added to the board
  // means I can't call useRef here
  const labelRef = new StaticRef(widget.label)
  /**
   * References to sources of truth that update game model.
   */
  const configRef = new StaticRef({
    command: widget.command,
    commandAudio: widget.commandAudio,
    color: widget.color,
    valueText: widget.valueText,
    width: widget.width
  } as Config)
  /**
   * Reference to callback that updates valueText in control icon.
   */
  const showValueText = new StaticRef<CallableFunction>(() => {})
  const showColor = new StaticRef<CallableFunction>(() => {})
  const showWidth = new StaticRef<CallableFunction>(() => {})
  const preventDoubleAction: StaticRef<string | undefined> = new StaticRef(undefined)
  const preventDoubleActionTimeout: StaticRef<number | undefined> = new StaticRef(undefined)

  /**
   * Action (button click, lever pull, knob twist) handler. Called when widget control detects a 
   * complete action matching the widget type.
   */
  async function onAction() {
    // send event to server
    const event: DoWidgetEvent = {
      gameEventType: GameEventType.DoWidget,
      gameId: game.current.id,
      deviceId: deviceId.current,
      widgetId: widget.id
    }

    if (preventDoubleAction.current === widget.id) {
      console.log(`ignore double action widget=${widget.id}`)
    }
    else {
      console.log(`action widget=${widget.id}`)
      preventDoubleAction.current = widget.id
      clearTimeout(preventDoubleActionTimeout.current)
      preventDoubleActionTimeout.current = window.setTimeout(
        () => { preventDoubleAction.current = undefined }, 
        widgetActionMinDelay
      )

      const requestParams = new URLSearchParams(Object.entries(event))
      try {
        const res = await fetch(
          `http://${window.location.hostname}:${gameServerPort}${websiteBasePath}/${ApiRoute.DoWidget}?${requestParams}`
        )
        const resEvent: GameEvent = await res.json()
        if (resEvent.gameEventType !== GameEventType.DoWidget) {
          console.log(`error invalid response ${resEvent}`)
        }
      }
      catch (err) {
        console.log(`error "${err}" on widget action ${event}`)
      }
    }
  }

  return (
    <div 
      key={widget.id} 
      className={
        'flex-1 relative bg-gray-500 m-1 px-4 py-2 rounded-lg '
        + (className === undefined ? '' : className)
      } >
      <div className='flex flex-col gap-2'>
        <WidgetLabel 
          widgetId={widget.id} game={game} deviceId={deviceId}
          valueRef={labelRef} 
          disabled={!labelEditable} />

        <WidgetConfig 
          widgetId={widget.id} widgetType={widget.type} game={game} deviceId={deviceId}
          configRef={configRef} showColor={showColor} showValueText={showValueText} showWidth={showWidth}
          disabled={!configurable} commandAudioEnabled={labelEditable} />

        <WidgetControl 
          type={widget.type}
          active={
            // currently we assume these states are always opposite
            !configurable
          }
          onClick={
            onClick === undefined ? undefined : () => {
              // persist widget config updates to export copy for click handler input
              widget.label = labelRef.current
              widget.command = configRef.current.command
              widget.color = configRef.current.color
              widget.valueText = configRef.current.valueText
              widget.width = configRef.current.width

              onClick(widget)
            }
          }
          onAction={onAction}
          color={configRef.current.color} showColor={showColor}
          valueText={configRef.current.valueText} showValueText={showValueText}
          width={configRef.current.width} showWidth={showWidth} />
      </div>

      <WidgetDelete 
          onDelete={onDelete} widgetLabel={labelRef.current} widgetId={widget.id}
          disabled={!configurable} />
    </div>
  )
}


