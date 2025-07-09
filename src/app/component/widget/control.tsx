import { ReactSVG } from 'react-svg'
import { CardinalDirection, KeyboardAction, UIPointerAction, WidgetType, widgetWaitProgressSteps } from '../../_lib/widget/const'
import { SVGSpace, Circle, Pt, Color } from 'pts'
import { Ref, RefObject, useEffect, useRef } from 'react'
import { cardinalDistance, keyboardEventToKeyboardAction, mouseEventToPointerAction, mouseEventToSvgPoint } from 'app/_lib/widget/graphics'
import { websiteBasePath } from '@api/const'
import StaticRef from 'app/_lib/staticRef'
import Game from 'app/_lib/game/game'
import { GameStateListenerKey, TimeoutReference } from 'app/_lib/game/const'

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
   * Static graphics. Generally not used, since {@linkcode iconSvg} is near static.
   */
  function start() {}

  let pStart: Pt | undefined
  let p1: Pt | undefined
  let p2: Pt | undefined
  let p3: Pt | undefined
  let p4: Pt | undefined
  let pEnd: Pt | undefined

  if (type === WidgetType.Lever) {
    // store lever direction as code point in p1.x
    p1 = new Pt((iconSvg.current?.getAttribute('data-direction') || CardinalDirection.Down).codePointAt(0)!, 0)
  }

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

    const spaceSize = Math.min(space.innerBound.width, space.innerBound.height)

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
        const minLength = spaceSize * 0.5
        let length

        if (eventType === UIPointerAction.down) {
          pStart = new Pt(loc!.x, loc!.y)
          pEnd = undefined
        }
        else if (eventType === UIPointerAction.move && pStart) {
          pEnd = new Pt(loc!.x, loc!.y)
          length = cardinalDistance(pStart, pEnd, p1!)
        }
        else if (eventType === UIPointerAction.up && pStart && pEnd) {
          length = cardinalDistance(pStart, pEnd, p1!)
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
          form.circle(Circle.fromCenter(pStart, spaceSize * 0.05))

          if (pEnd) {
            form.circle(Circle.fromCenter(pEnd, spaceSize * 0.08))
            
            if (isLong) {
              form.stroke('#0092b8aa', spaceSize * 0.05)
            }
            else {
              form.stroke(false)
            }
            
            form.line([pStart, pEnd])
          }
        }

        break

      case WidgetType.Twist:
        // capture drag points in 3/4 quadrants around central origin
        const origin = new Pt(space.innerBound.width/2, space.innerBound.height/2)
        let isTwisted = false
        let quadCount = 0
        const quadMin = 3

        if (eventType === UIPointerAction.down || eventType === UIPointerAction.move || eventType === UIPointerAction.up) {
          quadCount = (
            [p1, p2, p3, p4]
            .map(p => (p !== undefined ? 1 : 0) as number)
            .reduce((prev, curr) => prev + curr)
          )

          if (quadCount >= quadMin) {
            isTwisted = true
          }

          if (eventType === UIPointerAction.up) {
            if (isTwisted) {
              // submit action
              onAction()
            }

            // reset
            pStart = undefined; p1 = undefined; p2 = undefined; p3 = undefined; p4 = undefined; pEnd = undefined;
          }
          else {
            if (eventType === UIPointerAction.down) {
              pStart = new Pt(loc!.x, loc!.y)
            }
            else {
              pEnd = new Pt(loc!.x, loc!.y)
            }

            if (pStart) {
              let qx = loc!.x - origin.x
              let qy = loc!.y - origin.y

              // assign point to 1 of 4 quadrants, corresponding to 4 stored points
              if (qx > 0) {
                if (qy > 0) {
                  p1 = new Pt(1, 1)
                }
                else {
                  p4 = new Pt(1, -1)
                }
              }
              else {
                if (qy > 0) {
                  p2 = new Pt(-1, 1)
                }
                else {
                  p3 = new Pt(-1, -1)
                }
              }
            }
          }
        }
        
        // update rotate animation in icon
        iconSvg.current?.classList.remove(...iconSvg.current?.classList)
        iconSvg.current?.classList.add(`rotate${Math.min(quadCount, 3)}`)

        // draw
        if (pStart) {
          form.stroke(false)
          form.fill(isTwisted ? '#0092b8ff' : '#0082a8ff')
          // start
          form.circle(Circle.fromCenter(pStart, spaceSize * 0.05))

          if (pEnd) {
            // end
            form.circle(Circle.fromCenter(pEnd, spaceSize * 0.08))

            // arc
            form.fill(false)
            if (isTwisted) {
              form.stroke('#0092b8aa', spaceSize * 0.01)
            }
            else {
              form.stroke('#0082a8aa', spaceSize * 0.02)
            }
            
            if (quadCount < quadMin) {
              form.arc(pStart, spaceSize * 0.1, 0, quadCount/quadMin * 2*Math.PI)
            }
            else {
              form.circle(Circle.fromCenter(pStart, spaceSize * 0.1))
            }
          }
        }

        break

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

      case WidgetType.Wait:
        // any mistaken pointer input submits the action to end the game
        if (eventType === UIPointerAction.down) {
          onAction()
        }
        break
      
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
  if (type === WidgetType.Wait) {
    function onMouseWrapper(e: MouseEvent | TouchEvent) {
      action(mouseEventToPointerAction(e), mouseEventToSvgPoint(svg, e), e)
    }
    svg.addEventListener('mousedown', onMouseWrapper, {signal: listenerAbortController.signal})
    svg.addEventListener('touchstart', onMouseWrapper, {signal: listenerAbortController.signal})
  }
  svg.addEventListener('contextmenu', (e) => {e.preventDefault()}, {signal: listenerAbortController.signal})

  space.play()

  return listenerAbortController
}

function disableAction(listenerAbortController: AbortController) {
  // removes all input event listeners used for widget actions  
  listenerAbortController.abort()
}

function animateProgress(
  iconSvg: RefObject<SVGSVGElement|null>, 
  commandDelayInterval: RefObject<TimeoutReference>, 
  game: RefObject<Game> | StaticRef<Game>
) {
  const progressSteps: number[] = []

  function onProgress() {
    if (progressSteps.length < widgetWaitProgressSteps) {
      progressSteps.push(progressSteps.length + 1)
      iconSvg.current?.setAttribute('data-progress', progressSteps.join(' '))
    }
    else {
      // stop incrementing progress
      clearInterval(commandDelayInterval.current)
    }
  }

  onProgress()

  commandDelayInterval.current = setInterval(
    onProgress,
    game.current.getCommandDelay(true) / widgetWaitProgressSteps
  )
}

export default function WidgetControl(
  {widgetId, type, onClick, onAction, active, valueText, showValueText, color, showColor, width, showWidth, game, className}: {
    widgetId: string
    type: WidgetType
    onClick?: () => void
    onAction?: () => void
    /**
     * Whether widget control is accepting actions from user input.
     */
    active: boolean
    valueText: string | undefined
    /**
     * Reference to callback that updates valueText in control icon.
     */
    color: string
    showValueText: RefObject<CallableFunction> | StaticRef<CallableFunction>
    showColor: RefObject<CallableFunction> | StaticRef<CallableFunction>
    /**
     * Width of icon as percentage of available in row.
     */
    width: number
    showWidth: RefObject<CallableFunction> | StaticRef<CallableFunction>
    game: RefObject<Game> | StaticRef<Game>
    className?: string
  }
) {
  const iconSvg: RefObject<SVGSVGElement|null> = useRef(null)
  const iconWrapper: RefObject<HTMLDivElement|null> = useRef(null)
  const interactiveSvg: RefObject<SVGSVGElement|null> = useRef(null)
  const interactAbortController: RefObject<AbortController|null> = useRef(null)
  const commandDelayInterval: RefObject<TimeoutReference> = useRef(undefined)

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
  
  useEffect(
    () => {
      if (type === WidgetType.Wait) {
        if (active) {
          /**
           * Game state listener for last command widget, if self, will set an interval to render progress on icon.
           */
          function onCommand(commandWidgetId: string|undefined) {
            clearInterval(commandDelayInterval.current)

            if (commandWidgetId === widgetId) {
              // rotate the icon before animating progress
              if (iconWrapper.current) {
                try {
                  iconWrapper.current.style.transform = (
                    `rotate(${Math.random() * 360}deg)`
                  )
                }
                catch (err) {
                  console.log(`ERROR unable to rotate widget control icon before animating progress. ${err}`)
                }
              }

              animateProgress(iconSvg, commandDelayInterval, game)
            }
          }
          onCommand(game.current.getCommandWidgetId())

          game.current.addStateListener(
            GameStateListenerKey.CommandWidgetId, 
            `${WidgetControl.name}.${widgetId}`,
            onCommand
          )
        }
        else {
          clearInterval(commandDelayInterval.current)
        }
      }
    },
    [ game, active ]
  )

  // show width changes
  showWidth.current = (width: number) => {
    if (iconWrapper.current) {
      iconWrapper.current.style.width = `${width}%`
    }
  }

  function loadIconSvg(svg: SVGSVGElement) {
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
      else if (type === WidgetType.Lever) {
        svg.setAttribute('data-direction', valueText?.toUpperCase() || CardinalDirection.Down)
      }
    }
    showValueText.current(valueText)
  }

  return (
    <div className={className}>
      <div 
        onClick={onClick}
        className={
          `relative flex flex-row flex-1 justify-center cursor-pointer`
        } >
        {/* icon layer */}
        <div ref={iconWrapper}
          className='flex flex-col justify-center'
          style={{
            width: `${width}%`
          }} >
          <ReactSVG 
            src={controlImage(type)}
            width={1} height={1}
            afterInjection={loadIconSvg} />
        </div>
        {/* interactive layer */}
        <svg className='absolute w-full h-full' ref={interactiveSvg} />
      </div>
    </div>
  )
}