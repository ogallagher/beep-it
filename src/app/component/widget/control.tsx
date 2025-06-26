import { ReactSVG } from 'react-svg'
import { UIPointerAction, WidgetType } from '../../lib/widget/const'
import styles from './widget.module.css'
import { IPlayer, SVGSpace, Circle, Pt, Line } from 'pts'
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
  function start() {}

  let pStart: Pt | undefined
  let pEnd: Pt | undefined

  /**
   * Dynamic graphics.
   * 
   * @param eventType Event type, one of UIPointerActions
   * @param loc Location.
   * @param event Event.
   */
  function action(eventType: UIPointerAction, loc: DOMPoint, _event: Event) {
    space.clear()

    start()

    switch (type) {
      case WidgetType.Button:
        if (eventType === UIPointerAction.down) {
          onAction()
          iconSvg.current?.classList.remove(UIPointerAction.up)
          iconSvg.current?.classList.add(UIPointerAction.down)
        }
        else if (eventType === UIPointerAction.up) {
          iconSvg.current?.classList.remove(UIPointerAction.down)
          iconSvg.current?.classList.add(UIPointerAction.up)
        }
        break

      case WidgetType.Lever:
        // capture dragstart + dragend beyond min length
        const minLength = space.innerBound.width * 0.5
        let length

        if (eventType === UIPointerAction.down) {
          pStart = new Pt(loc.x, loc.y)
          pEnd = undefined
        }
        else if (eventType === UIPointerAction.move && pStart) {
          pEnd = new Pt(loc.x, loc.y)
          length = pEnd.$subtract(pStart).magnitude()
        }
        else if (eventType === UIPointerAction.up && pStart && pEnd) {
          length = pEnd.$subtract(pStart).magnitude()
          if (length > minLength) {
            onAction()
          }
          pStart = undefined; pEnd = undefined
        }

        const isLong = (length || 0) > minLength

        if (isLong) {
          iconSvg.current?.classList.add('pull2')
          iconSvg.current?.classList.remove('rest', 'pull1')
        }
        else if (pEnd) {
          iconSvg.current?.classList.add('pull1')
          iconSvg.current?.classList.remove('rest', 'pull2')
        }
        else {
          iconSvg.current?.classList.add('rest')
          iconSvg.current?.classList.remove('pull1', 'pull2')
        }

        if (pStart) {
          form.stroke(false)
          form.fill(isLong ? '#0092b8ff' : '#0082a8ff')
          form.circle(Circle.fromCenter(pStart, space.innerBound.width * 0.05))

          if (pEnd) {
            form.circle(Circle.fromCenter(pEnd, space.innerBound.width * 0.08))
            
            if ((length || 0) > minLength) {
              form.stroke('#0092b8aa', space.innerBound.width * 0.05)
            }
            else {
              form.stroke(false)
            }
            
            form.line([pStart, pEnd])
          }
        }

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
  svg.addEventListener('touchmove', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('mousedown', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('touchstart', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('mouseup', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('touchend', onMouseWrapper, {signal: listenerAbortController.signal})
  svg.addEventListener('contextmenu', (e) => {e.preventDefault()}, {signal: listenerAbortController.signal})

  space.play()

  return listenerAbortController
}

function disableAction(listenerAbortController: AbortController) {
  // removes all input event listeners used for widget actions  
  listenerAbortController.abort()
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
        `${styles.WidgetControl} relative flex flex-row justify-center p-1 hover:bg-white/10 cursor-pointer`
      } >
      <ReactSVG 
        className='w-full'
        src={controlImage(type)}
        width={1} height={1}
        afterInjection={(svg) => {
          iconSvg.current = svg
        }} />

      {/* TODO switch back to canvas? */}
      <svg className='absolute w-full h-full' ref={interactiveSvg} />
    </div>
  )
}