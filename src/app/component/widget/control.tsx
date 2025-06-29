import { ReactSVG } from 'react-svg'
import { KeyboardAction, UIPointerAction, WidgetType } from '../../lib/widget/const'
import { SVGSpace, Circle, Pt, Color } from 'pts'
import { Ref, RefObject, useEffect, useRef } from 'react'
import { keyboardEventToKeyboardAction, mouseEventToPointerAction, mouseEventToSvgPoint } from '@lib/widget/graphics'
import { websiteBasePath } from '@api/const'
import StaticRef from '@lib/staticRef'

function controlImage(widgetType: string) {
  return `${websiteBasePath}/widgetIcon/${widgetType}.svg`
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
  function action(
    eventType: UIPointerAction | KeyboardAction, 
    loc: DOMPoint | undefined, 
    event: Event
  ) {
    space.clear()

    start()

    switch (type) {
      case WidgetType.Button:
        if (eventType === UIPointerAction.down) {
          onAction()
          iconSvg.current?.classList.remove('up')
          iconSvg.current?.classList.add('down')
        }
        else if (eventType === UIPointerAction.up) {
          iconSvg.current?.classList.remove('down')
          iconSvg.current?.classList.add('up')
        }
        break

      case WidgetType.Lever:
        // capture dragstart + dragend beyond min length
        const minLength = Math.min(space.innerBound.width, space.innerBound.height) * 0.5
        let length

        if (eventType === UIPointerAction.down) {
          pStart = new Pt(loc!.x, loc!.y)
          pEnd = undefined
        }
        else if (eventType === UIPointerAction.move && pStart) {
          pEnd = new Pt(loc!.x, loc!.y)
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

        if (pStart) {
          if (isLong) {
            iconSvg.current?.classList.add('pull2')
            iconSvg.current?.classList.remove('rest', 'pull1')
          }
          else {
            iconSvg.current?.classList.add('pull1')
            iconSvg.current?.classList.remove('rest', 'pull2')
          }
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
        // capture keydown matching widget control character
        let char = iconSvg.current?.getAttribute('data-char')
        if (char === (event as KeyboardEvent).key) {
          if (eventType === KeyboardAction.down) {
            onAction()
            iconSvg.current?.classList.remove(UIPointerAction.up)
            iconSvg.current?.classList.add(UIPointerAction.down)
          }
          else if (eventType === KeyboardAction.up) {
            iconSvg.current?.classList.remove(UIPointerAction.down)
            iconSvg.current?.classList.add(UIPointerAction.up)
          }
        }
        break

      case WidgetType.Path:
        // TODO fetch canvas overlay and capture max distance between sample points along control path and drag path

      case WidgetType.KeyPad:
        // TODO capture keyup sequence from document
      
      default:
        console.log(`error widget action not supported for type=${type}`)
    }
  }
  space.add({ 
    // start,
    action: (t,x,y,e) => action(t as UIPointerAction, new DOMPoint(x, y), e)
  })

  // enable event listeners
  const listenerAbortController = new AbortController()

  if (type === WidgetType.Button || type === WidgetType.Lever || type === WidgetType.Twist || type === WidgetType.Path) {
    function onMouseWrapper(e: MouseEvent | TouchEvent) {
      action(mouseEventToPointerAction(e), mouseEventToSvgPoint(svg, e), e)
    }
    svg.addEventListener('mousemove', onMouseWrapper, {signal: listenerAbortController.signal})
    svg.addEventListener('touchmove', onMouseWrapper, {signal: listenerAbortController.signal})
    svg.addEventListener('mousedown', onMouseWrapper, {signal: listenerAbortController.signal})
    svg.addEventListener('touchstart', onMouseWrapper, {signal: listenerAbortController.signal})
    svg.addEventListener('mouseup', onMouseWrapper, {signal: listenerAbortController.signal})
    svg.addEventListener('touchend', onMouseWrapper, {signal: listenerAbortController.signal})
  }
  if (type === WidgetType.Key || type === WidgetType.KeyPad) {
    function onKeyWrapper(e: KeyboardEvent) {
      e.preventDefault()
      e.stopPropagation()
      action(keyboardEventToKeyboardAction(e), undefined, e)
    }
    document.body.addEventListener('keydown', onKeyWrapper, {signal: listenerAbortController.signal})
    document.body.addEventListener('keyup', onKeyWrapper, {signal: listenerAbortController.signal})
  }
  svg.addEventListener('contextmenu', (e) => {e.preventDefault()}, {signal: listenerAbortController.signal})

  space.play()

  return listenerAbortController
}

function disableAction(listenerAbortController: AbortController) {
  // removes all input event listeners used for widget actions  
  listenerAbortController.abort()
}

export default function WidgetControl(
  {type, onClick, onAction, active, valueText, showValueText, color, showColor, width, showWidth}: {
    type: WidgetType
    onClick?: () => void
    onAction?: () => void
    /**
     * Whether widget control is accepting actions from user input.
     */
    active: boolean
    valueText: string | undefined
    showValueText: RefObject<CallableFunction> | StaticRef<CallableFunction>
    color: string
    showColor: RefObject<CallableFunction> | StaticRef<CallableFunction>
    /**
     * Width of icon as percentage of available in row.
     */
    width: number
    showWidth: RefObject<CallableFunction> | StaticRef<CallableFunction>
  }
) {
  const iconSvg: Ref<SVGSVGElement> = useRef(null)
  const iconWrapper: Ref<HTMLDivElement> = useRef(null)
  const interactiveSvg: Ref<SVGSVGElement> = useRef(null)
  const interactAbortController: Ref<AbortController> = useRef(null)

  useEffect(
    () => {
      // enable and disable action
      if (onAction !== undefined && active && interactiveSvg.current) {
        interactAbortController.current = enableAction(type, interactiveSvg.current, onAction, iconSvg)
      }
      else if (!active && interactiveSvg.current && interactAbortController.current) {
        disableAction(interactAbortController.current)
      }
    },
    [ active ]
  )

  // show width changes
  showWidth.current = (width: number) => {
    if (iconWrapper.current) {
      iconWrapper.current.style.width = `${width}%`
    }
  }

  return (
    <div 
      onClick={onClick}
      className={
        `relative flex flex-row justify-center p-1 rounded-lg cursor-pointer `
        + `hover:bg-white/10 active:bg-white/30`
      } >
      {/* icon layer */}
      <div ref={iconWrapper}
        style={{
          width: `${width}%`
        }} >
        <ReactSVG 
          src={controlImage(type)}
          width={1} height={1}
          afterInjection={(svg) => {
            // update reference to icon svg
            iconSvg.current = svg
            
            // show color changes
            showColor.current = (color: string) => {
              // use primary color
              for (let el of svg.getElementsByClassName('fillPrimary') as HTMLCollectionOf<SVGElement>) {
                el.style.fill = color
              }
              // create secondary color as darker version of primary
              const colorSecondary = Color.RGBtoHSL(Color.fromHex(color))
              colorSecondary.l *= 0.5
              colorSecondary.toMode('rgb', true)
              for (let el of svg.getElementsByClassName('fillSecondary') as HTMLCollectionOf<SVGElement>) {
                el.style.fill = colorSecondary.hex
              }
            }
            showColor.current(color)

            // show valueText changes
            showValueText.current = (valueText: string | undefined) => {
              if (type === WidgetType.Key) {
                // update character from valueText
                svg.setAttribute('data-char', valueText || '')
                for (let el of svg.getElementsByClassName('char')) {
                  el.textContent = valueText || ''
                }
              }
            }
            showValueText.current(valueText)
          }} />
      </div>
      {/* interactive layer */}
      <svg className='absolute w-full h-full' ref={interactiveSvg} />
    </div>
  )
}