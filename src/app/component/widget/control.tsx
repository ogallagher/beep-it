import { ReactSVG } from 'react-svg'
import { UIPointerAction, WidgetType } from '../../lib/widget/const'
import styles from './widget.module.css'
import { IPlayer, SVGSpace, Circle } from 'pts'
import { Ref, RefObject, useEffect, useRef } from 'react'
import { mouseEventToPointerAction, mouseEventToSvgPoint } from '@lib/widget/graphics'

function controlImage(widgetType: string) {
  return `widgetIcon/${widgetType}.svg`
}

function enableAction(
  type: WidgetType, 
  svg: SVGSVGElement, 
  onAction: () => void,
  iconSvg: RefObject<SVGSVGElement | null>
) {
  const space = new SVGSpace(svg)
  space.setup({
    bgcolor: '#fff0',
    resize: true
  })

  const form = space.getForm()

  /**
   * Static graphics.
   */
  function start() {

  }
  /**
   * Dynamic graphics.
   * 
   * @param eventType Event type, one of UIPointerActions
   * @param loc Location.
   * @param event Event.
   */
  function action(eventType: UIPointerAction, loc: DOMPoint, event: Event) {
    space.clear()

    start()

    switch (type) {
      case WidgetType.Button:
        if (eventType === UIPointerAction.down || eventType === UIPointerAction.pointerdown) {
          onAction()
        }
        break

      case WidgetType.Lever:
        // TODO capture dragstart + dragend beyond min length
        break

      case WidgetType.Twist:
        // TODO capture dragstart + dragend in opposite quadrants around center

      case WidgetType.Key:
        // TODO capture keydown from document

      case WidgetType.Path:
        // TODO fetch canvas overlay and capture max distance between sample points along control path and drag path

      case WidgetType.KeyPad:
        // TODO capture keyup sequence from document
      
      default:
        console.log(`error widget action not supported for type=${type}`)
    }

    form.fill('red')
    form.circle(Circle.fromCenter([loc.x, loc.y], 10))
  }
  space.add({ 
    start,
    action: (t,x,y,e) => action(t as UIPointerAction, new DOMPoint(x, y), e)
  } as IPlayer)

  // enable event listeners
  const listenerAbortController = new AbortController()

  function onMouseWrapper(e: MouseEvent | TouchEvent) {
    // check action    
    action(mouseEventToPointerAction(e), mouseEventToSvgPoint(svg, e), e)

    // propagate to icon
    iconSvg.current!.dispatchEvent(new MouseEvent(e.type, e))
  }
  svg.addEventListener('mousemove', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('mousedown', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('touchstart', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('mouseup', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('touchend', onMouseWrapper, {signal: listenerAbortController.signal})

  space.play()

  return listenerAbortController
}

function disableAction(listenerAbortController: AbortController) {
  // removes all input event listeners used for widget actions  
  listenerAbortController.abort()
}

/**
 * Capture input events to make the icon graphic dynamic.
 */
function enableIcon(type: WidgetType, svg: SVGSVGElement) {
  function onDown() {
    svg.classList.remove(UIPointerAction.up)
    svg.classList.add(UIPointerAction.down)
  }
  svg.addEventListener('mousedown', onDown)
  svg.addEventListener('touchstart', onDown)

  function onUp() {
    svg.classList.remove(UIPointerAction.down)
    svg.classList.add(UIPointerAction.up)
  }
  svg.addEventListener('mouseup', onUp)
  svg.addEventListener('touchend', onUp)
}

export default function WidgetControl(
  {type, onClick, onAction, active}: {
    type: WidgetType
    onClick?: () => void
    onAction?: () => void
    /**
     * Whether widget control is accepting actions from user input.
     */
    active: boolean
  }
) {
  const iconSvg: Ref<SVGSVGElement> = useRef(null)
  const interactiveSvg: Ref<SVGSVGElement> = useRef(null)
  const interactAbortController: Ref<AbortController> = useRef(null)

  useEffect(
    () => {
      if (onAction !== undefined && active && interactiveSvg.current) {
        interactAbortController.current = enableAction(type, interactiveSvg.current, onAction, iconSvg)
      }
      else if (!active && interactiveSvg.current && interactAbortController.current) {
        disableAction(interactAbortController.current)
      }
    },
    [ active ]
  )

  return (
    <div 
      onClick={onClick}
      className={
        `${styles.WidgetControl} relative flex flex-row justify-center p-1 hover:bg-white/10 `
        + (active ? 'cursor-none' : 'cursor-pointer')
      } >
      <ReactSVG 
        className='w-full'
        src={controlImage(type)}
        width={1} height={1}
        afterInjection={(svg) => {
          iconSvg.current = svg
          enableIcon(type, svg)
        }} />

      {/* TODO switch back to canvas? */}
      <svg className='absolute w-full h-full' ref={interactiveSvg} />
    </div>
  )
}