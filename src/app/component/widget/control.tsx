import { ReactSVG } from 'react-svg'
import { UIPointerAction, WidgetType } from '../../lib/widget/const'
import styles from './widget.module.css'
import { IPlayer, SVGSpace, Circle, Polygon } from 'pts'
import { Ref, useEffect, useRef } from 'react'
import { mouseEventToSvgPoint } from '@lib/widget/graphics'

function controlImage(widgetType: string) {
  return 'vercel.svg'
}

function enableAction(type: WidgetType, svg: SVGSVGElement, onAction: () => void) {
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
    form.fill('green')
    form.polygon(Polygon.fromCenter(space.innerBound.center, space.innerBound.width/2 * 0.6, 3))
    form.fill('yellow')
    form.circle(Circle.fromCenter(space.innerBound.center, 10))
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
  svg.addEventListener('mousemove', (e) => {
    action(UIPointerAction.move, mouseEventToSvgPoint(svg, e), e)
  })
  svg.addEventListener('mousedown', (e) => {
    action(UIPointerAction.down, mouseEventToSvgPoint(svg, e), e)
  })
  // space.bindMouse().bindTouch()

  space.play()
}

export default function WidgetControl(
  {type, onClick, onAction, gameStarted}: {
    type: WidgetType
    onClick?: () => void
    onAction?: () => void
    gameStarted: boolean
  }
) {
  const interactiveSvg: Ref<SVGSVGElement> = useRef(null)

  useEffect(
    () => {
      if (onAction !== undefined && gameStarted && interactiveSvg.current) {
        enableAction(type, interactiveSvg.current, onAction)
      }
    },
    [ gameStarted ]
  )

  return (
    <div 
      onClick={onClick}
      className={
        `${styles.WidgetControl} relative flex flex-row justify-center p-1 hover:bg-white/10 `
        + (gameStarted ? 'cursor-none' : 'cursor-pointer')
      } >
      <ReactSVG 
        className='w-full'
        src={controlImage(type)}
        width={1} height={1}
        afterInjection={undefined} />
        {/* TODO switch back to canvas? */}
      <svg className='absolute w-full h-full' ref={interactiveSvg} />
    </div>
  )
}