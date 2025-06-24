import { ReactSVG } from 'react-svg'
import { WidgetType } from '../../lib/widget/const'
import styles from './widget.module.css'

function controlImage(widgetType: string) {
  return 'vercel.svg'
}

export default function WidgetControl(
  {type, onClick}: {
    type: WidgetType,
    onClick?: () => void
  }
) {
  return (
    <div 
      onClick={onClick}
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