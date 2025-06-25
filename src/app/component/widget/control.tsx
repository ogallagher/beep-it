import { ReactSVG } from 'react-svg'
import { WidgetType } from '../../lib/widget/const'
import styles from './widget.module.css'
import { DragEventHandler } from 'react'

function controlImage(widgetType: string) {
  return 'vercel.svg'
}

export default function WidgetControl(
  {type, onClick, onAction, gameStarted}: {
    type: WidgetType,
    onClick?: () => void,
    onAction?: () => void,
    gameStarted: boolean
  }
) {
  let onDragStart: DragEventHandler<HTMLElement> | undefined
  let onDragEnd: DragEventHandler<HTMLElement> | undefined

  // enable widget action
  if (onAction !== undefined && gameStarted) {
    switch (type) {
      case WidgetType.Button:
        onClick = () => onAction()
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
  }

  return (
    <div 
      onClick={onClick}
      onDragStart={onDragStart} onDragEnd={onDragEnd}
      className={
        `${styles.WidgetControl} flex flex-row justify-center p-1 hover:bg-white/10 cursor-pointer`
      } >
      <ReactSVG 
        className='w-full'
        src={controlImage(type)}
        width={1} height={1} />
    </div>
  )
}