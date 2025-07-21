import { ReactSVG } from 'react-svg'
import { CardinalDirection, KeyboardAction, TraceDirection, UIPointerAction, WidgetConfig, WidgetType, widgetWaitProgressSteps } from '../../../_lib/widget/const'
import { SVGSpace, Circle, Pt, Color, Group, Curve } from 'pts'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import { cardinalDistance, curveToSvgPathD, cycleIndex, keyboardEventToKeyboardAction, mouseEventToPointerAction, mouseEventToSvgPoint, svgPathDToCurve } from '@lib/widget/graphics'
import { websiteBasePath } from '@api/const'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { GameStateListenerKey, TimeoutReference } from '@lib/game/const'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import { scrollLock, scrollUnlock } from '@lib/page'
import Grid from '@component/grid'
import ActionText from './actionText'
import { addKeyboardListener, KeyboardListener, removeKeyboardListener } from '@lib/keyboardDispatcher'
import { HasDeviceFeaturesCtx } from '@component/context'
import { addHasKeyboardListener, getHasKeyboard, getHasTouch, hasKeyboardDefault } from '@lib/deviceFeatures'

function controlImage(widgetType: string) {
  return `${websiteBasePath}/widgetIcon/${widgetType}.svg`
}

function enableResize(svg: SVGSVGElement) {
  const space = new SVGSpace(svg)
  space.setup({
    bgcolor: '#fff0',
    resize: true
  })
}

function enableKeyAction(
  onAction: (keyChar?: string) => void, 
  iconSvg: RefObject<SVGSVGElement|SVGSVGElement[]|null>,
  useKeyboard: boolean,
  useTouch: boolean
): KeyboardListener|AbortController {
  function getKeyIcons() {
    let keyIcons = iconSvg.current
    if (keyIcons) {
      if (!Array.isArray(keyIcons)) {
        keyIcons = [keyIcons]
      }

      return keyIcons
    }
    else {
      return undefined
    }
  }

  function keyDown(keyIcon: SVGSVGElement, char: string|undefined) {
    keyIcon.classList.remove(UIPointerAction.up)
    keyIcon.classList.add(UIPointerAction.down)
    onAction(char)
  }

  function keyUp(keyIcon: SVGSVGElement) {
    keyIcon.classList.remove(UIPointerAction.down)
    keyIcon.classList.add(UIPointerAction.up)
  }

  if (useKeyboard) {
    return (event: KeyboardEvent) => {
      const eventType = keyboardEventToKeyboardAction(event)
      // capture keydown matching widget control character
      let keyIcons = getKeyIcons()
      if (keyIcons) {
        for (const keyIcon of keyIcons) {
          const char = keyIcon.getAttribute('data-char')
          if (char === event.key) {
            if (eventType === KeyboardAction.down) {
              keyDown(keyIcon, char)
            }
            else if (eventType === KeyboardAction.up) {
              keyUp(keyIcon)
            }

            // key icons within same widget control should be unique, so only 1 can receive a single key event
            break
          }
        }
      }
    }
  }
  else {
    // simulate keyboard events with touch
    let keyIcons = getKeyIcons()
    const keyTouchAbortController = new AbortController()
    if (keyIcons) {
      for (const keyIcon of keyIcons) {
        function onMouseWrapper(e: MouseEvent | TouchEvent) {
          const eventType = mouseEventToPointerAction(e)

          if (eventType === UIPointerAction.down) {
            keyDown(keyIcon, keyIcon.getAttribute('data-char')!)
          }
          else if (eventType === UIPointerAction.up) {
            keyUp(keyIcon)
          }
        }
        
        if (useTouch) {
          keyIcon.addEventListener('touchstart', onMouseWrapper, {signal: keyTouchAbortController.signal})
          keyIcon.addEventListener('touchend', onMouseWrapper, {signal: keyTouchAbortController.signal})
        }
        else {
          keyIcon.addEventListener('mousedown', onMouseWrapper, {signal: keyTouchAbortController.signal})
          keyIcon.addEventListener('mouseup', onMouseWrapper, {signal: keyTouchAbortController.signal})
        }
      }
    }

    return keyTouchAbortController
  }
}

function enableAction(
  type: WidgetType, 
  svg: SVGSVGElement, 
  onAction: () => void,
  iconSvg: RefObject<SVGSVGElement|null>,
  useTouch: boolean
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
    p3 = new Pt(
      // p3.x = last reached index
      -1,
      // p3.y = direction (1 = from start, -1 = from end)
      TraceDirection.Unknown,
      // p3.z = space size
      0,
      // p3.w = icon source size
      parseInt(iconSvg.current!.getAttribute('viewBox')!.split(' ')[2]!)
    )

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
              const qx = loc!.x - origin.x
              const qy = loc!.y - origin.y

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

      case WidgetType.Path:
        if (p3 && !p3.z && g1) {
          // first time that space is ready
          p3.z = spaceSize

          // reduce to subset of points in control path
          const ctrlMinScreenDist = 25
          const scale = p3.z / p3.w
          const gCtrl = new Group(g1.p1)
          let p: Pt
          let ctrlDist: number

          for (let i=1; i<g1.length-1; i++) {
            p = g1[i]
            ctrlDist = p.$subtract(gCtrl.q1).magnitude() * scale
            if (ctrlDist > ctrlMinScreenDist) {
              gCtrl.push(p)
            }
          }
          gCtrl.push(g1.q1)

          g1 = gCtrl
        }

        // capture subset of control path points that are reached
        const maxDist = p3!.z * 0.2
        /**
         * Convert from icon source to interactive target.
         */
        const scale = p3!.z / p3!.w

        if (g1) {
          // render control path
          form.fillOnly('#000000aa')
          form.circles(g1.map(p => Circle.fromCenter(p.$multiply(scale), p3!.z * 0.01)))
        }
        
        if (g1 && p3 && eventType === UIPointerAction.down) {
          // begin drag path
          g2 = new Group()
          // neighbors for drag start are endpoints
          p1 = g1.p1.$multiply(scale)
          p2 = g1.q1.$multiply(scale)
          // last reached index is unknown
          p3.x = -1
          // direction is unknown
          p3.y = TraceDirection.Unknown
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
          let minDist: number
          let loop = true
          while (loop) {
            pIdx = undefined
            minDist = maxDist

            // select closest neighboring point from control path 
            const d1 = (p3.y !== TraceDirection.Forward) ? p1.$subtract(pStart).magnitude() : Number.MAX_VALUE
            const d2 = (p3.y !== TraceDirection.Backward) ? p2.$subtract(pStart).magnitude() : Number.MAX_VALUE

            if (d1 < minDist) {
              minDist = d1
              if (p3.x === -1) {
                // first reached is start endpoint
                p3.x = 0 + 1
                p3.y = TraceDirection.Forward
              }
              pIdx = cycleIndex(p3.x - 1, g1.length)
            }
            else if (d2 < minDist) {
              minDist = d2
              if (p3.x === -1) {
                // first reached is end endpoint
                p3.x = g1.length - 2
                p3.y = TraceDirection.Backward
              }
              pIdx = cycleIndex(p3.x + 1, g1.length)
            }
            
            if (pIdx !== undefined) {
              // last reached in pEnd
              pEnd = g1[pIdx].$multiply(scale)

              if (!p4[pIdx]) {
                // newly reached
                p4[pIdx] = 1

                // neighbors in p1,p2
                p1 = g1[cycleIndex(pIdx - 1, g1.length)].$multiply(scale)
                p2 = g1[cycleIndex(pIdx + 1, g1.length)].$multiply(scale)
                // last reached index in p3.x
                p3.x = pIdx

                // add last reached to drag path
                g2.push(pEnd)
              }
              else {
                // already reached
                loop = false
              }
            }
            else {
              loop = false
            }
          }

          // render drag path 
          const isTraced = g1.length === g2.length
          form.strokeOnly('#0092b8ff', p3.z * (isTraced ? 0.06 : 0.04), 'round', 'round')
          form.line(g2)
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
    if (useTouch) {
      svg.addEventListener('touchmove', onMouseWrapper, {signal: listenerAbortController.signal})
      svg.addEventListener('touchstart', onMouseWrapper, {signal: listenerAbortController.signal})
      svg.addEventListener('touchend', onMouseWrapper, {signal: listenerAbortController.signal})
    }
    else {
      svg.addEventListener('mousemove', onMouseWrapper, {signal: listenerAbortController.signal})
      svg.addEventListener('mousedown', onMouseWrapper, {signal: listenerAbortController.signal})
      svg.addEventListener('mouseup', onMouseWrapper, {signal: listenerAbortController.signal})
    }
  }
  if (type === WidgetType.Wait) {
    function onMouseWrapper(e: MouseEvent | TouchEvent) {
      action(mouseEventToPointerAction(e), mouseEventToSvgPoint(svg, e), e)
    }
    if (useTouch) {
      svg.addEventListener('touchstart', onMouseWrapper, {signal: listenerAbortController.signal})
    }
    else {
      svg.addEventListener('mousedown', onMouseWrapper, {signal: listenerAbortController.signal})
    }
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
          const dist = p.$subtract(value.q1).magnitude()
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
  const hasDeviceFeatures = useContext(HasDeviceFeaturesCtx)
  const hasKeyboard = useRef(hasDeviceFeatures ? getHasKeyboard() : hasKeyboardDefault)
  const iconSvg: RefObject<SVGSVGElement|SVGSVGElement[]|null> = useRef(
    type === WidgetType.KeyPad ? [] : null
  )
  const onIconReady: RefObject<CallableFunction|null> = useRef(null)
  const iconWrapper: RefObject<HTMLDivElement|null> = useRef(null)
  const interactiveSvg: RefObject<SVGSVGElement|null> = useRef(null)
  /**
   * Reference to abort controller that disables input events for the control icon.
   * Not used for keyboard events, which are managed by {@linkcode KeyboardDispatcher}.
   */
  const interactAbortController: RefObject<AbortController|null> = useRef(null)
  const inputAbortController: RefObject<AbortController|null> = useRef(null)
  const commandDelayInterval: RefObject<TimeoutReference> = useRef(undefined)

  function getValueChars(valueText: string|undefined): Set<string> {
    if (valueText === undefined) {
      return new Set()
    }
    return new Set(valueText.split(''))
  }
  const [
    /**
     * Characters from {@linkcode Widget#valueText} that are used for keypad.
     */
    valueChars, 
    setValueChars
  ] = useState(getValueChars(configRef.current.valueText))
  // show valueText changes in valueChars
  if (type === WidgetType.KeyPad) {
    showValueText.current = (valueText: string | undefined) => setValueChars(getValueChars(valueText))
  }
  const showActionChar = useRef(null as unknown as (c: string|undefined) => void)

  // update hasKeyboard
  useEffect(
    () => {
      if (hasDeviceFeatures && onAction !== undefined) {
        addHasKeyboardListener(`${WidgetControl.name}.${widgetId}`, () => {
          hasKeyboard.current = getHasKeyboard()
        })
      }
    },
    [hasDeviceFeatures]
  )
  
  // enable and disable interactive action
  useEffect(
    () => {
      const isKeyType = (type === WidgetType.Key || type === WidgetType.KeyPad)

      if (onAction !== undefined && active) {
        if (isKeyType) {
          // If isKeyType and !hasKeyboard, icons have touch handlers, which we cannot register until after 
          // all icons are rendered.
          onIconReady.current = () => {
            const keyControl = enableKeyAction(
              (type === WidgetType.Key ? onAction : showActionChar.current), 
              iconSvg, 
              hasKeyboard.current,
              getHasTouch()
            )

            if (hasKeyboard.current) {
              addKeyboardListener(
                (type === WidgetType.Key ? [configRef.current.valueText!] : valueChars),
                widgetId,
                keyControl as KeyboardListener
              )

              if (type === WidgetType.KeyPad) {
                showActionChar.current(undefined)
              }
            }
            else {
              interactAbortController.current = keyControl as AbortController
            }
          }
        }
        else if (interactiveSvg.current) {
          interactAbortController.current = enableAction(
            type, 
            interactiveSvg.current, 
            onAction, 
            iconSvg as RefObject<SVGSVGElement>,
            getHasTouch()
          )
        }
      }
      else if (!active) {
        if (isKeyType) {
          onIconReady.current = null
          removeKeyboardListener(widgetId)

          if (type === WidgetType.KeyPad) {
            showActionChar.current(undefined)
          }
        }

        if (interactAbortController.current) {
          disableInteraction(interactAbortController.current)
        }
      }
    },
    [ active, configRef, showActionChar, valueChars, hasKeyboard ]
  )
  
  // wait: render command delay progress
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

              animateProgress(iconSvg as RefObject<SVGSVGElement>, commandDelayInterval, game)
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
      const configCanInput = type === WidgetType.Path
      const configDoInput = configCanInput && (onAction !== undefined && configurable && !active)

      if (configCanInput) {
        if (inputAbortController.current) {
          disableInteraction(inputAbortController.current)
        }
      }
      
      if (interactiveSvg.current) {
        if (configDoInput) {
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
            iconSvg as RefObject<SVGSVGElement>
          )
        }
        else {
          enableResize(interactiveSvg.current)
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

    if (interactiveSvg.current) {
      window.dispatchEvent(new Event('resize'))
    }
  }

  function loadIconSvg(svg: SVGSVGElement, isSingular = true) {
    // update reference to icon svg
    if (isSingular) {
      iconSvg.current = svg
    }
    
    // show color changes
    showColor.current = (color: string) => {
      // use primary color
      for (const el of svg.getElementsByClassName('fillPrimary') as HTMLCollectionOf<SVGElement>) {
        el.style.fill = color
      }
      // create secondary color as darker version of primary
      const colorSecondary = Color.RGBtoHSL(Color.fromHex(color))
      colorSecondary.l *= 0.5
      colorSecondary.toMode('rgb', true)
      for (const el of svg.getElementsByClassName('fillSecondary') as HTMLCollectionOf<SVGElement>) {
        el.style.fill = colorSecondary.hex
      }
    }
    showColor.current(configRef.current.color)

    
    if (isSingular) {
      // show valueText changes for singular icon
      showValueText.current = (valueText: string | undefined) => {
        if (type === WidgetType.Key) {
          // update character from valueText
          svg.setAttribute('data-char', valueText || '')
          for (const el of svg.getElementsByClassName('char')) {
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

    if (onIconReady.current) {
      if (type === WidgetType.KeyPad) {
        // only ready after all char icons are loaded
        if ((iconSvg.current as SVGSVGElement[]).length === valueChars.size) {
          onIconReady.current()
        }
      }
      else {
        onIconReady.current()
      }
    }
  }

  return (
    <div className={className}>
      <div 
        onClick={onClick}
        className='relative flex flex-row flex-1 justify-center' >
        <div ref={iconWrapper}
          className={
            'flex flex-col justify-center '
            + (type === WidgetType.Path && onAction !== undefined && configurable && !active ? 'cursor-crosshair' : 'cursor-pointer')
          }
          style={{
            width: `${configRef.current.width}%`
          }} >
          {
            type !== WidgetType.KeyPad 
            ? (
              <>
                {/* icon layer */}
                <ReactSVG 
                  src={controlImage(type)}
                  width={1} height={1}
                  afterInjection={loadIconSvg} />
                
                {/* interactive layer */}
                {
                  type !== WidgetType.Key 
                  ? <svg 
                    className='absolute w-full h-full' 
                    ref={interactiveSvg} />
                  : undefined
                }
              </>
            )
            : (
              <>
                {/* icon grid */}
                <Grid viewportAspectRatio={1}>
                  {( () => {
                    iconSvg.current = []

                    return [...valueChars.keys()].map((valueChar) => (
                      <ReactSVG 
                        key={valueChar}
                        className='flex-1'
                        src={controlImage(WidgetType.Key)}
                        width={1} height={1}
                        afterInjection={svg => {
                          (iconSvg.current as SVGElement[]).push(svg)

                          svg.setAttribute('data-char', valueChar)
                          for (const el of svg.getElementsByClassName('char')) {
                            el.textContent = valueChar
                          }

                          return loadIconSvg(svg, false)
                        }} />
                    ))
                  } )()}
                </Grid>

                {/* show action text */}
                <ActionText
                  showActionChar={showActionChar}
                  configRef={configRef}
                  onAction={onAction!} />
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}