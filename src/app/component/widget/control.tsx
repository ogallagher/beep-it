import { ReactSVG } from 'react-svg'
import { CardinalDirection, KeyboardAction, UIPointerAction, WidgetConfig, WidgetType, widgetWaitProgressSteps } from '../../_lib/widget/const'
import { SVGSpace, Circle, Pt, Color, Group, Curve } from 'pts'
import { RefObject, useEffect, useRef } from 'react'
import { cardinalDistance, curveToSvgPathD, cycleIndex, keyboardEventToKeyboardAction, mouseEventToPointerAction, mouseEventToSvgPoint, svgPathDToCurve } from 'app/_lib/widget/graphics'
import { websiteBasePath } from '@api/const'
import StaticRef from 'app/_lib/staticRef'
import Game from 'app/_lib/game/game'
import { GameStateListenerKey, TimeoutReference } from 'app/_lib/game/const'
import { clientSendConfigEvent, GameEventType } from 'app/_lib/game/gameEvent'
import { scrollLock, scrollUnlock } from 'app/_lib/page'

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
  let g1: Group | undefined
  let g2: Group | undefined

  if (type === WidgetType.Lever) {
    // store lever direction as code point in p1.x
    p1 = new Pt((iconSvg.current?.getAttribute('data-direction') || CardinalDirection.Down).codePointAt(0)!, 0)
  }
  else if (type === WidgetType.Path) {
    // store icon source size in p3.w
    p3 = new Pt(-1,-1,-1,-1)
    p3.w = parseInt(iconSvg.current!.getAttribute('viewBox')!.split(' ')[2]!)

    // store control path points in g1
    g1 = svgPathDToCurve(iconSvg.current!.getElementById('foreground').firstElementChild!.getAttribute('d')!)
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
    if (spaceSize < 1) {
      // space is not ready
      return
    }

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
        // capture subset of control path points that are reached
        const maxDist = spaceSize * 0.08
        /**
         * Convert from icon source to interactive target.
         */
        const scale = spaceSize / p3!.w

        if (g1) {
          // render control path
          form.stroke(false)
          form.fill('#000000aa')
          form.circles(g1.map(p => Circle.fromCenter(p.$multiply(scale), spaceSize * 0.01)))
        }
        
        if (g1 && p3 && eventType === UIPointerAction.down) {
          // begin drag path
          g2 = new Group()
          // neighbors for drag start are endpoints
          p1 = g1.p1.$multiply(scale)
          p2 = g1.q1.$multiply(scale)
          // last reached index is unknown
          p3.x = -1
          // reached point indeces in p4
          p4 = new Pt(new Array(g1.length))

          // render endpoints
          form.fill('#ff92b8ff')
          form.circles([p1, p2].map(p => Circle.fromCenter(p, spaceSize * 0.05)))
        }
        else if (g1 && g2 && p1 && p2 && p3 && p4 && eventType === UIPointerAction.move) {
          // pointer in pStart
          pStart = new Pt(loc!.x, loc!.y)

          /**
           * Index of newly reached control path point.
           */
          let pIdx: number | undefined
          let minDist = maxDist
          // select closest neighboring point from control path 
          let d1 = p1.$subtract(pStart).magnitude()
          let d2 = p2.$subtract(pStart).magnitude()

          if (d1 < minDist) {
            minDist = d1
            if (p3.x === -1) {
              p3.x = 0 + 1
            }
            pIdx = cycleIndex(p3.x - 1, g1.length)
          }
          else if (d2 < minDist) {
            minDist = d2
            if (p3.x === -1) {
              p3.x = g1.length - 2
            }
            pIdx = cycleIndex(p3.x + 1, g1.length)
          }
          
          if (pIdx !== undefined) {
            // last reached in pEnd
            pEnd = g1[pIdx].$multiply(scale)

            if (!p4[pIdx]) {
              p4[pIdx] = 1

              // neighbors in p1,p2
              p1 = g1[cycleIndex(pIdx - 1, g1.length)].$multiply(scale)
              p2 = g1[cycleIndex(pIdx + 1, g1.length)].$multiply(scale)
              // last reached index in p3.x
              p3.x = pIdx

              // add last reached to drag path
              g2.push(pEnd)
            }
          }

          // render drag path 
          form.fill('#0092b8ff')
          form.circles(g2.map(p => Circle.fromCenter(p, spaceSize * 0.02)))
        }
        else if (g1 && g2 && eventType === UIPointerAction.up) {
          if (g2.length === g1.length) {
            // every control path point was reached; submit action
            onAction()
          }
          
          // unset drag path
          g2 = undefined
        }
        
        break

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
    action: (t,x,y,e) => action(t as UIPointerAction | KeyboardAction, new DOMPoint(x, y), e)
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

/**
 * // TODO reduce duplicate code with `enableAction`.
 * 
 * @param type 
 * @param svg 
 * @param onInput 
 * 
 * @returns Event listeners abort controller.
 */
function enableInput(
  type: WidgetType, 
  svg: SVGSVGElement,
  onInput: (value: string) => void,
  iconSvg: RefObject<SVGSVGElement | null>
) {
  const space = new SVGSpace(svg)
  space.setup({
    bgcolor: '#fff0',
    resize: true
  })

  const form = space.getForm()
  
  /**
   * Min distance between control points in a spline curve, expressed as a proportion of the space size.
   */
  const pathStepMinCoeff = 0.05

  // create points instance to store path as value
  let value: Group | undefined

  function action(
    eventType: UIPointerAction | KeyboardAction, 
    loc: DOMPoint | undefined, 
    event: Event
  ) {
    space.clear()
    const spaceSize = Math.min(space.innerBound.width, space.innerBound.height)
    const pathStepMin = spaceSize * pathStepMinCoeff

    if (type === WidgetType.Path && loc) {
      const p = new Pt(loc.x, loc.y)

      if (eventType === UIPointerAction.down) {
        // down = define first point
        value = new Group(p)

        // lock scroll
        scrollLock()
      }
      else if (value && value.length > 0) {
        if (eventType === UIPointerAction.move) {
          // move = determine step length from last point; add point if exceeds step length
          let dist = p.$subtract(value.q1).magnitude()
          if (dist > pathStepMin) {
            value.push(p)
          }
        }
        else if (eventType === UIPointerAction.up) {
          // up = call onInput with value as svg.path.d
          if (value.length > 3) {
            const sourceSize = parseInt(iconSvg.current!.getAttribute('viewBox')!.split(' ')[2]!)
            onInput(curveToSvgPathD(value, spaceSize, sourceSize))
          }
          value = undefined

          // unlock scroll
          scrollUnlock()
        }
      }

      if (value && value.length > 0) {
        // render path 
        form.fill('#0092b8aa')
        form.stroke(false)
        form.circle(Circle.fromCenter(value.p1, spaceSize * 0.05))

        if (value.length > 1) {
          form.fill(false)
          form.stroke('#0092b8ff', spaceSize * 0.01, 'round', 'round')
          // pts renders curve as interpolated straight segments. This should be replaced with svg.path.d curve commands M,C,S.
          form.line(Curve.bezier(value, 10))
          // draw remainder if not enough points
          const remainderLength = (value.length-1) % 3
          form.line(value.slice(value.length-1 - remainderLength))
        }
      }
    }
  }
  space.add({ 
    // start,
    action: (t,x,y,e) => action(t as UIPointerAction, new DOMPoint(x, y), e)
  })

  // enable event listeners
  const listenerAbortController = new AbortController()

  if (type === WidgetType.Path) {
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
  svg.addEventListener('contextmenu', (e) => {e.preventDefault()}, {signal: listenerAbortController.signal})

  return listenerAbortController
}

function disableInteraction(listenerAbortController: AbortController) {
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
  {widgetId, type, onClick, onAction, active, configurable, configRef, showValueText, showColor, showWidth, game, deviceId, className}: {
    widgetId: string
    type: WidgetType
    onClick?: () => void
    onAction?: () => void
    /**
     * Whether widget control is accepting actions from user input.
     */
    active: boolean
    /**
     * Whether the widget control is accepting configuration from user input.
     */
    configurable: boolean
    configRef: RefObject<WidgetConfig> | StaticRef<WidgetConfig>
    /**
     * Reference to callback that updates valueText in control icon.
     */
    showValueText: RefObject<CallableFunction> | StaticRef<CallableFunction>
    showColor: RefObject<CallableFunction> | StaticRef<CallableFunction>
    showWidth: RefObject<CallableFunction> | StaticRef<CallableFunction>
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<string> | RefObject<string>
    className?: string
  }
) {
  const iconSvg: RefObject<SVGSVGElement|null> = useRef(null)
  const iconWrapper: RefObject<HTMLDivElement|null> = useRef(null)
  const interactiveSvg: RefObject<SVGSVGElement|null> = useRef(null)
  const interactAbortController: RefObject<AbortController|null> = useRef(null)
  const inputAbortController: RefObject<AbortController|null> = useRef(null)
  const commandDelayInterval: RefObject<TimeoutReference> = useRef(undefined)

  // enable and disable interactive action
  useEffect(
    () => {
      if (onAction !== undefined && active && interactiveSvg.current) {
        interactAbortController.current = enableAction(type, interactiveSvg.current, onAction, iconSvg)
      }
      else if (!active && interactiveSvg.current && interactAbortController.current) {
        disableInteraction(interactAbortController.current)
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
  
  // enable and disable interactive input
  useEffect(
    () => {
      if (type === WidgetType.Path) {
        if (inputAbortController.current) {
          disableInteraction(inputAbortController.current)
        }

        if (onAction !== undefined && configurable && !active && interactiveSvg.current) {
          inputAbortController.current = enableInput(
            type, 
            interactiveSvg.current, 
            (value: string) => {
              // update component icon
              showValueText.current(value)
              // update source of truth for game model updates
              configRef.current.valueText = value

              // update game model and persist to server
              const widget = game.current.config.widgets.get(widgetId)
              if (widget !== undefined) {
                widget.valueText = configRef.current.valueText
                clientSendConfigEvent({
                  gameEventType: GameEventType.Config,
                  gameId: game.current.id,
                  deviceId: deviceId.current,
                  widgets: [...game.current.config.widgets.values()]
                })

                game.current.setWidgets()
              }
            },
            iconSvg
          )
        }
      }
    },
    [ game, configRef, interactiveSvg, active, iconSvg ]
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
    showColor.current(configRef.current.color)

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
      else if (type === WidgetType.Path && valueText !== undefined) {
        svg.getElementById('foreground').firstElementChild?.setAttribute('d', valueText)
      }
    }
    showValueText.current(configRef.current.valueText)
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
            width: `${configRef.current.width}%`
          }} >
          <ReactSVG 
            src={controlImage(type)}
            width={1} height={1}
            afterInjection={loadIconSvg} />
          
          {/* interactive layer */}
          <svg className='absolute w-full h-full' ref={interactiveSvg} />
        </div>
      </div>
    </div>
  )
}